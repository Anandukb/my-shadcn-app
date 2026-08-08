create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text not null,
  destination text,
  start_date date,
  end_date date,
  travelers integer,
  package_id bigint references public.packages (id),
  price numeric,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  enquiry_id bigint references public.enquiries (id),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- No permissive policies: bookings contain customer PII (name/email/phone).
-- All access goes through the service-role client in Route Handlers, which
-- bypasses RLS entirely. RLS is enabled purely as defense-in-depth in case
-- a direct anon-key path is ever added by mistake.
