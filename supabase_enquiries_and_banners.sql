-- =========================================================================
-- OM MOBILE & ELECTRONICS (Dhanore, Pune)
-- SUPABASE MIGRATION: CUSTOMER QUERIES & HERO BANNERS
-- =========================================================================
-- How to apply this migration:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project: "hfkhqoltplobqpwbptzc"
-- 3. In the left sidebar, click "SQL Editor"
-- 4. Paste this entire script into the query editor
-- 5. Click "Run" (or Ctrl + Enter)
-- =========================================================================

-- 1. Create Customer Queries Table (Stores leads submitted via [Inquire] button)
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

-- 2. Create Hero Banners Table (Stores auto-scrolling landing page slides)
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

-- 3. Enable Row Level Security (RLS)
alter table public.queries enable row level security;
alter table public.banners enable row level security;

-- 4. Public Access Policies for Queries (Allows storefront visitors to submit, admin to manage)
drop policy if exists "Allow public read queries" on public.queries;
create policy "Allow public read queries" on public.queries for select using (true);

drop policy if exists "Allow anon insert queries" on public.queries;
create policy "Allow anon insert queries" on public.queries for insert with check (true);

drop policy if exists "Allow anon update queries" on public.queries;
create policy "Allow anon update queries" on public.queries for update using (true);

drop policy if exists "Allow anon delete queries" on public.queries;
create policy "Allow anon delete queries" on public.queries for delete using (true);

-- 5. Public Access Policies for Banners
drop policy if exists "Allow public read banners" on public.banners;
create policy "Allow public read banners" on public.banners for select using (true);

drop policy if exists "Allow anon insert banners" on public.banners;
create policy "Allow anon insert banners" on public.banners for insert with check (true);

drop policy if exists "Allow anon update banners" on public.banners;
create policy "Allow anon update banners" on public.banners for update using (true);

drop policy if exists "Allow anon delete banners" on public.banners;
create policy "Allow anon delete banners" on public.banners for delete using (true);

-- 6. Enable Realtime Broadcasting (Instantly alerts admin when a new inquiry arrives)
alter publication supabase_realtime add table public.queries;
alter publication supabase_realtime add table public.banners;

-- 7. Insert Default Hero Banners if empty
insert into public.banners (id, image, title, subtitle, tag, link, active, display_order)
values
(
  'banner-1',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAUzoaOnkR2uywaR6oAASK8zBgqvFUOPQrzAMzcG0ep-ob1DLIXj9dSUA7npurEyT4gQLTlOeaS8xL57KETI17rCYZIiIOZ7V1yGeUOEF6aQpLb6GM9fmMCjGz6EAK3eD1oe5nrPdH_et49PKfDt_tCP77aLzPqilS6mwVso2Z46TdAR3Vmp5KzoTB78m9euzw1SblMGKyG5mACD-minhbaSzzhP4puq3YkILG4yOnjIhx1xzCQUA5CXQ',
  'OM Mobile & Electronics',
  'Dhanore Showroom • PCS Chowk, Alandi–Markal Road',
  'Official Showroom',
  '#products',
  true,
  1
),
(
  'banner-2',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
  'Flagship 5G Smartphones & Accessories',
  'Authorized Apple, Samsung, OnePlus & Vivo with Official Brand Warranty',
  'Latest Arrivals',
  '#products',
  true,
  2
),
(
  'banner-3',
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1600&q=80',
  'Laptops, Audio Gear & Smart TVs',
  '0% Downpayment Bajaj Finserv & TVS Credit EMI Options Available',
  '0% EMI Financing',
  '#products',
  true,
  3
)
on conflict (id) do nothing;
