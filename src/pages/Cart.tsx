import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Cart = () => {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart, user, currentTable, addOrder } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = () => {
    if (!user || !currentTable || cart.length === 0) return;
    const order = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: user.name,
      table_id: currentTable.id,
      table_name: currentTable.name,
      items: cart.map(c => ({
        id: crypto.randomUUID(),
        menu_item: c.menuItem,
        quantity: c.quantity,
      })),
      status: 'pending' as const,
      total_price: cartTotal,
      created_at: new Date().toISOString(),
    };
    addOrder(order);
    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">{t('orderPlaced')}</h1>
          <p className="text-muted-foreground font-body mb-1">{t('orderSentKitchen')}</p>
          <p className="text-muted-foreground font-body text-sm mb-8">
            {currentTable?.name} • +{Math.floor(cartTotal)} {t('pointsEarnedLabel')}
          </p>
          <Button onClick={() => navigate('/menu')} className="gradient-primary text-primary-foreground font-body font-semibold rounded-xl px-8 h-12">
            {t('backToMenu')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="gradient-primary px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/menu')} className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-primary-foreground" />
        </button>
        <h1 className="text-primary-foreground font-display text-lg font-bold">{t('yourCart')}</h1>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">{t('cartEmpty')}</h2>
          <p className="text-muted-foreground font-body text-sm mb-6">{t('addDelicious')}</p>
          <Button onClick={() => navigate('/menu')} variant="outline" className="font-body rounded-xl">
            {t('browseMenu')}
          </Button>
        </div>
      ) : (
        <>
          <div className="px-4 py-4 space-y-3">
            {cart.map(item => (
              <motion.div
                key={item.menuItem.id}
                layout
                className="glass-card rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground text-sm">{item.menuItem.name}</h3>
                  <p className="text-primary font-bold font-body text-sm mt-1">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center font-body font-semibold">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                    <Plus className="h-3 w-3 text-primary-foreground" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.menuItem.id)} className="text-destructive/60 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="px-4 mt-4">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">{t('pointsEarned')}</span>
                <span className="text-primary font-semibold">+{Math.floor(cartTotal)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-body">
                <span className="font-semibold">{t('total')}</span>
                <span className="text-lg font-bold text-foreground">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            onClick={handlePlaceOrder}
            className="w-full gradient-primary text-primary-foreground h-14 rounded-2xl font-body font-semibold text-base shadow-xl"
          >
            {t('placeOrder')} • ${cartTotal.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;
