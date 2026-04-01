import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, CartItem, MenuItem, Order, Table } from '@/types';
import { SAMPLE_MENU } from '@/data/sampleData';
import { menuService, orderService as dbOrderService } from '@/lib/database';
import { useAuth } from './AuthContext';

interface AppState {
  cart: CartItem[];
  currentTable: Table | null;
  menuItems: MenuItem[];
  orders: Order[];
  setCurrentTable: (table: Table | null) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  refreshOrders: () => Promise<void>;
  refreshMenu: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([...SAMPLE_MENU] as MenuItem[]);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshMenu = useCallback(async () => {
    try {
      const items = await menuService.getAll();
      if (items.length > 0) setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      if (user?.id) {
        const data = await dbOrderService.getByCustomerId(user.id);
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user, refreshOrders]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
    } else {
      setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, quantity } : c));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  return (
    <AppContext.Provider value={{
      cart, currentTable, menuItems, orders,
      setCurrentTable, addToCart, removeFromCart,
      updateCartQuantity, clearCart, cartTotal, cartCount,
      addOrder, updateOrderStatus, refreshOrders, refreshMenu,
    }}>
      {children}
    </AppContext.Provider>
  );
};