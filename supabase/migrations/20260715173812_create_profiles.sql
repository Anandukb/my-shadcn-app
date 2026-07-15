-- Profiles table: 1:1 with Supabase Auth users, holds admin role/display name.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Defense-in-depth only: primary authorization lives in TypeScript
-- (see src/lib/admin-auth.ts). Authenticated users may read their own row;
-- no update policy is granted (see role self-escalation risk in review history).
create policy "Profiles are viewable by the owning user"
  on public.profiles for select
  using (auth.uid() = id);

-- Plumbing, not business logic: keeps profiles in sync 1:1 with auth.users so
-- every admin account created via Supabase Auth immediately has a profile row.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
