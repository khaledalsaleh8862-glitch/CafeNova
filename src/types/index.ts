export interface User {
  id: string;
  name: string;
  phone: string;
  points: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Table {
  id: string;
  name: string;
  qr_code: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  table_id: string;
  table_name: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  total_price: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  menu_item: MenuItem;
  quantity: number;
}

export interface Ad {
  id: string;
  title: string;
  image_url: string;
  type: 'external' | 'internal';
  start_date: string;
  end_date: string;
  position: 'top' | 'middle' | 'bottom';
  link?: string;
  views: number;
  clicks: number;
}
