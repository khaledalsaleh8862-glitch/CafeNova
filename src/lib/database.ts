import { supabase, isSupabaseConfigured } from './supabase';
import type { MenuItem, Order, OrderItem, Table, User, Ad } from '../types';
import { SAMPLE_MENU, SAMPLE_TABLES } from '../data/sampleData';

const useFallback = !isSupabaseConfigured();

export const menuService = {
  async getAll(): Promise<MenuItem[]> {
    if (useFallback) return SAMPLE_MENU as MenuItem[];
    const { data, error } = await supabase.from('menu_items').select('*').order('category');
    if (error) {
      console.warn('Supabase error, using fallback data:', error.message);
      return SAMPLE_MENU as MenuItem[];
    }
    return data || [];
  },

  async getByCategory(category: string): Promise<MenuItem[]> {
    if (useFallback) return (SAMPLE_MENU as MenuItem[]).filter(item => item.category === category);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .eq('available', true);
    if (error) throw error;
    return data || [];
  },

  async getAvailable(): Promise<MenuItem[]> {
    if (useFallback) return (SAMPLE_MENU as MenuItem[]).filter(item => item.available);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<MenuItem | null> {
    if (useFallback) return (SAMPLE_MENU as MenuItem[]).find(item => item.id === id) || null;
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    if (useFallback) {
      const newItem = { ...item, id: crypto.randomUUID() } as MenuItem;
      return newItem;
    }
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    if (useFallback) {
      const itemToUpdate = (SAMPLE_MENU as MenuItem[]).find(i => i.id === id);
      if (itemToUpdate) Object.assign(itemToUpdate, item);
      return itemToUpdate as MenuItem;
    }
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
    if (useFallback) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  },
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    if (useFallback) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), restaurant_table:restaurant_tables(*)')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase error, returning empty orders:', error.message);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Order | null> {
    if (useFallback) return null;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async getByCustomerId(customerId: string): Promise<Order[]> {
    if (useFallback) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<Order[]> {
    if (useFallback) return [];
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
    if (useFallback) {
      const order: Order = {
        id: crypto.randomUUID(),
        user_id: orderData.customer_id || '',
        user_name: orderData.customer_name,
        table_id: orderData.table_id || '',
        table_name: orderData.table_name,
        items: orderData.items.map(item => ({
          id: crypto.randomUUID(),
          menu_item: { id: item.menu_item_id, name: item.menu_item_name, price: item.menu_item_price } as MenuItem,
          quantity: item.quantity,
        })),
        status: 'pending',
        total_price: orderData.total_price,
        created_at: new Date().toISOString(),
      };
      return order;
    }

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
    if (useFallback) {
      return { id, status } as Order;
    }
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
    if (useFallback) return SAMPLE_TABLES;
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('name');
    if (error) {
      console.warn('Supabase error, using fallback tables:', error.message);
      return SAMPLE_TABLES;
    }
    return data || [];
  },

  async getAvailable(): Promise<Table[]> {
    if (useFallback) return SAMPLE_TABLES;
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('status', 'available')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Table | null> {
    if (useFallback) return SAMPLE_TABLES.find(t => t.id === id) || null;
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async create(table: Omit<Table, 'id'>): Promise<Table> {
    if (useFallback) {
      const newTable = { ...table, id: crypto.randomUUID() } as Table;
      return newTable;
    }
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert(table)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, table: Partial<Table>): Promise<Table> {
    if (useFallback) {
      const tableToUpdate = SAMPLE_TABLES.find(t => t.id === id);
      if (tableToUpdate) Object.assign(tableToUpdate, table);
      return tableToUpdate as Table;
    }
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
    if (useFallback) return;
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: 'available' | 'occupied' | 'reserved'): Promise<Table> {
    return this.update(id, { status });
  },
};

export const customerService = {
  async getById(id: string): Promise<User | null> {
    if (useFallback) return null;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async getByPhone(phone: string): Promise<User | null> {
    if (useFallback) return null;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();
    if (error) return null;
    return data;
  },

  async create(customer: Omit<User, 'id'>): Promise<User> {
    if (useFallback) {
      return { ...customer, id: crypto.randomUUID() } as User;
    }
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePoints(id: string, points: number): Promise<User> {
    if (useFallback) return { id, points } as User;
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
    if (useFallback) {
      return { id: crypto.randomUUID(), name, phone, points: 0 };
    }
    const existing = await this.getByPhone(phone);
    if (existing) return existing;
    return this.create({ name, phone, points: 0 });
  },
};

export const adService = {
  async getAll(): Promise<Ad[]> {
    if (useFallback) return [];
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('position');
    if (error) {
      console.warn('Supabase error, returning empty ads:', error.message);
      return [];
    }
    return data || [];
  },

  async getActive(): Promise<Ad[]> {
    if (useFallback) return [];
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
    if (useFallback) return null;
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async create(ad: Omit<Ad, 'id' | 'views' | 'clicks'>): Promise<Ad> {
    if (useFallback) {
      return { ...ad, id: crypto.randomUUID(), views: 0, clicks: 0 } as Ad;
    }
    const { data, error } = await supabase
      .from('ads')
      .insert({ ...ad, active: true })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, ad: Partial<Ad>): Promise<Ad> {
    if (useFallback) {
      return { id, ...ad } as Ad;
    }
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
    if (useFallback) return;
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) throw error;
  },

  async incrementViews(id: string): Promise<void> {
    if (useFallback) return;
    await supabase.rpc('increment_ad_views', { ad_id: id });
  },

  async incrementClicks(id: string): Promise<void> {
    if (useFallback) return;
    await supabase.rpc('increment_ad_clicks', { ad_id: id });
  },
};