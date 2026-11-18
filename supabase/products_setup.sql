-- Nuit Lumière products table setup
-- Run this in the Supabase SQL Editor for project ebauxpgfkryzyirwiezm.
-- The project's REST endpoint currently reports that public.products is missing.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null,
  year integer,
  family text,
  gender text not null check (gender in ('men', 'women', 'unisex')),
  notes text,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  volume_ml numeric(8, 2) check (volume_ml is null or volume_ml > 0),
  image_url text not null,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_in_stock_name_idx
  on public.products (in_stock, name);

alter table public.products enable row level security;

grant select, insert, update, delete on public.products to anon, authenticated;

drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products for select
  to anon, authenticated
  using (true);

-- The current Admin panel authenticates only in client-side code and has no
-- Supabase Auth session. These prototype policies permit its direct anon-key
-- CRUD requests. Anyone with the public URL and publishable key can therefore
-- change products. Replace these policies with authenticated-admin RLS or a
-- protected server/Edge Function before public production use.
drop policy if exists products_prototype_insert on public.products;
create policy products_prototype_insert
  on public.products for insert
  to anon, authenticated
  with check (true);

drop policy if exists products_prototype_update on public.products;
create policy products_prototype_update
  on public.products for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists products_prototype_delete on public.products;
create policy products_prototype_delete
  on public.products for delete
  to anon, authenticated
  using (true);
