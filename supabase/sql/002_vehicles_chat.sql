-- Orvia — Vehicles / Transport + AI Chat tables
-- Run in the Supabase SQL Editor (idempotent).
-- https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/sql/new

------------------------------------------------------------
-- 1) Vehicles (transport providers list their vehicles)
------------------------------------------------------------
create table if not exists public.vehicles (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  vehicle_type  text not null,                -- truck | pickup | van | tractor | motorbike
  title         text not null,
  capacity_kg   int  not null default 0,
  region        text,
  township      text,
  base_location text,
  price_note    text,                          -- e.g. "20,000 MMK / trip" — free text
  contact_phone text,
  is_available  boolean not null default true,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

grant select on public.vehicles to anon;
grant select, insert, update, delete on public.vehicles to authenticated;
grant all on public.vehicles to service_role;

alter table public.vehicles enable row level security;

drop policy if exists "vehicles_select_all" on public.vehicles;
create policy "vehicles_select_all" on public.vehicles
  for select using (true);

drop policy if exists "vehicles_insert_own" on public.vehicles;
create policy "vehicles_insert_own" on public.vehicles
  for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "vehicles_update_own" on public.vehicles;
create policy "vehicles_update_own" on public.vehicles
  for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "vehicles_delete_own" on public.vehicles;
create policy "vehicles_delete_own" on public.vehicles
  for delete to authenticated using (auth.uid() = owner_id);

------------------------------------------------------------
-- 2) Transport requests (farmer/buyer books a vehicle)
------------------------------------------------------------
create table if not exists public.transport_requests (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references public.vehicles(id) on delete cascade,
  requester_id  uuid not null references auth.users(id) on delete cascade,
  owner_id      uuid not null references auth.users(id) on delete cascade,
  pickup        text not null,
  dropoff       text not null,
  cargo         text,
  cargo_kg      int  not null default 0,
  needed_on     date,
  contact_phone text,
  status        text not null default 'pending', -- pending | accepted | rejected | done
  created_at    timestamptz not null default now()
);

grant select, insert, update on public.transport_requests to authenticated;
grant all on public.transport_requests to service_role;

alter table public.transport_requests enable row level security;

drop policy if exists "tr_select_party" on public.transport_requests;
create policy "tr_select_party" on public.transport_requests
  for select to authenticated using (auth.uid() = requester_id or auth.uid() = owner_id);

drop policy if exists "tr_insert_self" on public.transport_requests;
create policy "tr_insert_self" on public.transport_requests
  for insert to authenticated with check (auth.uid() = requester_id);

drop policy if exists "tr_update_party" on public.transport_requests;
create policy "tr_update_party" on public.transport_requests
  for update to authenticated using (auth.uid() = owner_id or auth.uid() = requester_id);

------------------------------------------------------------
-- 3) Chat threads + messages (Orvia AI assistant)
------------------------------------------------------------
create table if not exists public.chat_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New chat',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

grant select, insert, update, delete on public.chat_threads to authenticated;
grant all on public.chat_threads to service_role;

alter table public.chat_threads enable row level security;

drop policy if exists "ct_owner_all" on public.chat_threads;
create policy "ct_owner_all" on public.chat_threads
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.chat_threads(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null,           -- user | assistant | system
  parts       jsonb not null,          -- UIMessage parts
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_thread_created
  on public.chat_messages (thread_id, created_at);

grant select, insert, delete on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;

alter table public.chat_messages enable row level security;

drop policy if exists "cm_owner_select" on public.chat_messages;
create policy "cm_owner_select" on public.chat_messages
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "cm_owner_insert" on public.chat_messages;
create policy "cm_owner_insert" on public.chat_messages
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "cm_owner_delete" on public.chat_messages;
create policy "cm_owner_delete" on public.chat_messages
  for delete to authenticated using (auth.uid() = user_id);
