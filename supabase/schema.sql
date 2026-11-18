-- Nuit Lumière Supabase schema
-- Run this file in Supabase SQL Editor before running seed.sql.

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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_method text not null check (shipping_method in ('nova_poshta', 'ukrposhta')),
  city text,
  branch text,
  postal_address text,
  payment_method text not null,
  payment_status text not null default 'pending',
  status text not null default 'new' check (status in ('new', 'processing', 'paid', 'shipped', 'cancelled')),
  currency text not null default 'UAH',
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_cost numeric(12, 2) not null default 0 check (shipping_cost >= 0),
  total numeric(12, 2) not null check (total >= 0),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Public catalog reads are needed by the storefront.
drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products for select
  to anon, authenticated
  using (true);

-- PROTOTYPE ONLY: the current Admin gate is client-side and does not create a
-- Supabase-authenticated session. These policies make its anon-key CRUD calls
-- work, but anyone who knows the public project URL/key can also modify products.
-- Before public production use, replace these with authenticated-admin RLS or a
-- server/Edge Function using a secret service-role key.
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

grant select, insert, update, delete on public.products to anon, authenticated;

-- Orders contain personal data. No anon policies are created for this table;
-- write/read access should be added through an authenticated server or Edge Function.
grant all on public.orders to service_role;
