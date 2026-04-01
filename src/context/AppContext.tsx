import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, CartItem, MenuItem, Order, Table } from '@/types';
import { SAMPLE_MENU, type LocalizedMenuItem } from '@/data/sampleData';

interface AppState {
  user: User | null;
  cart: CartItem[];
  currentTable: Table | null;
  orders: Order[];
  menuItems: LocalizedMenuItem[];
  setUser: (user: User | null) => void;
  setCurrentTable: (table: Table | null) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateMenuItem: (itemId: string, updates: Partial<LocalizedMenuItem>) => void;
  addMenuItem: (item: LocalizedMenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<LocalizedMenuItem[]>([...SAMPLE_MENU]);

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

  const updateMenuItem = useCallback((itemId: string, updates: Partial<LocalizedMenuItem>) => {
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updates } : i));
  }, []);

  const addMenuItem = useCallback((item: LocalizedMenuItem) => {
    setMenuItems(prev => [...prev, item]);
  }, []);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  return (
    <AppContext.Provider value={{
      user, cart, currentTable, orders, menuItems,
      setUser, setCurrentTable, addToCart, removeFromCart,
      updateCartQuantity, clearCart, cartTotal, cartCount,
      addOrder, updateOrderStatus, updateMenuItem, addMenuItem, deleteMenuItem,
    }}>
      {children}
    </AppContext.Provider>
  );
};
