-- 0001_init.sql — schema: enums, tables, indexes.
-- qanda.online — audience Q&A for live events. See AGENTS.md for invariants.

create extension if not exists pgcrypto;

create type event_status    as enum ('draft', 'live', 'closed', 'archived');
create type question_status as enum ('pending', 'approved', 'answering', 'answered', 'rejected');
create type moderation_mode as enum ('pre', 'auto');

-- Organizer profiles (1:1 with auth.users)
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Events
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  code       text not null unique,                       -- 6-char join code (see lib/codes.ts)
  slug       text not null unique,
  title      text not null check (char_length(title) between 1 and 80),
  subtitle   text check (char_length(subtitle) <= 120),
  status     event_status not null default 'draft',
  moderation moderation_mode not null default 'pre',     -- 'pre' = premoderate, 'auto' = auto-approve
  created_at timestamptz not null default now(),
  starts_at  timestamptz
);
create index events_owner_idx on public.events (owner_id);

-- Per-event branding (1:1 with events)
create table public.branding (
  event_id      uuid primary key references public.events (id) on delete cascade,
  logo_url      text,
  primary_color text check (primary_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Questions
create table public.questions (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 280),
  author_name text check (char_length(author_name) <= 40),    -- optional; null → "Аноним"
  status      question_status not null default 'pending',
  vote_count  int not null default 0,                          -- denormalized, trigger-maintained
  anon_id     text not null,                                   -- signed anonymous author id
  created_at  timestamptz not null default now()
);
create index questions_event_status_votes_idx on public.questions (event_id, status, vote_count desc);
create index questions_event_created_idx on public.questions (event_id, created_at desc);

-- Votes (one per anon per question)
create table public.votes (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  event_id    uuid not null references public.events (id) on delete cascade,  -- denormalized for RLS/perf
  anon_id     text not null,
  created_at  timestamptz not null default now(),
  unique (question_id, anon_id)
);
create index votes_question_idx on public.votes (question_id);
