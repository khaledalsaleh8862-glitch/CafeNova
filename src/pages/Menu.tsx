import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Star, Award, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const CATEGORIES = ['All', 'Coffee', 'Cold Drinks', 'Pastries', 'Food'];

export default function Menu() {
  const navigate = useNavigate();
  const { user, menuItems, cart, addToCart, removeFromCart, updateCartQuantity, cartTotal, cartCount, logout } = useApp();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, category, search]);

  const getCartQty = (itemId: string) => {
    return cart.find(c => c.menuItem.id === itemId)?.quantity || 0;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'vip': return 'bg-purple-100 text-purple-700';
      case 'regular': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white text-xl font-bold">CafeNova</h1>
            {user && (
              <p className="text-white/80 text-sm">Welcome, {user.full_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-white text-sm font-semibold">{user.points} pts</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(user.customer_level)}`}>
                  {user.customer_level.toUpperCase()}
                </span>
              </div>
            )}
            <button onClick={logout} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-600 shadow'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => {
            const qty = getCartQty(item.id);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-2xl p-4 shadow-sm flex gap-4 ${!item.is_active ? 'opacity-50' : ''}`}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.name_ar && <p className="text-sm text-gray-500">{item.name_ar}</p>}
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-amber-600 font-bold">${item.price.toFixed(2)}</span>
                    {item.is_active ? (
                      qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, qty - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center font-semibold">{qty}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center"
                          >
                            <Plus className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-red-500">Unavailable</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No items found</p>
          </div>
        )}
      </div>

      {/* Cart Button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4"
        >
          <Button
            onClick={() => navigate('/cart')}
            className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-xl flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{cartCount} items</span>
            </div>
            <span>${cartTotal.toFixed(2)}</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
