import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, ShoppingBag, Utensils, QrCode, Megaphone,
  LogOut, Plus, Trash2, Edit, Check, X, Eye, Clock, ChefHat,
  Star, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userService, tableService, menuService, orderService, adService } from '@/lib/services';
import type { User, Table, MenuItem, Order, Ad } from '@/types';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'menu', label: 'Menu', icon: Utensils },
  { id: 'tables', label: 'Tables', icon: QrCode },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'ads', label: 'Ads', icon: Megaphone },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  
  // Data
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  
  // Loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

  const checkAdmin = async () => {
    const storedPhone = localStorage.getItem('cafenova_user_phone');
    if (storedPhone === 'admin') {
      setIsAdmin(true);
    } else {
      navigate('/login');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tablesData, menuData, ordersData, customersData, adsData] = await Promise.all([
        tableService.getAll(),
        menuService.getAll(),
        orderService.getAll(),
        userService.getAll(),
        adService.getAll(),
      ]);
      setTables(tablesData);
      setMenuItems(menuData);
      setOrders(ordersData);
      setCustomers(customersData.filter(c => c.role === 'customer'));
      setAds(adsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('cafenova_user_phone');
    navigate('/login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <ChefHat className="h-4 w-4" />;
      case 'ready': return <Check className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  // Stats
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">CafeNova Admin</h1>
            <p className="text-gray-400 text-sm">Management Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-2 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{todayOrders.length}</p>
                        <p className="text-sm text-gray-500">Today's Orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">${todayRevenue.toFixed(0)}</p>
                        <p className="text-sm text-gray-500">Today's Revenue</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                        <p className="text-sm text-gray-500">Total Customers</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                        <p className="text-sm text-gray-500">Total Points</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Orders</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{order.user_name}</p>
                          <p className="text-sm text-gray-500">Table {order.table_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-600">${order.total.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No orders yet</div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{order.user_name}</p>
                            <p className="text-sm text-gray-500">Table {order.table_number} • {new Date(order.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {order.order_items?.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.quantity}x {item.menu_item_name}</span>
                              <span className="text-gray-900">${item.total_price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="font-bold text-amber-600">${order.total.toFixed(2)}</span>
                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <Button size="sm" onClick={() => orderService.updateStatus(order.id, 'preparing').then(loadData)} className="bg-blue-500">Start Preparing</Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button size="sm" onClick={() => orderService.updateStatus(order.id, 'ready').then(loadData)} className="bg-green-500">Mark Ready</Button>
                            )}
                            {order.status === 'ready' && (
                              <Button size="sm" onClick={() => orderService.updateStatus(order.id, 'completed').then(loadData)} className="bg-gray-500">Complete</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu */}
            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Menu Items</h2>
                  <Button className="bg-amber-500"><Plus className="h-4 w-4 mr-2" />Add Item</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm">
                      <img src={item.image_url} alt={item.name} className="w-full h-24 object-cover rounded-xl mb-2" />
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-amber-600">${item.price}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tables */}
            {activeTab === 'tables' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Tables</h2>
                  <Button className="bg-amber-500"><Plus className="h-4 w-4 mr-2" />Add Table</Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {tables.map(table => (
                    <div key={table.id} className="bg-white rounded-2xl p-4 shadow-sm text-center">
                      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-amber-600">{table.table_number}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{table.qr_link}</p>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        table.status === 'available' ? 'bg-green-100 text-green-700' :
                        table.status === 'occupied' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {table.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Customers</h2>
                <div className="space-y-3">
                  {customers.map(customer => (
                    <div key={customer.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{customer.full_name}</p>
                          <p className="text-sm text-gray-500">{customer.phone_number}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="h-4 w-4" />
                            <span className="font-semibold">{customer.points}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            customer.customer_level === 'vip' ? 'bg-purple-100 text-purple-700' :
                            customer.customer_level === 'regular' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {customer.customer_level}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 pt-3 border-t text-sm">
                        <span className="text-gray-500">{customer.total_orders} orders</span>
                        <span className="text-gray-500">${customer.total_spent.toFixed(2)} spent</span>
                        <span className="text-gray-500">{customer.visits_count} visits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ads */}
            {activeTab === 'ads' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Advertisements</h2>
                  <Button className="bg-amber-500"><Plus className="h-4 w-4 mr-2" />Add Ad</Button>
                </div>
                <div className="space-y-3">
                  {ads.map(ad => (
                    <div key={ad.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                      <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                            <p className="text-sm text-gray-500">{ad.type} • {ad.position}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-3 text-sm text-gray-500">
                          <span>{ad.views_count} views</span>
                          <span>{ad.clicks_count} clicks</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
