import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ANON_COOKIE, mintAnonToken, verifyAnonToken } from '@/lib/anon'
import { voteSchema } from '@/lib/schemas'
import { allowVote } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
}

/**
 * Toggle an upvote on a question. One vote per (question, anon) — enforced by a
 * DB unique constraint and mirrored here as insert-or-delete. The DB trigger
 * keeps questions.vote_count in sync; we never compute counts here.
 */
export async function POST(request: NextRequest) {
  const jar = await cookies()
  let anonId = verifyAnonToken(jar.get(ANON_COOKIE)?.value)
  let mintedToken: string | null = null
  if (!anonId) {
    const minted = mintAnonToken()
    anonId = minted.anonId
    mintedToken = minted.token
  }

  const setCookie = (res: Response): Response => {
    if (mintedToken) jar.set(ANON_COOKIE, mintedToken, COOKIE_OPTS)
    return res
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return setCookie(Response.json({ ok: false, error: 'invalid_json' }, { status: 400 }))
  }

  const body = payload as { eventId?: unknown }
  const eventId = typeof body.eventId === 'string' ? body.eventId : ''
  if (!eventId) {
    return setCookie(Response.json({ ok: false, error: 'missing_event' }, { status: 400 }))
  }

  const parsed = voteSchema.safeParse(payload)
  if (!parsed.success) {
    return setCookie(Response.json({ ok: false, error: 'invalid_input' }, { status: 400 }))
  }
  const { questionId } = parsed.data

  // Rate limit per (event, anon).
  const allowed = await allowVote(`v:${eventId}:${anonId}`)
  if (!allowed) {
    return setCookie(Response.json({ ok: false, error: 'rate_limited' }, { status: 429 }))
  }

  const admin = createAdminClient()

  // The event must be live before any vote is accepted (the client never
  // decides this). Confirm in two cheap lookups rather than a typed embed,
  // since database.types declares no FK relationship to embed on.
  const { data: event } = await admin
    .from('events')
    .select('id, status')
    .eq('id', eventId)
    .maybeSingle()
  if (!event || event.status !== 'live') {
    return setCookie(Response.json({ ok: false, error: 'event_not_live' }, { status: 403 }))
  }

  // The question must exist and belong to this event.
  const { data: question } = await admin
    .from('questions')
    .select('id')
    .eq('id', questionId)
    .eq('event_id', eventId)
    .maybeSingle()
  if (!question) {
    return setCookie(Response.json({ ok: false, error: 'not_found' }, { status: 404 }))
  }

  // Toggle: delete if a vote already exists, otherwise insert.
  const { data: existing } = await admin
    .from('votes')
    .select('id')
    .eq('question_id', questionId)
    .eq('anon_id', anonId)
    .maybeSingle()

  if (existing) {
    const { error } = await admin.from('votes').delete().eq('id', existing.id)
    if (error) {
      return setCookie(Response.json({ ok: false, error: 'unvote_failed' }, { status: 500 }))
    }
    return setCookie(Response.json({ ok: true, voted: false }))
  }

  const { error } = await admin
    .from('votes')
    .insert({ question_id: questionId, event_id: eventId, anon_id: anonId })
  if (error) {
    return setCookie(Response.json({ ok: false, error: 'vote_failed' }, { status: 500 }))
  }
  return setCookie(Response.json({ ok: true, voted: true }))
}
