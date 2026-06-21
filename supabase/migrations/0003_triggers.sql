-- 0003_triggers.sql — triggers + realtime publication.

-- Create a profile row automatically when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep questions.vote_count exact (the only count ever read/broadcast).
create or replace function public.sync_vote_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT') then
    update public.questions set vote_count = vote_count + 1 where id = new.question_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.questions set vote_count = greatest(vote_count - 1, 0) where id = old.question_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_vote_count on public.votes;
create trigger trg_sync_vote_count
  after insert or delete on public.votes
  for each row execute function public.sync_vote_count();

-- Realtime: stream question changes (RLS-filtered) to participant & presenter views.
-- Vote-count changes arrive as UPDATE events on the same question rows.
alter publication supabase_realtime add table public.questions;
