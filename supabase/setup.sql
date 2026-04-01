-- =====================================================
-- CafeNova Database Setup (FIXED)
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- First, check what columns exist
-- If tables exist with wrong schema, we need to recreate

-- =====================================================
-- DROP EXISTING TABLES (if they exist with wrong schema)
-- =====================================================
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists ads cascade;
drop table if exists points_history cascade;
drop table if exists menu_items cascade;
drop table if exists restaurant_tables cascade;
drop table if exists customers cascade;

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  points integer default 0,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- RESTAURANT TABLES TABLE
-- =====================================================
create table restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qr_code text not null unique,
  status text default 'available',
  created_at timestamp with time zone default now()
);

-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================
create table menu_items (
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

-- =====================================================
-- ORDERS TABLE
-- =====================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_phone text,
  table_id uuid references restaurant_tables(id),
  table_name text not null,
  status text default 'pending',
  total_price numeric(10, 2) not null,
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
  menu_item_id uuid references menu_items(id),
  menu_item_name text not null,
  menu_item_price numeric(10, 2) not null,
  quantity integer not null default 1,
  subtotal numeric(10, 2) not null
);

-- =====================================================
-- ADS TABLE
-- =====================================================
create table ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  type text default 'internal',
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  position text default 'top',
  link text,
  views integer default 0,
  clicks integer default 0,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- POINTS HISTORY TABLE
-- =====================================================
create table points_history (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  points integer not null,
  type text not null check (type in ('earned', 'redeemed')),
  order_id uuid references orders(id),
  description text,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================
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

-- =====================================================
-- ROW LEVEL SECURITY (DISABLED FOR DEVELOPMENT)
-- =====================================================
alter table customers disable row level security;
alter table menu_items disable row level security;
alter table restaurant_tables disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table ads disable row level security;
alter table points_history disable row level security;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Admin user
insert into customers (name, phone, points) values ('Admin', 'admin', 0);

-- Sample tables
insert into restaurant_tables (name, qr_code, status) values
('Table 1', '/table/1', 'available'),
('Table 2', '/table/2', 'available'),
('Table 3', '/table/3', 'available'),
('Table 4', '/table/4', 'available'),
('Table 5', '/table/5', 'available'),
('VIP Room', '/table/vip', 'available');

-- Sample menu items
insert into menu_items (name, name_ar, description, price, image_url, category, available) values
('Espresso', 'إسبريسو', 'Rich and bold espresso shot', 3.50, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', 'Coffee', true),
('Cappuccino', 'كابتشينو', 'Espresso with steamed milk foam', 5.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 'Coffee', true),
('Latte', 'لاتيه', 'Smooth espresso with milk', 5.50, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400', 'Coffee', true),
('Iced Mocha', 'موخا مثلج', 'Chocolate espresso with cold milk', 6.00, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc39?w=400', 'Coffee', true),
('Matcha Latte', 'لاتيه ماتشا', 'Japanese green tea latte', 6.50, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400', 'Coffee', false),
('Fresh Orange Juice', 'عصير برتقال طازج', 'Freshly squeezed orange juice', 4.50, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 'Cold Drinks', true),
('Iced Lemon Tea', 'شاي ليمون مثلج', 'Refreshing lemon iced tea', 4.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 'Cold Drinks', true),
('Croissant', 'كرواسون', 'Buttery French pastry', 3.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 'Pastries', true),
('Chocolate Cake', 'كيك شوكولاتة', 'Rich chocolate layer cake', 7.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'Pastries', true),
('Cheesecake', 'تشيز كيك', 'Creamy New York style', 8.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 'Pastries', true),
('Club Sandwich', 'ساندويتش كلوب', 'Triple-decker with chicken', 9.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', 'Food', true),
('Caesar Salad', 'سلطة سيزر', 'Romaine lettuce with caesar dressing', 8.00, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Food', true),
('Grilled Cheese', 'جبنة مشوية', 'Classic grilled cheese sandwich', 6.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', 'Food', true);

-- Sample ads
insert into ads (title, image_url, type, start_date, end_date, position, link, active) values
('Special Offer!', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'internal', '2026-01-01', '2027-12-31', 'top', '', true),
('Buy 1 Get 1 Free', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 'internal', '2026-01-01', '2027-12-31', 'middle', '', true);

-- =====================================================
-- VERIFICATION
-- =====================================================
select 'Customers: ' || count(*) as result from customers;
select 'Menu Items: ' || count(*) as result from menu_items;
select 'Tables: ' || count(*) as result from restaurant_tables;
select 'Ads: ' || count(*) as result from ads;

-- =====================================================
-- SUCCESS! Next steps:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create buckets: menu-images, ad-images, profile-images (make them Public)
-- 3. You're ready to use the app!
-- =====================================================