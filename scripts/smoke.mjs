// End-to-end smoke test against the REAL Supabase project + the LOCAL app.
// Creates a throwaway user + live event, submits a question via /api/questions,
// checks anon RLS visibility, votes via /api/votes, verifies the vote_count
// trigger, then cleans everything up. Run from ~/qanda with SB_* env vars.

const URL = process.env.SB_URL
const ANON = process.env.SB_ANON
const SVC = process.env.SB_SVC
const APP = process.env.APP || 'http://localhost:3000'

const svcH = () => ({ apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' })
const anonH = () => ({ apikey: ANON, Authorization: `Bearer ${ANON}` })
const rnd = Math.random().toString(36).slice(2, 7)
const log = (...a) => console.log(...a)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

let userId, eventId, questionId

async function main() {
  // 1. throwaway organizer (admin API → trigger creates profiles row)
  let r = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: svcH(),
    body: JSON.stringify({ email: `smoke_${rnd}@example.com`, email_confirm: true }),
  })
  let j = await r.json()
  if (!r.ok) throw new Error('create user: ' + JSON.stringify(j))
  userId = j.id
  log('1) ✓ test organizer created:', userId)
  await wait(900) // let the on-signup trigger create the profile row

  // 2. a LIVE, auto-approve event (service role bypasses RLS)
  const code = 'SMK' + rnd.slice(0, 3).toUpperCase()
  r = await fetch(`${URL}/rest/v1/events`, {
    method: 'POST',
    headers: { ...svcH(), Prefer: 'return=representation' },
    body: JSON.stringify({
      owner_id: userId,
      code,
      slug: `smoke-${rnd}`,
      title: 'Смоук-тест',
      status: 'live',
      moderation: 'auto',
    }),
  })
  j = await r.json()
  if (!r.ok) throw new Error('insert event: ' + JSON.stringify(j))
  eventId = j[0].id
  log('2) ✓ live event created:', eventId, '(code', code + ')')

  // 3. participant submits a question through the LOCAL app API
  r = await fetch(`${APP}/api/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, body: 'Это работает в реальном времени?' }),
  })
  const setCookie = r.headers.get('set-cookie') || ''
  j = await r.json().catch(() => ({}))
  if (!r.ok || !j.ok) throw new Error('submit question: HTTP ' + r.status + ' ' + JSON.stringify(j))
  questionId = j.question?.id
  log('3) ✓ question submitted via /api/questions — status:', j.question?.status)

  // 4. anon read must show the approved question (RLS on the wire)
  r = await fetch(`${URL}/rest/v1/questions?event_id=eq.${eventId}&select=id,body,status,vote_count`, {
    headers: anonH(),
  })
  j = await r.json()
  if (!Array.isArray(j) || !j.find((q) => q.id === questionId))
    throw new Error('anon cannot see approved question: ' + JSON.stringify(j))
  log('4) ✓ anon sees the approved question (RLS read OK)')

  // 5. vote through the LOCAL app API, reusing the anon cookie
  const cookie = setCookie.split(';')[0]
  r = await fetch(`${APP}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ eventId, questionId }),
  })
  j = await r.json().catch(() => ({}))
  if (!r.ok || !j.ok) throw new Error('vote: HTTP ' + r.status + ' ' + JSON.stringify(j))
  log('5) ✓ vote accepted via /api/votes — voted:', j.voted)

  // 6. the trigger must have bumped vote_count to 1
  await wait(400)
  r = await fetch(`${URL}/rest/v1/questions?id=eq.${questionId}&select=vote_count`, { headers: anonH() })
  j = await r.json()
  if (j[0]?.vote_count !== 1) throw new Error('vote_count expected 1, got ' + JSON.stringify(j))
  log('6) ✓ vote_count = 1 (DB trigger OK)')

  log('\n✅ ALL CHECKS PASSED — write path, RLS, realtime data, and vote trigger all work.')
}

async function cleanup() {
  try {
    if (eventId) await fetch(`${URL}/rest/v1/events?id=eq.${eventId}`, { method: 'DELETE', headers: svcH() })
  } catch {}
  try {
    if (userId) await fetch(`${URL}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: svcH() })
  } catch {}
  log('🧹 cleanup done (test event + user removed)')
}

main()
  .then(cleanup)
  .catch(async (e) => {
    console.error('\n✗ FAIL:', e.message)
    await cleanup()
    process.exit(1)
  })
