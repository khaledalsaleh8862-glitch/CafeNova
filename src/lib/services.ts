import { createClient } from '@supabase/supabase-js';
import type {
  User, Table, MenuItem, Order, OrderItem, Invoice, Ad, PointsHistory,
  CustomerLevel, OrderStatus, TableStatus
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cqfxcwgnqlrrecnhvlph.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZnhjd2ducWxycmVjbmh2bHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzY5MDAsImV4cCI6MjA2MDYxMjkwMH0.tZngTkHD3Mk4L7d-0ZxaKbLuS1ZqL4C1gNzZ6JKTQ4I';

export const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// USER / CUSTOMER SERVICE
// =====================================================
export const userService = {
  async findOrCreate(phoneNumber: string, fullName: string): Promise<User> {
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (existing) {
      if (existing.full_name !== fullName) {
        const { data: updated } = await supabase
          .from('users')
          .update({ full_name: fullName, visits_count: existing.visits_count + 1 })
          .eq('id', existing.id)
          .select()
          .single();
        return updated;
      }
      const { data: visitUpdate } = await supabase
        .from('users')
        .update({ visits_count: existing.visits_count + 1 })
        .eq('id', existing.id)
        .select()
        .single();
      return visitUpdate || existing;
    }

    const customerLevel: CustomerLevel = 'new';
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'customer',
        visits_count: 1,
        total_orders: 0,
        total_spent: 0,
        points: 0,
        customer_level: customerLevel,
      })
      .select()
      .single();

    if (error) throw error;
    return newUser;
  },

  async getById(id: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data;
  },

  async getAll(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async updatePoints(id: string, points: number): Promise<User> {
    const { data } = await supabase
      .from('users')
      .update({ points })
      .eq('id', id)
      .select()
      .single();
    return data;
  },

  async addPoints(id: string, pointsToAdd: number, description: string, orderId?: string): Promise<void> {
    const user = await this.getById(id);
    if (!user) return;

    const newPoints = user.points + pointsToAdd;
    const newLevel = this.calculateLevel(newPoints, user.total_orders);

    await supabase.from('users').update({
      points: newPoints,
      customer_level: newLevel,
    }).eq('id', id);

    await supabase.from('points_history').insert({
      user_id: id,
      points: pointsToAdd,
      type: 'earned',
      order_id: orderId,
      description,
    });
  },

  calculateLevel(totalPoints: number, totalOrders: number): CustomerLevel {
    if (totalOrders >= 20 || totalPoints >= 1000) return 'vip';
    if (totalOrders >= 5 || totalPoints >= 100) return 'regular';
    return 'new';
  },

  async recordOrder(id: string, totalSpent: number, pointsEarned: number): Promise<void> {
    const user = await this.getById(id);
    if (!user) return;

    const newTotalOrders = user.total_orders + 1;
    const newTotalSpent = user.total_spent + totalSpent;
    const newPoints = user.points + pointsEarned;
    const newLevel = this.calculateLevel(newPoints, newTotalOrders);

    await supabase.from('users').update({
      total_orders: newTotalOrders,
      total_spent: newTotalSpent,
      points: newPoints,
      customer_level: newLevel,
    }).eq('id', id);
  },
};

// =====================================================
// TABLE SERVICE
// =====================================================
export const tableService = {
  async getAll(): Promise<Table[]> {
    const { data } = await supabase
      .from('tables')
      .select('*')
      .order('table_number');
    return data || [];
  },

  async getById(id: string): Promise<Table | null> {
    const { data } = await supabase.from('tables').select('*').eq('id', id).single();
    return data;
  },

  async create(tableData: { table_number: string }): Promise<Table> {
    const qrLink = `/table/${tableData.table_number}`;
    const { data, error } = await supabase
      .from('tables')
      .insert({
        table_number: tableData.table_number,
        qr_code: `qr_${Date.now()}`,
        qr_link: qrLink,
        status: 'available',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Table>): Promise<Table> {
    const { data } = await supabase
      .from('tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return data;
  },

  async updateStatus(id: string, status: TableStatus): Promise<void> {
    await supabase.from('tables').update({ status }).eq('id', id);
  },

  async delete(id: string): Promise<void> {
    await supabase.from('tables').delete().eq('id', id);
  },
};

// =====================================================
// MENU SERVICE
// =====================================================
export const menuService = {
  async getAll(): Promise<MenuItem[]> {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('category');
    return data || [];
  },

  async getActive(): Promise<MenuItem[]> {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('category');
    return data || [];
  },

  async getByCategory(category: string): Promise<MenuItem[]> {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .eq('is_active', true);
    return data || [];
  },

  async getById(id: string): Promise<MenuItem | null> {
    const { data } = await supabase.from('menu_items').select('*').eq('id', id).single();
    return data;
  },

  async create(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data } = await supabase
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return data;
  },

  async delete(id: string): Promise<void> {
    await supabase.from('menu_items').delete().eq('id', id);
  },
};

// =====================================================
// ORDER SERVICE
// =====================================================
export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getByUser(userId: string): Promise<Order[]> {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getActiveByUser(userId: string): Promise<Order[]> {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getById(id: string): Promise<Order | null> {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    return data;
  },

  async create(orderData: {
    userId: string;
    userName: string;
    phoneNumber: string;
    tableId: string;
    tableNumber: string;
    items: Array<{ menuItem: MenuItem; quantity: number }>;
    subtotal: number;
    discount: number;
    total: number;
    notes?: string;
  }): Promise<{ order: Order; invoice: Invoice }> {
    const pointsEarned = Math.floor(orderData.total);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        user_name: orderData.userName,
        phone_number: orderData.phoneNumber,
        table_id: orderData.tableId,
        table_number: orderData.tableNumber,
        status: 'pending',
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        total: orderData.total,
        points_earned: pointsEarned,
        notes: orderData.notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menuItem.id,
      menu_item_name: item.menuItem.name,
      unit_price: item.menuItem.price,
      quantity: item.quantity,
      total_price: item.menuItem.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    await userService.recordOrder(orderData.userId, orderData.total, pointsEarned);

    const invoiceNumber = `INV-${Date.now()}-${order.id.slice(0, 8).toUpperCase()}`;
    const { data: invoice } = await supabase
      .from('invoices')
      .insert({
        order_id: order.id,
        invoice_number: invoiceNumber,
        total: orderData.total,
      })
      .select()
      .single();

    return { order, invoice: invoice! };
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return data;
  },

  async getByTable(tableId: string): Promise<Order[]> {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('table_id', tableId)
      .order('created_at', { ascending: false });
    return data || [];
  },
};

// =====================================================
// INVOICE SERVICE
// =====================================================
export const invoiceService = {
  async getByOrder(orderId: string): Promise<Invoice | null> {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .single();
    return data;
  },
};

// =====================================================
// ADS SERVICE
// =====================================================
export const adService = {
  async getAll(): Promise<Ad[]> {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .order('position');
    return data || [];
  },

  async getActive(): Promise<Ad[]> {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('position');
    return data || [];
  },

  async create(ad: Omit<Ad, 'id' | 'views_count' | 'clicks_count' | 'created_at'>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .insert(ad)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Ad>): Promise<Ad> {
    const { data } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return data;
  },

  async delete(id: string): Promise<void> {
    await supabase.from('ads').delete().eq('id', id);
  },

  async incrementViews(id: string): Promise<void> {
    await supabase.rpc('increment_ad_views', { ad_id: id });
  },

  async incrementClicks(id: string): Promise<void> {
    await supabase.rpc('increment_ad_clicks', { ad_id: id });
  },
};

// =====================================================
// POINTS SERVICE
// =====================================================
export const pointsService = {
  async getHistory(userId: string): Promise<PointsHistory[]> {
    const { data } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async redeem(userId: string, points: number, description: string): Promise<void> {
    const user = await userService.getById(userId);
    if (!user || user.points < points) throw new Error('Insufficient points');

    await supabase.from('users').update({ points: user.points - points }).eq('id', userId);

    await supabase.from('points_history').insert({
      user_id: userId,
      points: -points,
      type: 'redeemed',
      description,
    });
  },
};
