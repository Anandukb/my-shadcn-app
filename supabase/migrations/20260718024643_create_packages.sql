create table if not exists public.packages (
  id bigint generated always as identity primary key,
  category text not null check (category in ('cruise', 'fixed-departure', 'holidays', 'kerala', 'medical')),
  slug text unique,
  price numeric not null,
  continent text not null,
  rating numeric not null default 5.0,
  reviews integer not null default 0,
  featured boolean not null default false,
  duration text not null,
  image text not null,
  group_size text,
  meals text,
  accommodation text,
  itinerary_file_url text,

  title_en text not null,
  title_ar text,
  description_en text not null,
  description_ar text,
  location_en text not null,
  location_ar text,

  includes jsonb not null default '[]',
  exclusions jsonb not null default '[]',
  cancellation_policy jsonb not null default '[]',
  pricing jsonb,
  offer_pricing jsonb,
  itinerary jsonb not null default '[]',
  departure_dates jsonb not null default '[]',
  flights jsonb not null default '[]',
  hotels jsonb not null default '[]',
  optional_tours jsonb not null default '[]',

  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.packages enable row level security;

-- Defense-in-depth only: primary authorization lives in TypeScript
-- (see src/lib/admin-auth.ts). All writes go through the service-role
-- client in Route Handlers, which bypasses RLS entirely — this SELECT
-- policy exists only in case a direct anon-key read path is ever added.
create policy "Packages are viewable by everyone"
  on public.packages for select
  using (true);
