/**
 * RLS integration tests — exercise the real Postgres policies (supabase/migrations/0002_rls.sql)
 * against a live Supabase project.
 *
 * These are GUARDED: the whole suite skips itself unless the three env vars are
 * present, so CI without secrets stays green. To run locally:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   pnpm test:integration
 *
 * Strategy: the SERVICE-ROLE client (bypasses RLS) seeds and tears down fixture
 * rows; the ANON client (subject to RLS) is what we assert against. We need a
 * real owner profile because events.owner_id → profiles.id → auth.users.id, so
 * we create a throwaway auth user via the admin API and clean it up at the end.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const hasEnv = Boolean(URL && ANON_KEY && SERVICE_KEY)

const TAG = `rls-test-${Date.now()}`

describe.skipIf(!hasEnv)('questions RLS (anon)', () => {
  let admin: SupabaseClient
  let anon: SupabaseClient

  let ownerId = ''
  let liveEventId = ''
  let draftEventId = ''
  let approvedQId = ''
  let pendingQId = ''
  let draftApprovedQId = ''

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    anon = createClient(URL!, ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 1) A throwaway organizer (auth user → trigger creates the profile row).
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email: `${TAG}@example.test`,
      email_confirm: true,
    })
    if (userErr) throw userErr
    ownerId = created.user!.id

    // 2) A LIVE event and a DRAFT event owned by them.
    const { data: events, error: evErr } = await admin
      .from('events')
      .insert([
        {
          owner_id: ownerId,
          code: `LIVE${TAG.slice(-4).toUpperCase()}`,
          slug: `${TAG}-live`,
          title: 'RLS live event',
          status: 'live',
          moderation: 'pre',
        },
        {
          owner_id: ownerId,
          code: `DRFT${TAG.slice(-4).toUpperCase()}`,
          slug: `${TAG}-draft`,
          title: 'RLS draft event',
          status: 'draft',
          moderation: 'pre',
        },
      ])
      .select('id, status')
    if (evErr) throw evErr
    liveEventId = events!.find((e) => e.status === 'live')!.id
    draftEventId = events!.find((e) => e.status === 'draft')!.id

    // 3) Questions: approved+pending on the live event, approved on the draft.
    const { data: qs, error: qErr } = await admin
      .from('questions')
      .insert([
        { event_id: liveEventId, body: 'approved on live', status: 'approved', anon_id: TAG },
        { event_id: liveEventId, body: 'pending on live', status: 'pending', anon_id: TAG },
        { event_id: draftEventId, body: 'approved on draft', status: 'approved', anon_id: TAG },
      ])
      .select('id, event_id, status')
    if (qErr) throw qErr
    approvedQId = qs!.find((q) => q.event_id === liveEventId && q.status === 'approved')!.id
    pendingQId = qs!.find((q) => q.event_id === liveEventId && q.status === 'pending')!.id
    draftApprovedQId = qs!.find((q) => q.event_id === draftEventId)!.id
  }, 30_000)

  afterAll(async () => {
    if (!admin) return
    // events cascade-delete their questions; then drop the auth user.
    if (liveEventId) await admin.from('events').delete().eq('id', liveEventId)
    if (draftEventId) await admin.from('events').delete().eq('id', draftEventId)
    if (ownerId) await admin.auth.admin.deleteUser(ownerId)
  })

  it('anon CAN read an approved question of a live event', async () => {
    const { data, error } = await anon.from('questions').select('id').eq('id', approvedQId)
    expect(error).toBeNull()
    expect(data?.map((r) => r.id)).toContain(approvedQId)
  })

  it('anon CANNOT read a pending question (RLS filters it out)', async () => {
    const { data, error } = await anon.from('questions').select('id').eq('id', pendingQId)
    // RLS returns an empty set, not an error.
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('anon CANNOT read questions of a draft event (even if approved)', async () => {
    const { data, error } = await anon.from('questions').select('id').eq('id', draftApprovedQId)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('anon CANNOT insert a question (no INSERT policy → denied)', async () => {
    const { data, error } = await anon
      .from('questions')
      .insert({ event_id: liveEventId, body: 'sneaky direct insert', anon_id: 'attacker' })
      .select()
    // RLS rejects the write; nothing is returned.
    expect(error).not.toBeNull()
    expect(data).toBeNull()
  })

  it('anon CANNOT read a draft event row', async () => {
    const { data, error } = await anon.from('events').select('id').eq('id', draftEventId)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })
})
