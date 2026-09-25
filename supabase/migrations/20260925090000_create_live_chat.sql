-- Live chat between website visitors (anonymous) and admins.
--
-- Visitors never talk to these tables directly: every visitor read/write goes
-- through Route Handlers using the service-role client, authorised by a random
-- per-session token (only its SHA-256 hash is stored here). Admins read via
-- Realtime `postgres_changes`, which respects RLS — hence the admin-only
-- select policies below. Admin writes also go through Route Handlers.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Only needed by the RLS policies below (evaluated as the signed-in user).
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_token_hash text not null unique,
  name text not null,
  email text not null,
  phone text not null,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'closed')),
  agent_id uuid references auth.users (id) on delete set null,
  agent_name text,
  ip_address text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  closed_at timestamptz,
  last_message_at timestamptz not null default now()
);

create index if not exists chat_sessions_status_last_message_idx
  on public.chat_sessions (status, last_message_at desc);

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  sender text not null check (sender in ('visitor', 'agent', 'system')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_id_idx
  on public.chat_messages (session_id, id);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

create policy "Admins can read chat sessions"
  on public.chat_sessions for select
  to authenticated
  using (public.is_admin());

create policy "Admins can read chat messages"
  on public.chat_messages for select
  to authenticated
  using (public.is_admin());

-- Stream inserts/updates to the admin panel.
alter publication supabase_realtime add table public.chat_sessions;
alter publication supabase_realtime add table public.chat_messages;
