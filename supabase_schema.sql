-- =========================================================================
-- OM MOBILE & ELECTRONICS (Dhanore, Pune)
-- SUPABASE DATABASE INITIALIZATION SCHEMA
-- =========================================================================
-- Instructions:
-- 1. Create a free project at https://supabase.com
-- 2. Open the "SQL Editor" in your Supabase dashboard
-- 3. Paste this entire script and click "Run" (Ctrl + Enter)
-- 4. Copy your Project URL and anon public key from Project Settings -> API
-- 5. Paste them in your admin panel (/admin) under "Cloud Database Settings"
-- =========================================================================

-- 1. Create products table
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'smartphones',
  brand text not null default 'Apple',
  price numeric not null default 0,
  original_price numeric default 0,
  emi_per_month numeric default 0,
  rating numeric default 4.8,
  reviews integer default 0,
  tag text default 'New Arrival',
  tag_color text default 'bg-primary text-white',
  stock_status text default 'In Stock at Dhanore Showroom',
  image text default '',
  description text default '',
  specs jsonb default '{}'::jsonb,
  colors text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create hero banners table
create table if not exists public.banners (
  id text primary key,
  image text not null,
  title text default '',
  subtitle text default '',
  tag text default 'Showroom',
  link text default '#products',
  active boolean default true,
  display_order integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create customer queries / leads table
create table if not exists public.queries (
  id text primary key,
  product_id text,
  product_name text not null,
  product_brand text default '',
  product_price numeric default 0,
  product_image text default '',
  customer_name text not null,
  customer_phone text not null,
  message text default '',
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.queries enable row level security;

-- 5. Create Public Access Policies
-- Products
drop policy if exists "Allow public read access" on public.products;
create policy "Allow public read access" on public.products for select using (true);
drop policy if exists "Allow anon insert" on public.products;
create policy "Allow anon insert" on public.products for insert with check (true);
drop policy if exists "Allow anon update" on public.products;
create policy "Allow anon update" on public.products for update using (true);
drop policy if exists "Allow anon delete" on public.products;
create policy "Allow anon delete" on public.products for delete using (true);

-- Banners
drop policy if exists "Allow public read banners" on public.banners;
create policy "Allow public read banners" on public.banners for select using (true);
drop policy if exists "Allow anon insert banners" on public.banners;
create policy "Allow anon insert banners" on public.banners for insert with check (true);
drop policy if exists "Allow anon update banners" on public.banners;
create policy "Allow anon update banners" on public.banners for update using (true);
drop policy if exists "Allow anon delete banners" on public.banners;
create policy "Allow anon delete banners" on public.banners for delete using (true);

-- Queries / Leads
drop policy if exists "Allow public read queries" on public.queries;
create policy "Allow public read queries" on public.queries for select using (true);
drop policy if exists "Allow anon insert queries" on public.queries;
create policy "Allow anon insert queries" on public.queries for insert with check (true);
drop policy if exists "Allow anon update queries" on public.queries;
create policy "Allow anon update queries" on public.queries for update using (true);
drop policy if exists "Allow anon delete queries" on public.queries;
create policy "Allow anon delete queries" on public.queries for delete using (true);

-- 6. Enable Supabase Realtime broadcast
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.banners;
alter publication supabase_realtime add table public.queries;

-- 7. Storage Bucket for Media
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public Access to product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Anon upload to product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');
