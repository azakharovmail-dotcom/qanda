// Seeds a PERSISTENT demo event (live, branded, a few questions) for manual
// testing in the browser. Prints the join code + URL. Safe to delete later.
const URL = process.env.SB_URL
const SVC = process.env.SB_SVC
const APP = process.env.APP || 'http://localhost:3000'
const svcH = (extra = {}) => ({ apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json', ...extra })
const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  let r = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: svcH(),
    body: JSON.stringify({ email: `demo_${rnd.toLowerCase()}@example.com`, email_confirm: true }),
  })
  let j = await r.json()
  if (!r.ok) throw new Error('user: ' + JSON.stringify(j))
  const owner = j.id
  await wait(900)

  const code = 'DEMO' + rnd.slice(0, 2)
  r = await fetch(`${URL}/rest/v1/events`, {
    method: 'POST',
    headers: svcH({ Prefer: 'return=representation' }),
    body: JSON.stringify({
      owner_id: owner,
      code,
      slug: `demo-${rnd.toLowerCase()}`,
      title: 'Демо: Q&A для конференции',
      subtitle: 'Задайте вопрос спикеру — без регистрации',
      status: 'live',
      moderation: 'auto',
    }),
  })
  j = await r.json()
  if (!r.ok) throw new Error('event: ' + JSON.stringify(j))
  const eventId = j[0].id

  await fetch(`${URL}/rest/v1/branding`, {
    method: 'POST',
    headers: svcH(),
    body: JSON.stringify({ event_id: eventId, primary_color: '#4F6BFF' }),
  })

  const qs = [
    { body: 'Как вы пришли к такой архитектуре?', author_name: 'Аня', status: 'answering', vote_count: 12, anon_id: 'seed-1' },
    { body: 'Будет ли запись доклада?', author_name: null, status: 'approved', vote_count: 7, anon_id: 'seed-2' },
    { body: 'Какой стек вы используете в проде?', author_name: 'Игорь', status: 'approved', vote_count: 4, anon_id: 'seed-3' },
    { body: 'Как у вас устроена модерация вопросов?', author_name: 'Лена', status: 'approved', vote_count: 2, anon_id: 'seed-4' },
  ]
  await fetch(`${URL}/rest/v1/questions`, {
    method: 'POST',
    headers: svcH(),
    body: JSON.stringify(qs.map((q) => ({ ...q, event_id: eventId }))),
  })

  console.log('\n✅ Демо-событие создано')
  console.log('   Код:', code)
  console.log('   Участник:', `${APP}/e/${code}`)
  console.log('   Экран:   ', `${APP}/present/${code}`)
  console.log('   eventId: ', eventId)
}

main().catch((e) => {
  console.error('✗ seed FAIL:', e.message)
  process.exit(1)
})
