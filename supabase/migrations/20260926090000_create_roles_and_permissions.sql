-- Role-based access for the admin panel.
-- Each staff member (a row in profiles) gets one role; a role is a named list
-- of "<resource>:<action>" permissions (see src/lib/access/permissions.ts).
-- Authorization is enforced in TypeScript (src/lib/admin-auth.ts); RLS below
-- is defense in depth only, so roles is service-role access only.

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text not null default '',
  permissions text[] not null default '{}',
  -- System roles (Super Admin) cannot be edited or deleted.
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roles enable row level security;

insert into public.roles (slug, name, description, permissions, is_system) values
  ('super_admin', 'Super Admin', 'Full access to everything, including users and roles.', '{}', true),
  ('editor', 'Content Editor', 'Manages packages, blog, testimonials and visa content. Cannot delete.',
    array[
      'packages:view','packages:create','packages:edit',
      'blog:view','blog:create','blog:edit',
      'testimonials:view','testimonials:create','testimonials:edit',
      'visa:view','visa:create','visa:edit'
    ], false),
  ('support', 'Support Agent', 'Handles enquiries, bookings and live chat.',
    array[
      'enquiries:view','enquiries:edit',
      'bookings:view','bookings:create','bookings:edit',
      'live_chat:view','live_chat:edit',
      'testimonials:view'
    ], false),
  ('viewer', 'Viewer', 'Read-only access to the content and inboxes.',
    array[
      'packages:view','enquiries:view','bookings:view','live_chat:view',
      'testimonials:view','visa:view','blog:view'
    ], false)
on conflict (slug) do nothing;

alter table public.profiles
  add column if not exists role_id uuid references public.roles (id) on delete restrict,
  add column if not exists is_active boolean not null default true;

-- Every existing admin keeps full access.
update public.profiles
set role_id = (select id from public.roles where slug = 'super_admin')
where role_id is null and role = 'admin';

-- Deactivated staff lose the chat realtime access as well.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;
