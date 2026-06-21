import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ANON_COOKIE, mintAnonToken, verifyAnonToken } from '@/lib/anon'
import { submitQuestionSchema } from '@/lib/schemas'
import { allowQuestion } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
}

/**
 * Anonymous participant submits a question.
 *
 * Trust pipeline (in order): resolve/mint the signed anon cookie → validate
 * payload → drop honeypot hits silently → re-fetch the event and require it to
 * be `live` → rate-limit per (event, anon) → insert with status derived from the
 * event's moderation mode. The service-role client is only reached after all of
 * these pass.
 */
export async function POST(request: NextRequest) {
  // 1) Anon identity. Mint a fresh one if the cookie is missing/forged, and set
  //    it on the response so the same participant is recognized next time.
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

  // 2) Payload.
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

  const parsed = submitQuestionSchema.safeParse(payload)
  if (!parsed.success) {
    return setCookie(
      Response.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid_input' },
        { status: 400 },
      ),
    )
  }

  // 3) Honeypot: a non-empty `website` means a bot. Accept-but-drop so the bot
  //    sees success and doesn't retry, but nothing is written.
  if (parsed.data.website) {
    return setCookie(Response.json({ ok: true }))
  }

  const admin = createAdminClient()

  // 4) Re-fetch the event server-side — the client never decides liveness.
  const { data: event } = await admin
    .from('events')
    .select('id, status, moderation')
    .eq('id', eventId)
    .maybeSingle()

  if (!event) {
    return setCookie(Response.json({ ok: false, error: 'not_found' }, { status: 404 }))
  }
  if (event.status !== 'live') {
    return setCookie(Response.json({ ok: false, error: 'event_not_live' }, { status: 403 }))
  }

  // 5) Rate limit per (event, anon).
  const allowed = await allowQuestion(`q:${eventId}:${anonId}`)
  if (!allowed) {
    return setCookie(Response.json({ ok: false, error: 'rate_limited' }, { status: 429 }))
  }

  // 6) Insert. Auto-moderation publishes immediately; pre-moderation queues.
  const status = event.moderation === 'auto' ? 'approved' : 'pending'
  const { data: question, error } = await admin
    .from('questions')
    .insert({
      event_id: eventId,
      body: parsed.data.body,
      author_name: parsed.data.authorName ?? null,
      status,
      anon_id: anonId,
    })
    .select('*')
    .single()

  if (error || !question) {
    return setCookie(Response.json({ ok: false, error: 'insert_failed' }, { status: 500 }))
  }

  return setCookie(Response.json({ ok: true, question }))
}
