import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES, CATEGORY_KEYS, type LocalizedMenuItem } from '@/data/sampleData';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';
import AdBanner from '@/components/AdBanner';
import type { TranslationKey } from '@/i18n/translations';

const MenuItemCard = ({ item, onAdd, cartQty }: { item: LocalizedMenuItem; onAdd: (item: LocalizedMenuItem) => void; cartQty: number }) => {
  const { updateCartQuantity } = useAppState();
  const { t } = useLanguage();
  const categoryEmoji: Record<string, string> = {
    Coffee: '☕', 'Cold Drinks': '🧊', Pastries: '🥐', Food: '🍽️',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-2xl p-4 flex gap-4 ${!item.available ? 'opacity-50' : ''}`}
    >
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" loading="lazy" width={80} height={80} />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center text-3xl shrink-0">
          {categoryEmoji[item.category] || '🍴'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-foreground text-sm">{t(item.nameKey)}</h3>
        <p className="text-xs text-muted-foreground font-body line-clamp-2 mt-0.5">{t(item.descKey)}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold font-body">${item.price.toFixed(2)}</span>
          {item.available ? (
            cartQty > 0 ? (
              <div className="flex items-center gap-2">
                <button onClick={() => updateCartQuantity(item.id, cartQty - 1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-semibold font-body w-5 text-center">{cartQty}</span>
                <button onClick={() => onAdd(item)} className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                  <Plus className="h-3 w-3 text-primary-foreground" />
                </button>
              </div>
            ) : (
              <button onClick={() => onAdd(item)} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-md">
                <Plus className="h-4 w-4 text-primary-foreground" />
              </button>
            )
          ) : (
            <span className="text-xs text-destructive font-body">{t('unavailable')}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart, cart, cartCount, cartTotal, user, currentTable, menuItems } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);
  const getCartQty = (id: string) => cart.find(c => c.menuItem.id === id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-primary-foreground font-display text-lg font-bold">CafeNova</h1>
            {currentTable && (
              <span className="text-primary-foreground/70 text-xs font-body">{currentTable.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle className="bg-foreground/10 text-primary-foreground border-none" />
            {user && (
              <div className="flex items-center gap-2 bg-foreground/10 rounded-full px-3 py-1.5">
                <Award className="h-4 w-4 text-gold" />
                <span className="text-primary-foreground text-xs font-body font-semibold">{user.points} {t('pts')}</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-primary-foreground/80 text-sm font-body">
          {t('welcomeUser')}{user ? `, ${user.name}` : ''}! 👋
        </p>
      </div>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'gradient-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t(CATEGORY_KEYS[cat] as TranslationKey)}
          </button>
        ))}
      </div>

      {/* Top Ad Banner */}
      <div className="px-4 mt-2">
        <AdBanner position="top" />
      </div>

      <div className="px-4 space-y-3 mt-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <React.Fragment key={item.id}>
              <MenuItemCard item={item} onAdd={addToCart} cartQty={getCartQty(item.id)} />
              {/* Middle Ad Banner after 4th item */}
              {index === 3 && (
                <AdBanner position="middle" />
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Ad Banner */}
      <div className="px-4 mt-3 mb-4">
        <AdBanner position="bottom" />
      </div>

      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
        >
          <Button
            onClick={() => navigate('/cart')}
            className="w-full gradient-primary text-primary-foreground h-14 rounded-2xl font-body font-semibold text-base shadow-xl flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{cartCount} {t('items')}</span>
            </div>
            <span>${cartTotal.toFixed(2)}</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Menu;
