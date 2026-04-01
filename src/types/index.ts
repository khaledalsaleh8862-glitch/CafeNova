// =====================================================
// CafeNova - Complete Type Definitions
// =====================================================

// User & Customer Types
export type UserRole = 'customer' | 'admin';
export type CustomerLevel = 'new' | 'regular' | 'vip';

export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  visits_count: number;
  total_orders: number;
  total_spent: number;
  points: number;
  customer_level: CustomerLevel;
  created_at: string;
  updated_at: string;
}

// Table Types
export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  table_number: string;
  qr_code: string;
  qr_link: string;
  status: TableStatus;
  created_at: string;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  phone_number: string;
  table_id: string;
  table_number: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  points_earned: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

// Invoice Types
export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  total: number;
  created_at: string;
}

// Ad Types
export type AdType = 'internal' | 'external';
export type AdPosition = 'top' | 'middle' | 'bottom';

export interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  type: AdType;
  position: AdPosition;
  start_date: string;
  end_date: string;
  is_active: boolean;
  views_count: number;
  clicks_count: number;
  created_at: string;
}

// Points History
export type PointsType = 'earned' | 'redeemed';

export interface PointsHistory {
  id: string;
  user_id: string;
  points: number;
  type: PointsType;
  order_id?: string;
  description?: string;
  created_at: string;
}

// Cart Types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Customer Analytics
export interface CustomerAnalytics {
  user: User;
  avgOrderValue: number;
  lastVisit: string;
  favoriteItems: string[];
}
