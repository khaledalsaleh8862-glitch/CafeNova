import { supabase } from './supabase';
import type { MenuItem, Order, OrderItem, Table, User, Ad } from '../types';

export const menuService = {
  async getAll(): Promise<MenuItem[]> {
    const { data, error } = await supabase.from('menu_items').select('*').order('category');
    if (error) throw error;
    return data || [];
  },

  async getByCategory(category: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .eq('available', true);
    if (error) throw error;
    return data || [];
  },

  async getAvailable(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  },
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), restaurant_table:restaurant_tables(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByCustomerId(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(orderData: {
    customer_id?: string;
    customer_name: string;
    customer_phone?: string;
    table_id?: string;
    table_name: string;
    items: Array<{
      menu_item_id: string;
      menu_item_name: string;
      menu_item_price: number;
      quantity: number;
      subtotal: number;
    }>;
    total_price: number;
    notes?: string;
  }): Promise<Order> {
    const { items, ...orderBase } = orderData;

    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...orderBase,
        points_earned: Math.floor(orderBase.total_price),
        status: 'pending',
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: orderRecord.id,
      menu_item_id: item.menu_item_id,
      menu_item_name: item.menu_item_name,
      menu_item_price: item.menu_item_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    if (itemsError) throw itemsError;

    if (orderBase.customer_id) {
      await supabase.rpc('add_points', {
        p_customer_id: orderBase.customer_id,
        p_points: Math.floor(orderBase.total_price),
        p_type: 'earned',
        p_order_id: orderRecord.id,
        p_description: `Points earned from order #${orderRecord.id.slice(0, 8)}`,
      });
    }

    return this.getById(orderRecord.id) as Promise<Order>;
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancel(id: string): Promise<Order> {
    return this.updateStatus(id, 'cancelled');
  },
};

export const tableService = {
  async getAll(): Promise<Table[]> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getAvailable(): Promise<Table[]> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('status', 'available')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Table | null> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(table: Omit<Table, 'id'>): Promise<Table> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert(table)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, table: Partial<Table>): Promise<Table> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .update(table)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: 'available' | 'occupied' | 'reserved'): Promise<Table> {
    return this.update(id, { status });
  },
};

export const customerService = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByPhone(phone: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();
    if (error) return null;
    return data;
  },

  async create(customer: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePoints(id: string, points: number): Promise<User> {
    const { data, error } = await supabase
      .from('customers')
      .update({ points })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findOrCreate(phone: string, name: string): Promise<User> {
    const existing = await this.getByPhone(phone);
    if (existing) return existing;
    return this.create({ id: '', name, phone, points: 0 });
  },
};

export const adService = {
  async getAll(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('position');
    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<Ad[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('position');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Ad | null> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(ad: Omit<Ad, 'id' | 'views' | 'clicks'>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .insert({ ...ad, active: true })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, ad: Partial<Ad>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .update(ad)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) throw error;
  },

  async incrementViews(id: string): Promise<void> {
    await supabase.rpc('increment_ad_views', { ad_id: id });
  },

  async incrementClicks(id: string): Promise<void> {
    await supabase.rpc('increment_ad_clicks', { ad_id: id });
  },
};