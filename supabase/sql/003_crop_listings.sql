-- AgriMarket — Crop listings
-- Run in the Supabase SQL Editor (idempotent).

create table if not exists public.crop_listings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  crop_name       text not null,
  quantity        numeric not null default 0,
  unit            text not null,                  -- kg | ton | basket | viss
  price_per_unit  numeric not null default 0,
  currency        text not null default 'MMK',
  region          text not null,
  township        text not null,
  contact         text not null,
  description     text,
  image_paths     text[] not null default '{}',
  delivery_option text,                            -- delivery | pickup | null
  harvest_date    date,
  created_at      timestamptz not null default now()
);

create index if not exists crop_listings_created_idx
  on public.crop_listings (created_at desc);

grant select on public.crop_listings to anon;
grant select, insert, update, delete on public.crop_listings to authenticated;
grant all on public.crop_listings to service_role;

alter table public.crop_listings enable row level security;

drop policy if exists "cl_select_all" on public.crop_listings;
create policy "cl_select_all" on public.crop_listings
  for select using (true);

drop policy if exists "cl_insert_own" on public.crop_listings;
create policy "cl_insert_own" on public.crop_listings
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "cl_update_own" on public.crop_listings;
create policy "cl_update_own" on public.crop_listings
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cl_delete_own" on public.crop_listings;
create policy "cl_delete_own" on public.crop_listings
  for delete to authenticated using (auth.uid() = user_id);

-- Storage bucket policies for crop-images (bucket must be created via dashboard or tooling)
drop policy if exists "crop_images_read" on storage.objects;
create policy "crop_images_read" on storage.objects
  for select using (bucket_id = 'crop-images');

drop policy if exists "crop_images_insert_own" on storage.objects;
create policy "crop_images_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'crop-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "crop_images_update_own" on storage.objects;
create policy "crop_images_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'crop-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "crop_images_delete_own" on storage.objects;
create policy "crop_images_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'crop-images' and auth.uid()::text = (storage.foldername(name))[1]);
