create table if not exists public.enquiries (
  id bigint generated always as identity primary key,
  type text not null check (type in ('contact', 'hotel_booking', 'hotel_search', 'book_now')),
  name text,
  email text not null,
  phone text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  package_id bigint references public.packages (id),
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

-- No permissive policies: enquiries contain customer PII (name/email/phone).
-- All access goes through the service-role client in Route Handlers, which
-- bypasses RLS entirely. RLS is enabled purely as defense-in-depth in case
-- a direct anon-key path is ever added by mistake — the default with zero
-- policies is deny-all for anon/authenticated roles, which is exactly what
-- we want here (unlike packages, nothing about enquiries should be public).

create table if not exists public.enquiry_rate_limits (
  ip_address text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key (ip_address, window_start)
);

alter table public.enquiry_rate_limits enable row level security;
