-- =========================================================================
-- OM MOBILE & ELECTRONICS (Dhanore, Pune)
-- SAFE SUPABASE MIGRATION (Idempotent & Safe to Run Anytime)
-- =========================================================================

-- 1. Create Tables if they don't exist
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

-- 2. Grant table access permissions to anon, authenticated, and service_role
grant all on table public.queries to anon, authenticated, service_role;
grant all on table public.banners to anon, authenticated, service_role;

-- 3. Enable Row Level Security (RLS)
alter table public.queries enable row level security;
alter table public.banners enable row level security;

-- 4. Public Policies for Queries (Allows visitors to submit, admin to manage)
drop policy if exists "Allow public read queries" on public.queries;
create policy "Allow public read queries" on public.queries for select using (true);

drop policy if exists "Allow anon insert queries" on public.queries;
create policy "Allow anon insert queries" on public.queries for insert with check (true);

drop policy if exists "Allow anon update queries" on public.queries;
create policy "Allow anon update queries" on public.queries for update using (true);

drop policy if exists "Allow anon delete queries" on public.queries;
create policy "Allow anon delete queries" on public.queries for delete using (true);

-- 5. Public Policies for Banners
drop policy if exists "Allow public read banners" on public.banners;
create policy "Allow public read banners" on public.banners for select using (true);

drop policy if exists "Allow anon insert banners" on public.banners;
create policy "Allow anon insert banners" on public.banners for insert with check (true);

drop policy if exists "Allow anon update banners" on public.banners;
create policy "Allow anon update banners" on public.banners for update using (true);

drop policy if exists "Allow anon delete banners" on public.banners;
create policy "Allow anon delete banners" on public.banners for delete using (true);

-- 6. Safe Realtime Publication (Checks if already added so it never throws error 42710)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'queries'
  ) then
    alter publication supabase_realtime add table public.queries;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'banners'
  ) then
    alter publication supabase_realtime add table public.banners;
  end if;
end $$;
