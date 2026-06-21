-- 0002_rls.sql — Row Level Security. Deny-by-default.
--
-- WRITE-PATH INVARIANT (see AGENTS.md):
--   Anonymous participant WRITES (submit question, vote) do NOT go through RLS.
--   They are performed by trusted Next.js route handlers using the service-role
--   key, which bypasses RLS, AFTER the server validates the signed anon token,
--   event status ('live'), payload (zod), and rate limits.
--   The policies below therefore govern:
--     • public READS (incl. Supabase Realtime, which enforces RLS on the wire)
--     • organizer (authenticated) moderation writes, scoped to their own events.
--   No anon INSERT/UPDATE policies exist → the public anon key cannot write.

alter table public.profiles  enable row level security;
alter table public.events    enable row level security;
alter table public.branding  enable row level security;
alter table public.questions enable row level security;
alter table public.votes     enable row level security;

-- Table privileges (RLS still gates which ROWS are visible/affected)
grant select on public.events, public.branding, public.questions to anon;
grant select, insert, update, delete
  on public.events, public.branding, public.questions, public.votes, public.profiles
  to authenticated;

-- ── profiles: self only ────────────────────────────────────────────────
create policy profiles_select_self on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ── events ─────────────────────────────────────────────────────────────
-- Anyone may resolve a non-draft event (to render the join/presenter page).
-- Owners additionally see their own drafts.
create policy events_select_public on public.events
  for select to anon, authenticated
  using (status <> 'draft' or owner_id = (select auth.uid()));
create policy events_owner_write on public.events
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- ── branding ───────────────────────────────────────────────────────────
create policy branding_select_public on public.branding
  for select to anon, authenticated
  using (exists (
    select 1 from public.events e
    where e.id = branding.event_id and (e.status <> 'draft' or e.owner_id = (select auth.uid()))
  ));
create policy branding_owner_write on public.branding
  for all to authenticated
  using (exists (select 1 from public.events e where e.id = branding.event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e where e.id = branding.event_id and e.owner_id = (select auth.uid())));

-- ── questions ──────────────────────────────────────────────────────────
-- Public/anon: only moderated-visible questions of a non-draft event.
create policy questions_select_public on public.questions
  for select to anon, authenticated
  using (
    status in ('approved', 'answering', 'answered')
    and exists (select 1 from public.events e where e.id = questions.event_id and e.status <> 'draft')
  );
-- Owner: read & moderate every question of their own events (any status).
create policy questions_owner_select on public.questions
  for select to authenticated
  using (exists (select 1 from public.events e where e.id = questions.event_id and e.owner_id = (select auth.uid())));
create policy questions_owner_update on public.questions
  for update to authenticated
  using (exists (select 1 from public.events e where e.id = questions.event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e where e.id = questions.event_id and e.owner_id = (select auth.uid())));
create policy questions_owner_delete on public.questions
  for delete to authenticated
  using (exists (select 1 from public.events e where e.id = questions.event_id and e.owner_id = (select auth.uid())));
-- (No anon/authenticated INSERT policy → participant inserts go via service role.)

-- ── votes ──────────────────────────────────────────────────────────────
-- Counts are read off questions.vote_count, so anon needs no vote access.
-- Owners may read their event's raw votes (analytics/export).
create policy votes_owner_select on public.votes
  for select to authenticated
  using (exists (select 1 from public.events e where e.id = votes.event_id and e.owner_id = (select auth.uid())));
