-- BabaSwift AppStore Phase 1 schema
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('user', 'developer', 'admin');
create type public.app_status as enum ('draft', 'published', 'rejected', 'flagged');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'user',
  email text not null,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  package_name text not null unique,
  version text not null,
  description text,
  tags text[] not null default '{}',
  privacy_policy_url text,
  apk_url text,
  icon_url text,
  status public.app_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_versions (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  version_name text not null,
  version_code integer,
  apk_url text,
  apk_size bigint,
  changelog text,
  created_at timestamptz not null default now()
);

create table public.app_screenshots (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  developer_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_id, user_id)
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger apps_set_updated_at
before update on public.apps
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, email, username)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'user'),
    new.email,
    nullif(new.raw_user_meta_data ->> 'username', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.apps enable row level security;
alter table public.app_versions enable row level security;
alter table public.app_screenshots enable row level security;
alter table public.reviews enable row level security;
alter table public.downloads enable row level security;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles can read own profile"
on public.profiles for select
using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "admins manage profiles"
on public.profiles for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "categories are public"
on public.categories for select
using (true);

create policy "admins manage categories"
on public.categories for all
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "published apps are public"
on public.apps for select
using (status = 'published' or developer_id = auth.uid() or public.current_role() = 'admin');

create policy "developers create own apps"
on public.apps for insert
with check (
  developer_id = auth.uid()
  and public.current_role() in ('developer', 'admin')
);

create policy "developers update own apps"
on public.apps for update
using (developer_id = auth.uid() or public.current_role() = 'admin')
with check (developer_id = auth.uid() or public.current_role() = 'admin');

create policy "app versions follow app access"
on public.app_versions for select
using (
  exists (
    select 1 from public.apps
    where apps.id = app_versions.app_id
      and (apps.status = 'published' or apps.developer_id = auth.uid() or public.current_role() = 'admin')
  )
);

create policy "developers manage own app versions"
on public.app_versions for all
using (
  exists (
    select 1 from public.apps
    where apps.id = app_versions.app_id
      and (apps.developer_id = auth.uid() or public.current_role() = 'admin')
  )
)
with check (
  exists (
    select 1 from public.apps
    where apps.id = app_versions.app_id
      and (apps.developer_id = auth.uid() or public.current_role() = 'admin')
  )
);

create policy "screenshots follow app access"
on public.app_screenshots for select
using (
  exists (
    select 1 from public.apps
    where apps.id = app_screenshots.app_id
      and (apps.status = 'published' or apps.developer_id = auth.uid() or public.current_role() = 'admin')
  )
);

create policy "developers manage own screenshots"
on public.app_screenshots for all
using (
  exists (
    select 1 from public.apps
    where apps.id = app_screenshots.app_id
      and (apps.developer_id = auth.uid() or public.current_role() = 'admin')
  )
)
with check (
  exists (
    select 1 from public.apps
    where apps.id = app_screenshots.app_id
      and (apps.developer_id = auth.uid() or public.current_role() = 'admin')
  )
);

create policy "reviews are public"
on public.reviews for select
using (true);

create policy "users write own reviews"
on public.reviews for insert
with check (user_id = auth.uid());

create policy "users update own reviews"
on public.reviews for update
using (user_id = auth.uid() or public.current_role() = 'admin')
with check (user_id = auth.uid() or public.current_role() = 'admin');

create policy "admins read downloads"
on public.downloads for select
using (public.current_role() = 'admin');

create policy "download logs can be created by app"
on public.downloads for insert
with check (true);

insert into public.categories (name, slug, description)
values
  ('Games', 'games', 'Action, simulation, casual, and multiplayer games.'),
  ('Productivity', 'productivity', 'Tools for work, focus, and organization.'),
  ('Education', 'education', 'Learning apps, courses, and reference tools.'),
  ('Social', 'social', 'Communities, chat, and creator apps.'),
  ('Entertainment', 'entertainment', 'Video, audio, media, and streaming apps.'),
  ('Tools', 'tools', 'Utilities, security, launchers, and device helpers.')
on conflict (slug) do nothing;

