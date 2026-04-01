import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { orderService } from '@/lib/services';
import type { Order } from '@/types';
import { useEffect, useState } from 'react';

export default function Invoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      orderService.getById(orderId).then(setOrder);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Invoice</h1>
            <p className="text-white/80 text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-white">Thank You!</h2>
            <p className="text-white/80">Your order has been placed</p>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="border-b pb-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{order.user_name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{order.phone_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Table</span>
                <span className="font-medium">{order.table_number}</span>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.order_items?.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="font-medium">{item.menu_item_name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">${item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-amber-600">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span className="flex items-center gap-1">
                  +{order.points_earned} Points Earned
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-amber-800">Order Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'ready' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handlePrint}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="h-5 w-5" />
                Print Invoice
              </Button>
              <Button
                onClick={() => navigate('/menu')}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
