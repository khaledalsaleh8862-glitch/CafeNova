-- Supabase Database Schema for CafeNova (Updated)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Auth Users Table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  points integer default 0,
  created_at timestamp with time zone default now()
);

-- Users Table (for customer loyalty - no auth)
create table if not exists customers (
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
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tables Table
create table if not exists restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qr_code text not null unique,
  status text default 'available' check (status in ('available', 'occupied', 'reserved')),
  created_at timestamp with time zone default now()
);

-- Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_phone text,
  table_id uuid references restaurant_tables(id),
  table_name text not null,
  status text default 'pending' check (status in ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  total_price numeric(10, 2) not null,
  points_earned integer default 0,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Order Items Table
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  menu_item_name text not null,
  menu_item_price numeric(10, 2) not null,
  quantity integer not null default 1,
  subtotal numeric(10, 2) not null
);

-- Ads Table
create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  type text default 'internal' check (type in ('external', 'internal')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  position text default 'top' check (position in ('top', 'middle', 'bottom')),
  link text,
  views integer default 0,
  clicks integer default 0,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Points History Table
create table if not exists points_history (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  points integer not null,
  type text not null check (type in ('earned', 'redeemed')),
  order_id uuid references orders(id),
  description text,
  created_at timestamp with time zone default now()
);

-- RPC functions
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

create or replace function add_points(
  p_customer_id uuid,
  p_points integer,
  p_type text,
  p_order_id uuid default null,
  p_description text default null
)
returns void as $$
begin
  update customers set points = points + p_points where id = p_customer_id;
  insert into points_history (customer_id, points, type, order_id, description)
  values (p_customer_id, p_points, p_type, p_order_id, p_description);
end;
$$ language plpgsql security definer;

-- Enable Row Level Security
alter table profiles enable row level security;
alter table customers enable row level security;
alter table menu_items enable row level security;
alter table restaurant_tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ads enable row level security;
alter table points_history enable row level security;

-- RLS Policies
-- Public read access for menu, tables, ads
create policy "Anyone can read menu_items" on menu_items for select using (true);
create policy "Anyone can read restaurant_tables" on restaurant_tables for select using (true);
create policy "Anyone can read ads" on ads for select using (true);
create policy "Anyone can read orders" on orders for select using (true);
create policy "Anyone can read order_items" on order_items for select using (true);
create policy "Anyone can read customers" on customers for select using (true);
create policy "Anyone can read points_history" on points_history for select using (true);

-- Customer can update own profile
create policy "Customer can update own profile" on profiles
  for update using (auth.uid() = id);

-- Insert policies for authenticated app operations
create policy "Service can insert orders" on orders for insert with check (true);
create policy "Service can insert order_items" on order_items for insert with check (true);
create policy "Service can update orders" on orders for update using (true);
create policy "Service can insert customers" on customers for insert with check (true);
create policy "Service can update customers" on customers for update using (true);
create policy "Service can insert points_history" on points_history for insert with check (true);

-- Admin policies (requires authenticated role check in app)
create policy "Admin can do everything on menu_items" on menu_items
  for all using (true);
create policy "Admin can do everything on restaurant_tables" on restaurant_tables
  for all using (true);
create policy "Admin can do everything on ads" on ads
  for all using (true);
create policy "Admin can do everything on orders" on orders
  for all using (true);
create policy "Admin can do everything on order_items" on order_items
  for all using (true);

-- Trigger to create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'User'), 'customer');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Storage buckets (run these in Supabase Dashboard > Storage)
-- insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true);
-- insert into storage.buckets (id, name, public) values ('ad-images', 'ad-images', true);
-- insert into storage.buckets (id, name, public) values ('profile-images', 'profile-images', true);