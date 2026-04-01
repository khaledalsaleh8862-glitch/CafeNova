import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, Table, MenuItem, Order, CartItem, Invoice } from '../types';
import { userService, tableService, menuService, orderService } from '../lib/services';

interface AppState {
  // User
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  
  // Table
  currentTable: Table | null;
  setCurrentTable: (table: Table | null) => void;
  
  // Menu
  menuItems: MenuItem[];
  loadMenu: () => Promise<void>;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Orders
  orders: Order[];
  loadOrders: () => Promise<void>;
  placeOrder: () => Promise<{ order: Order; invoice: Invoice }>;
  
  // Auth
  login: (phone: string, name: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const USER_KEY = 'cafenova_user_phone';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadMenu = useCallback(async () => {
    try {
      const items = await menuService.getActive();
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      const userOrders = await orderService.getByUser(user.id);
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, [user]);

  useEffect(() => {
    const storedPhone = localStorage.getItem(USER_KEY);
    if (storedPhone) {
      userService.findOrCreate(storedPhone, '').then(u => {
        if (u) setUser(u);
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  const login = async (phone: string, name: string) => {
    setIsLoading(true);
    try {
      const newUser = await userService.findOrCreate(phone, name);
      setUser(newUser);
      localStorage.setItem(USER_KEY, phone);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

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

  const placeOrder = async (): Promise<{ order: Order; invoice: Invoice }> => {
    if (!user || !currentTable) throw new Error('Missing user or table');
    
    const result = await orderService.create({
      userId: user.id,
      userName: user.full_name,
      phoneNumber: user.phone_number,
      tableId: currentTable.id,
      tableNumber: currentTable.table_number,
      items: cart.map(c => ({ menuItem: c.menuItem, quantity: c.quantity })),
      subtotal: cartTotal,
      discount: 0,
      total: cartTotal,
    });
    
    clearCart();
    await loadOrders();
    const updatedUser = await userService.getById(user.id);
    if (updatedUser) setUser(updatedUser);
    
    return result;
  };

  return (
    <AppContext.Provider value={{
      user, isLoading, setUser,
      currentTable, setCurrentTable,
      menuItems, loadMenu,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
      orders, loadOrders, placeOrder,
      login, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};
