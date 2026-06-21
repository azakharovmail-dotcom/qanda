import { expect, test } from '@playwright/test'

/**
 * Load-bearing end-to-end: the participant happy path.
 *
 * ── What this CANNOT cover, and why ──────────────────────────────────────
 * Organizer sign-in is a Supabase magic-link (passwordless email) flow. There
 * is no password to type and no automatable inbox in CI, so we cannot create
 * an event through the UI here. Covering the *organizer* side end-to-end would
 * require either a seeded session cookie or an email-catcher (e.g. Mailpit) —
 * out of scope for this guarded smoke test.
 *
 * ── What this DOES cover ─────────────────────────────────────────────────
 * Given a pre-existing LIVE event code in `QANDA_TEST_EVENT_CODE`, a real
 * participant: lands on the home page, joins via the code, sees the room, and
 * submits a question — and we assert the UI acknowledges it (the success
 * notice the app shows: "на модерацию" for pre-moderated, "опубликован" for
 * auto). The anon cookie is minted server-side on first write, so no auth is
 * needed for the participant.
 *
 * ── Skips ────────────────────────────────────────────────────────────────
 * • No Supabase env  → whole file skips (CI without secrets stays green).
 * • Env but no event → only the submit test skips; the home-page smoke runs.
 */

const HAS_ENV = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
const EVENT_CODE = process.env.QANDA_TEST_EVENT_CODE

test.skip(!HAS_ENV, 'needs Supabase env (set NEXT_PUBLIC_SUPABASE_URL to run e2e)')

test.describe('participant happy path', () => {
  test('home page renders the join form', async ({ page }) => {
    await page.goto('/')
    // The join input is labelled "Код события" (see components/join-form.tsx).
    await expect(page.getByLabel('Код события')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible()
  })

  test('join via code, submit a question, see acknowledgement', async ({ page }) => {
    test.skip(
      !EVENT_CODE,
      'set QANDA_TEST_EVENT_CODE to a LIVE event code to run the submit path',
    )

    // 1) Enter the code on the home page and submit the join form.
    await page.goto('/')
    await page.getByLabel('Код события').fill(EVENT_CODE!)
    await page.getByRole('button', { name: 'Войти' }).click()

    // 2) We should land in the room at /e/CODE (uppercased/normalized).
    await expect(page).toHaveURL(new RegExp(`/e/${EVENT_CODE!.toUpperCase()}$`))

    // 3) Compose a uniquely-identifiable question in the textarea.
    const unique = `e2e smoke ${Date.now()}`
    const editor = page.getByRole('textbox').first()
    await expect(editor).toBeVisible()
    await editor.fill(unique)

    // 4) Send it. The submit button posts to /api/questions.
    await page.getByRole('button', { name: /отправить|задать вопрос/i }).click()

    // 5) Assert the app acknowledged the write. Pre-moderated events show
    //    "на модерацию"; auto events show "опубликован". Accept either, plus
    //    the textarea clearing as a fallback signal of success.
    await expect(async () => {
      const ack = await page
        .getByText(/на модерацию|опубликован/i)
        .first()
        .isVisible()
        .catch(() => false)
      const cleared = (await editor.inputValue()) === ''
      expect(ack || cleared).toBe(true)
    }).toPass({ timeout: 10_000 })
  })
})
