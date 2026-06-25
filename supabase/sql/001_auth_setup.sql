-- AgriAid AI — Authentication setup
-- Run this once in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/sql/new
--
-- Safe to re-run: all statements are idempotent.

------------------------------------------------------------
-- 1) App role enum
------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum
      ('farmer','buyer','trader','agribusiness','student','officer','admin');
  end if;
end$$;

------------------------------------------------------------
-- 2) Profiles table  (1:1 with auth.users)
------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  phone         text,
  region        text,
  township      text,
  preferred_language text default 'my',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

------------------------------------------------------------
-- 3) User roles
------------------------------------------------------------
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.app_role not null,
  is_primary  boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

------------------------------------------------------------
-- 4) Security-definer role check
------------------------------------------------------------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
     where user_id = _user_id and role = _role
  )
$$;

------------------------------------------------------------
-- 5) Auto-create profile + primary role on signup
------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  chosen_role public.app_role;
begin
  insert into public.profiles (id, display_name, phone, region, township, preferred_language)
  values (
    new.id,
    nullif(meta->>'display_name',''),
    nullif(meta->>'phone',''),
    nullif(meta->>'region',''),
    nullif(meta->>'township',''),
    coalesce(nullif(meta->>'preferred_language',''),'my')
  )
  on conflict (id) do nothing;

  begin
    chosen_role := coalesce(nullif(meta->>'role','')::public.app_role, 'farmer'::public.app_role);
  exception when others then
    chosen_role := 'farmer'::public.app_role;
  end;

  insert into public.user_roles (user_id, role, is_primary)
  values (new.id, chosen_role, true)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

------------------------------------------------------------
-- 6) Backfill for users that already exist without rows
------------------------------------------------------------
insert into public.profiles (id, display_name, preferred_language)
select u.id, coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email,'@',1)), 'my'
  from auth.users u
  left join public.profiles p on p.id = u.id
 where p.id is null;

insert into public.user_roles (user_id, role, is_primary)
select u.id,
       coalesce(nullif(u.raw_user_meta_data->>'role','')::public.app_role, 'farmer'::public.app_role),
       true
  from auth.users u
  left join public.user_roles r on r.user_id = u.id
 where r.user_id is null;
