-- 0004_anon_host.sql — instant, no-registration event creation.
--
-- A visitor can launch an event with NO signup. Such an event is created with a
-- NULL owner_id and a hashed "host secret". The raw secret is returned once, in
-- the private host link handed to the creator; it authorizes moderation and
-- presenter control through trusted route handlers (service-role key) — exactly
-- like the anonymous question/vote write-path. The creator can later "claim" the
-- event by signing in (magic link); claiming sets owner_id, after which the
-- normal authenticated dashboard + owner RLS policies take over.
--
-- Reads need NO policy change: events_select_public already exposes any non-draft
-- event (anonymous events launch straight to 'live'), and the branding/questions
-- public reads key off the same `status <> 'draft'` test.

-- Events may now be ownerless (anonymous host) until claimed.
alter table public.events
  alter column owner_id drop not null;

alter table public.events
  -- sha256(host secret); the raw secret is never stored — it lives in the link.
  add column host_secret_hash text,
  -- Contact captured AFTER launch ("save your event") for recovery + lifecycle
  -- email. This is NOT a login. NULL until the creator opts in.
  add column contact_email text
    check (contact_email is null or char_length(contact_email) <= 254),
  -- Set when an authenticated account claims this previously-anonymous event.
  add column claimed_at timestamptz;

-- Every event must be controllable by someone: a registered owner OR a host secret.
alter table public.events
  add constraint events_owner_or_host_chk
  check (owner_id is not null or host_secret_hash is not null);

-- Moderation route handlers resolve an anonymous event by its host secret hash.
create index events_host_secret_idx on public.events (host_secret_hash)
  where host_secret_hash is not null;
