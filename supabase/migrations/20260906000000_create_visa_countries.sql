create table if not exists public.visa_countries (
  id bigint generated always as identity primary key,
  name text not null,
  code text not null,
  slug text not null unique,
  region text not null check (region in ('Middle East', 'Asia', 'Europe', 'Africa', 'Americas', 'Oceania')),
  flag text not null default '',
  description text,
  requirements jsonb not null default '[]',
  processing_time text,
  price text,
  image text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.visa_countries enable row level security;

-- Defense-in-depth only: primary authorization lives in TypeScript
-- (see src/lib/admin-auth.ts). All writes go through the service-role
-- client in Route Handlers, which bypasses RLS entirely — this SELECT
-- policy exists only in case a direct anon-key read path is ever added,
-- and it only ever exposes rows the admin has marked active.
create policy "Active visa countries are viewable by everyone"
  on public.visa_countries for select
  using (is_active = true);
