import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

export default function Cart() {
  const navigate = useNavigate();
  const { user, cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartCount, placeOrder, currentTable } = useApp();
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (cartCount === 0) return;
    setIsPlacing(true);
    try {
      const { order } = await placeOrder();
      setLastOrderId(order.id);
      setOrderSuccess(true);
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setIsPlacing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-4">Your order has been sent to the kitchen</p>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              <span className="font-bold text-xl">+{Math.floor(cartTotal)} Points Earned!</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(`/invoice/${lastOrderId}`)}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl"
            >
              View Invoice
            </Button>
            <Button
              onClick={() => navigate('/menu')}
              className="w-full h-12 bg-gray-900 text-white font-semibold rounded-xl"
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Your Cart</h1>
            {currentTable && (
              <p className="text-white/80 text-sm">Table {currentTable.table_number}</p>
            )}
          </div>
          {user && (
            <div className="ms-auto flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5">
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="text-white text-sm font-semibold">{user.points}</span>
            </div>
          )}
        </div>
      </div>

      {cartCount === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
          <ShoppingBag className="h-20 w-20 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
          <Button
            onClick={() => navigate('/menu')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl px-8"
          >
            Browse Menu
          </Button>
        </div>
      ) : (
        <>
          <div className="px-4 py-4 space-y-3">
            {cart.map(item => (
              <motion.div
                key={item.menuItem.id}
                layout
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
              >
                <img
                  src={item.menuItem.image_url}
                  alt={item.menuItem.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.menuItem.name}</h3>
                  <p className="text-amber-600 font-bold">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.menuItem.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="px-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" /> Points Earned
                </span>
                <span className="font-semibold">+{Math.floor(cartTotal)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-amber-600">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4">
          <Button
            onClick={handlePlaceOrder}
            disabled={isPlacing}
            className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-xl disabled:opacity-50"
          >
            {isPlacing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Place Order • ${cartTotal.toFixed(2)}</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
