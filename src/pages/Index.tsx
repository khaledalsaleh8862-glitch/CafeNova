import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Star, ArrowRight, Shield, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <Coffee className="h-14 w-14 text-white" />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-3">CafeNova</h1>
        <p className="text-gray-600 mb-8">Smart Cafeteria Ordering System</p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/menu')}
            className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-xl text-lg"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Order Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="w-full h-12 border-2 border-gray-300 text-gray-700 font-medium rounded-xl"
          >
            <Shield className="h-5 w-5 mr-2" />
            Admin Panel
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <QrCode className="h-4 w-4" />
            <span>QR Orders</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span>Loyalty Points</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
