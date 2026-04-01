import { supabase } from './supabase';
import type { MenuItem, Order, OrderItem, Table, User, Ad } from '../types';

export const menuService = {
  async getAll(): Promise<MenuItem[]> {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) throw error;
    return data || [];
  },

  async getByCategory(category: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category);
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
      .update(item)
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
      .select('*, order_items(*, menu_item:menu_items(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_item:menu_items(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_item:menu_items(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const { items, ...orderData } = order;
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: orderRecord.id,
      menu_item_id: item.menu_item.id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    if (itemsError) throw itemsError;

    return this.getById(orderRecord.id) as Promise<Order>;
  },

  async updateStatus(
    id: string,
    status: Order['status']
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const tableService = {
  async getAll(): Promise<Table[]> {
    const { data, error } = await supabase.from('tables').select('*');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Table | null> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(table: Omit<Table, 'id'>): Promise<Table> {
    const { data, error } = await supabase
      .from('tables')
      .insert(table)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const userService = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updatePoints(id: string, points: number): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ points })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
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
      .lte('start_date', now)
      .gte('end_date', now)
      .order('position');
    if (error) throw error;
    return data || [];
  },

  async create(ad: Omit<Ad, 'id' | 'views' | 'clicks'>): Promise<Ad> {
    const { data, error } = await supabase.from('ads').insert(ad).select().single();
    if (error) throw error;
    return data;
  },

  async incrementViews(id: string): Promise<void> {
    await supabase.rpc('increment_ad_views', { ad_id: id });
  },

  async incrementClicks(id: string): Promise<void> {
    await supabase.rpc('increment_ad_clicks', { ad_id: id });
  },
};