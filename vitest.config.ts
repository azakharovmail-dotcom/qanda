import { defineConfig } from 'vitest/config'

// `@` resolves to the project root so tests can import '@/lib/...' exactly like
// the app does (mirrors tsconfig.json paths). `new URL('.', import.meta.url)`
// is the directory holding this config file = the repo root.
const root = new URL('.', import.meta.url).pathname

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Both suites are opt-in by path: `vitest run tests/unit` (pure, always
    // runnable) and `vitest run tests/integration` (skips itself without env).
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': root,
    },
  },
})
