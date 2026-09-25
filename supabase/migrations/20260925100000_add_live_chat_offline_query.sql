-- When no agent accepts a live chat in time, the visitor can leave a query.
-- It is stored as a chat message (kind = 'query') so it appears in the
-- conversation and triggers the admin panel's Realtime alerts, and the
-- session records when it was left so the list can flag it.

alter table public.chat_messages
  add column if not exists kind text not null default 'message'
  check (kind in ('message', 'query'));

alter table public.chat_sessions
  add column if not exists query_submitted_at timestamptz;
