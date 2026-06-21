<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# qanda.online — agent contract

The rules below are binding for any autonomous or assisted change. `CLAUDE.md`
imports this file, so it is the single source of truth for how agents work here.

## Project overview

**qanda.online** is a free, no-signup audience Q&A tool for live events
(conferences, webinars, lectures, meetups). Three surfaces:

- **Participant** — `/e/<CODE>`: join with a 6-char code, ask questions, upvote.
  No account, ever.
- **Presenter** — `/present/<CODE>`: big-screen view of top/answered questions.
- **Organizer** — authenticated dashboard: create events, brand them, moderate.

UI language is **Russian (RU-first)**. Every user-facing string is in Russian.

Stack: Next.js 16 (App Router, TS) + React 19 + Tailwind v4 + Supabase
(Postgres, Auth, Realtime, RLS). Rate limiting via Upstash Redis (no-op if unset).

## Architecture invariants (do not violate)

1. **Participants are anonymous.** Never add participant auth. Identity is a
   signed, httpOnly anon cookie (`lib/anon.ts`: `<uuid>.<hmac>`), used only to
   dedupe votes (`unique(question_id, anon_id)`) and attribute questions.
2. **Write path = trusted route handlers + service role.** Anonymous writes
   (submit question, vote) go through `app/api/*/route.ts` using
   `createAdminClient()` (service role, bypasses RLS) ONLY AFTER the server:
   (1) verifies/mints the anon token, (2) re-fetches the event and confirms
   `status === 'live'`, (3) validates the payload with the zod schema,
   (4) checks the rate limit (`lib/ratelimit`). New question status =
   `event.moderation === 'auto' ? 'approved' : 'pending'`. A non-empty
   `website` honeypot → return 200, insert nothing.
3. **Read path = browser anon client + Realtime, gated by RLS.** Participants
   and presenters read via the anon client and `postgres_changes` on
   `questions` filtered by `event_id`. RLS (`supabase/migrations/0002_rls.sql`)
   guarantees only `approved|answering|answered` rows of non-draft events are
   returned/streamed. There is **no anon INSERT/UPDATE policy**.
4. **`questions.vote_count` is the only count.** It is trigger-maintained
   (`0003_triggers.sql`). Read it directly; never sum votes client-side.
5. **RU-first.** All copy in Russian; code/identifiers in English.

## Commands

| Command                 | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `pnpm dev`              | Local dev server (http://localhost:3000)                  |
| `pnpm build`            | Production build (must pass WITHOUT secrets)              |
| `pnpm typecheck`        | `tsc --noEmit`                                             |
| `pnpm lint`             | ESLint (next config)                                      |
| `pnpm test`             | Unit tests — `vitest run tests/unit` (pure, always green) |
| `pnpm test:integration` | RLS tests — `vitest run tests/integration` (skips w/o env)|
| `pnpm e2e`              | Playwright participant path (skips w/o env)               |
| `pnpm format`           | Prettier write                                            |

**Gates** every change must pass: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

Code style: Prettier — no semicolons, single quotes, trailing commas, width 100,
2-space indent. Match the surrounding code.

## Hard rules for autonomous agents

- **Never push to `main`.** Work on a branch (`agent/<issue>`); land via a
  reviewed PR.
- **Never edit the human-gated paths without a human** (see the table below).
- **Every fix adds a failing-first regression test** — write the test, watch it
  fail, then fix, then watch it pass.
- **Minimal, single-purpose diffs.** No drive-by refactors.
- **One issue → one PR.** Cap of **3 open agent PRs** at a time.
- **Don't add dependencies** on your own — propose them in the PR for a human.
- **Build must stay secret-free** — keep data routes `force-dynamic`; don't read
  secrets at module load.

## Human-approval gates

These paths are security- or supply-chain-critical. An agent may *read* them and
*propose* changes, but a human must review/approve (enforced via `CODEOWNERS` +
branch protection). If a fix requires touching one of these, stop and label the
issue `needs-human`.

| Path / area                    | Why it's gated                              |
| ------------------------------ | ------------------------------------------- |
| `supabase/migrations/**`       | Schema + RLS — data-exposure risk           |
| `lib/supabase/**`              | Service-role client bypasses RLS            |
| `lib/anon.ts`                  | Anon token signing (ANON_SECRET)            |
| `proxy.ts`                     | Edge/proxy request handling                 |
| auth / sign-in flows           | Account security                            |
| `package.json`, `pnpm-lock.yaml` | Dependency supply chain                   |

## File map

```
app/
  page.tsx              Home (join form)
  e/[code]/             Participant room (RLS reads + realtime)
  present/[code]/       Presenter big-screen view
  api/
    questions/route.ts  Submit question (service-role write path)
    votes/route.ts      Vote (service-role write path)
    health/route.ts     Health check
lib/
  anon.ts               Anon token mint/verify (GATED)
  codes.ts              Join codes & slugs (alphabet excludes 0/1/O/I/L)
  schemas.ts            zod schemas (createEvent, submitQuestion, vote, branding, signIn)
  events.ts             getPublicEventByCode, listVisibleQuestions
  ratelimit.ts          allowQuestion / allowVote (Upstash; no-op if unset)
  qr.ts                 qrDataUrl (server-only)
  seo.ts                siteConfig, absoluteUrl
  utils.ts              cn, timeAgo
  env.ts                Centralized env access
  database.types.ts     Hand-maintained DB types (mirror migrations)
  supabase/             server / client / admin clients (GATED)
supabase/migrations/    0001_init · 0002_rls · 0003_triggers (GATED)
tests/
  unit/                 Pure unit tests (always run in CI)
  integration/rls.test.ts  RLS policy tests (skips without env)
  e2e/qa-loop.spec.ts   Participant happy path (skips without env)
.github/
  workflows/ci.yml          gates + guarded integration/e2e
  workflows/agent-loop.yml  scheduled autonomous loop (kill switch: AGENT_LOOP_ENABLED)
  CODEOWNERS                required reviews for gated paths
proxy.ts                Edge/proxy layer (GATED)
```

## Autonomous loop (summary)

`.github/workflows/agent-loop.yml` runs on a cron (every 4h) + manual dispatch.
**Kill switch:** it exits immediately unless the repo variable
`AGENT_LOOP_ENABLED == 'true'`. When on, it: enforces the 3-open-PR cap, picks
the top-priority open issue (`sev:high → sev:med → sev:low`, oldest first),
then (once the model token is wired) reproduces with a failing test, fixes,
runs the gates, and opens one PR linking the issue — never touching gated paths.
