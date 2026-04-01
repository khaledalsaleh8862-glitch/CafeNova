-- Supabase Database Schema for CafeNova

-- Users Table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  points integer default 0,
  created_at timestamp with time zone default now()
);

-- Menu Items Table
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  description text not null,
  price numeric(10, 2) not null,
  image_url text not null,
  category text not null,
  available boolean default true,
  created_at timestamp with time zone default now()
);

-- Tables Table
create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qr_code text not null unique,
  created_at timestamp with time zone default now()
);

-- Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  user_name text not null,
  table_id uuid references tables(id),
  table_name text not null,
  status text check (status in ('pending', 'preparing', 'ready', 'delivered')) default 'pending',
  total_price numeric(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Order Items Table
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity integer not null default 1
);

-- Ads Table
create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  type text check (type in ('external', 'internal')) not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  position text check (position in ('top', 'middle', 'bottom')) not null,
  link text,
  views integer default 0,
  clicks integer default 0,
  created_at timestamp with time zone default now()
);

-- RPC functions for incrementing ad stats
create or replace function increment_ad_views(ad_id uuid)
returns void as $$
begin
  update ads set views = views + 1 where id = ad_id;
end;
$$ language plpgsql security definer;

create or replace function increment_ad_clicks(ad_id uuid)
returns void as $$
begin
  update ads set clicks = clicks + 1 where id = ad_id;
end;
$$ language plpgsql security definer;

-- Row Level Security (RLS)
alter table users enable row level security;
alter table menu_items enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ads enable row level security;

-- Public read access policies (adjust as needed for your security requirements)
create policy "Public can read users" on users for select using (true);
create policy "Public can read menu_items" on menu_items for select using (true);
create policy "Public can read tables" on tables for select using (true);
create policy "Public can read orders" on orders for select using (true);
create policy "Public can read order_items" on order_items for select using (true);
create policy "Public can read ads" on ads for select using (true);

-- Insert policies for authenticated users (if using auth)
create policy "Authenticated users can insert orders" on orders for insert with check (true);
create policy "Authenticated users can insert order_items" on order_items for insert with check (true);