import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config. The suite is designed to be CI-safe WITHOUT secrets: every spec
 * calls `test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, ...)`, so a run with
 * no Supabase env reports green (all skipped) instead of failing.
 *
 * When env IS present we boot a production server (`pnpm build && pnpm start`)
 * and reuse an already-running dev server if one is up (local convenience).
 */
const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Only stand up a web server when there is something to test against;
  // otherwise the specs skip and we don't need a build at all.
  webServer: hasEnv
    ? {
        command: 'pnpm build && pnpm start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      }
    : undefined,
})
