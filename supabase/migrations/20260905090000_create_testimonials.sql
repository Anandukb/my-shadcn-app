create table if not exists public.testimonials (
  id bigint generated always as identity primary key,
  name text not null,
  place text not null,
  review_text text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

-- Defense-in-depth only: primary authorization lives in TypeScript
-- (see src/lib/admin-auth.ts). All writes go through the service-role
-- client in Route Handlers, which bypasses RLS entirely — this SELECT
-- policy exists only in case a direct anon-key read path is ever added,
-- and it only ever exposes rows the admin has marked active.
create policy "Active testimonials are viewable by everyone"
  on public.testimonials for select
  using (is_active = true);
