-- =====================================================
-- CafeNova - Production Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Drop existing tables (for clean setup)
drop table if exists points_history cascade;
drop table if exists invoices cascade;
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists ads cascade;
drop table if exists menu_items cascade;
drop table if exists tables cascade;
drop table if exists users cascade;

-- =====================================================
-- USERS TABLE
-- =====================================================
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null unique,
  role text default 'customer' check (role in ('customer', 'admin')),
  visits_count integer default 0,
  total_orders integer default 0,
  total_spent numeric(10, 2) default 0,
  points integer default 0,
  customer_level text default 'new' check (customer_level in ('new', 'regular', 'vip')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================================================
-- TABLES TABLE
-- =====================================================
create table tables (
  id uuid primary key default gen_random_uuid(),
  table_number text not null unique,
  qr_code text not null unique,
  qr_link text not null unique,
  status text default 'available' check (status in ('available', 'occupied', 'reserved')),
  created_at timestamp with time zone default now()
);

-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  description text not null default '',
  price numeric(10, 2) not null,
  image_url text not null default '',
  category text not null,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  user_name text not null,
  phone_number text,
  table_id uuid references tables(id) on delete set null,
  table_number text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  points_earned integer default 0,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  menu_item_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null default 1,
  total_price numeric(10, 2) not null
);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  invoice_number text not null unique,
  total numeric(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- ADS TABLE
-- =====================================================
create table ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  type text default 'internal' check (type in ('internal', 'external')),
  position text default 'top' check (position in ('top', 'middle', 'bottom')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  is_active boolean default true,
  views_count integer default 0,
  clicks_count integer default 0,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- POINTS HISTORY TABLE
-- =====================================================
create table points_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  points integer not null,
  type text not null check (type in ('earned', 'redeemed')),
  order_id uuid references orders(id) on delete set null,
  description text,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================
create or replace function increment_ad_views(ad_id uuid)
returns void as $$
begin
  update ads set views_count = views_count + 1 where id = ad_id;
end;
$$ language plpgsql security definer;

create or replace function increment_ad_clicks(ad_id uuid)
returns void as $$
begin
  update ads set clicks_count = clicks_count + 1 where id = ad_id;
end;
$$ language plpgsql security definer;

-- =====================================================
-- ROW LEVEL SECURITY (Disabled for development)
-- =====================================================
alter table users disable row level security;
alter table tables disable row level security;
alter table menu_items disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table invoices disable row level security;
alter table ads disable row level security;
alter table points_history disable row level security;

-- =====================================================
-- SAMPLE DATA - ADMIN USER
-- =====================================================
insert into users (full_name, phone_number, role, customer_level)
values ('Admin', 'admin', 'admin', 'vip');

-- =====================================================
-- SAMPLE DATA - TABLES
-- =====================================================
insert into tables (table_number, qr_code, qr_link, status) values
('1', 'qr_1', '/table/1', 'available'),
('2', 'qr_2', '/table/2', 'available'),
('3', 'qr_3', '/table/3', 'available'),
('4', 'qr_4', '/table/4', 'available'),
('5', 'qr_5', '/table/5', 'available'),
('6', 'qr_6', '/table/6', 'available'),
('VIP 1', 'qr_vip1', '/table/vip1', 'available'),
('VIP 2', 'qr_vip2', '/table/vip2', 'available');

-- =====================================================
-- SAMPLE DATA - MENU ITEMS
-- =====================================================
insert into menu_items (name, name_ar, description, price, image_url, category, is_active) values
('Espresso', 'إسبريسو', 'Rich and bold espresso shot', 3.50, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', 'Coffee', true),
('Cappuccino', 'كابتشينو', 'Espresso with steamed milk foam', 5.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 'Coffee', true),
('Latte', 'لاتيه', 'Smooth espresso with milk', 5.50, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400', 'Coffee', true),
('Iced Mocha', 'موخا مثلج', 'Chocolate espresso with cold milk', 6.00, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc39?w=400', 'Coffee', true),
('Matcha Latte', 'لاتيه ماتشا', 'Japanese green tea latte', 6.50, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400', 'Coffee', false),
('Fresh Orange Juice', 'عصير برتقال طازج', 'Freshly squeezed orange juice', 4.50, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 'Cold Drinks', true),
('Iced Lemon Tea', 'شاي ليمون مثلج', 'Refreshing lemon iced tea', 4.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 'Cold Drinks', true),
('Croissant', 'كرواسون', 'Buttery French pastry', 3.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 'Pastries', true),
('Chocolate Cake', 'كيك شوكولاتة', 'Rich chocolate layer cake', 7.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'Pastries', true),
('Cheesecake', 'تشيز كيك', 'Creamy New York style cheesecake', 8.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 'Pastries', true),
('Club Sandwich', 'ساندويتش كلوب', 'Triple-decker with chicken', 9.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', 'Food', true),
('Caesar Salad', 'سلطة سيزر', 'Romaine lettuce with caesar dressing', 8.00, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Food', true),
('Grilled Cheese', 'جبنة مشوية', 'Classic grilled cheese sandwich', 6.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', 'Food', true);

-- =====================================================
-- SAMPLE DATA - ADS
-- =====================================================
insert into ads (title, description, image_url, type, position, start_date, end_date, is_active) values
('Special Offer!', 'Get 20% off on all coffees today', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'internal', 'top', '2026-01-01', '2027-12-31', true),
('Buy 1 Get 1 Free', 'Buy any pastry, get another free', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 'internal', 'middle', '2026-01-01', '2027-12-31', true);

-- =====================================================
-- VERIFICATION
-- =====================================================
select 'Users: ' || count(*) from users;
select 'Tables: ' || count(*) from tables;
select 'Menu Items: ' || count(*) from menu_items;
select 'Ads: ' || count(*) from ads;
