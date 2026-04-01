import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, Truck, QrCode, UtensilsCrossed, BarChart3, Settings, Megaphone, Plus, Trash2, Eye, MousePointerClick, X } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { useAds } from '@/context/AdsContext';
import { useLanguage } from '@/context/LanguageContext';
import { SAMPLE_TABLES } from '@/data/sampleData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import LanguageToggle from '@/components/LanguageToggle';
import AdminMenuTab from '@/components/admin/AdminMenuTab';
import type { Order, Ad } from '@/types';
import type { TranslationKey } from '@/i18n/translations';

const statusKeys: Record<string, TranslationKey> = {
  pending: 'pending',
  preparing: 'preparing',
  ready: 'ready',
  delivered: 'delivered',
};

const statusConfig = {
  pending: { icon: Clock, color: 'bg-warning text-warning-foreground' },
  preparing: { icon: ChefHat, color: 'bg-primary text-primary-foreground' },
  ready: { icon: CheckCircle, color: 'bg-success text-success-foreground' },
  delivered: { icon: Truck, color: 'bg-muted text-muted-foreground' },
};

const nextStatus: Record<string, Order['status']> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

type Tab = 'orders' | 'menu' | 'tables' | 'stats' | 'ads';

const AdForm = ({ ad, onSave, onCancel }: {
  ad?: Ad;
  onSave: (data: Omit<Ad, 'id' | 'views' | 'clicks'>) => void;
  onCancel: () => void;
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(ad?.title || '');
  const [imageUrl, setImageUrl] = useState(ad?.image_url || '');
  const [type, setType] = useState<Ad['type']>(ad?.type || 'internal');
  const [position, setPosition] = useState<Ad['position']>(ad?.position || 'top');
  const [startDate, setStartDate] = useState(ad?.start_date || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(ad?.end_date || '');
  const [link, setLink] = useState(ad?.link || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !endDate) return;
    onSave({ title, image_url: imageUrl, type, position, start_date: startDate, end_date: endDate, link });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">{ad ? t('editAd') : t('addAd')}</h3>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <Input placeholder={t('adTitle')} value={title} onChange={e => setTitle(e.target.value)} required className="font-body" />
      <Input placeholder={t('adImageUrl')} value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="font-body" />
      <Input placeholder={t('adLink')} value={link} onChange={e => setLink(e.target.value)} className="font-body" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-body mb-1 block">{t('adType')}</label>
          <div className="flex gap-2">
            {(['internal', 'external'] as const).map(tp => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                  type === tp ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {t(tp)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-body mb-1 block">{t('position')}</label>
          <div className="flex gap-1">
            {(['top', 'middle', 'bottom'] as const).map(pos => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                  position === pos ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {t(pos)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-body mb-1 block">{t('startDate')}</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="font-body" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-body mb-1 block">{t('endDate')}</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="font-body" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 gradient-primary text-primary-foreground font-body rounded-xl">
          {t('saveAd')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="font-body rounded-xl">
          {t('cancel')}
        </Button>
      </div>
    </motion.form>
  );
};

const AdminDashboard = () => {
  const { orders, updateOrderStatus } = useAppState();
  const { ads, addAd, deleteAd } = useAds();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showAdForm, setShowAdForm] = useState(false);

  const tabKeys: Record<Tab, TranslationKey> = {
    orders: 'orders',
    tables: 'tables',
    menu: 'menu',
    stats: 'stats',
    ads: 'ads',
  };

  const tabs: { id: Tab; icon: React.ElementType }[] = [
    { id: 'orders', icon: UtensilsCrossed },
    { id: 'tables', icon: QrCode },
    { id: 'menu', icon: Settings },
    { id: 'ads', icon: Megaphone },
    { id: 'stats', icon: BarChart3 },
  ];

  const now = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-accent-foreground font-display text-xl font-bold">{t('adminTitle')}</h1>
          <p className="text-accent-foreground/70 font-body text-sm mt-0.5">
            {orders.length} {t('activeOrders')}
          </p>
        </div>
        <LanguageToggle />
      </div>

      <div className="flex border-b border-border bg-card overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-body font-medium transition-colors min-w-[60px] ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {t(tabKeys[tab.id])}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-body">{t('noOrdersYet')}</p>
                <p className="text-muted-foreground/60 font-body text-sm mt-1">{t('ordersWillAppear')}</p>
              </div>
            ) : (
              orders.map(order => {
                const cfg = statusConfig[order.status];
                const Icon = cfg.icon;
                return (
                  <motion.div key={order.id} layout className="glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-display font-semibold text-sm">{order.table_name}</h3>
                        <p className="text-xs text-muted-foreground font-body">{order.user_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-body font-medium flex items-center gap-1 ${cfg.color}`}>
                        <Icon className="h-3 w-3" /> {t(statusKeys[order.status])}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm font-body">
                          <span>{item.quantity}× {item.menu_item.name}</span>
                          <span className="text-muted-foreground">${(item.menu_item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="font-body font-bold">${order.total_price.toFixed(2)}</span>
                      {nextStatus[order.status] && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, nextStatus[order.status])}
                          className="gradient-primary text-primary-foreground font-body text-xs rounded-xl"
                        >
                          {t('markAs')} {t(statusKeys[nextStatus[order.status]])}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'tables' && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {SAMPLE_TABLES.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(selectedTable === table.id ? null : table.id)}
                  className={`glass-card rounded-xl p-3 text-center transition-all ${
                    selectedTable === table.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <QrCode className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <span className="text-xs font-body font-medium">{t('table')} {table.id}</span>
                </button>
              ))}
            </div>
            {selectedTable && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <h3 className="font-display font-semibold mb-4">{t('table')} {selectedTable} - {t('qrCode')}</h3>
                <div className="bg-background p-4 rounded-xl inline-block">
                  <QRCodeSVG
                    value={`${window.location.origin}/table/${selectedTable}`}
                    size={180}
                    fgColor="hsl(25, 40%, 15%)"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-body mt-3">
                  {t('scanToOpen')} - {t('table')} {selectedTable}
                </p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'menu' && <AdminMenuTab />}

        {activeTab === 'ads' && (
          <div className="space-y-4">
            {!showAdForm && (
              <Button
                onClick={() => setShowAdForm(true)}
                className="w-full gradient-primary text-primary-foreground font-body rounded-xl gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('addAd')}
              </Button>
            )}

            {showAdForm && (
              <AdForm
                onSave={(data) => {
                  addAd(data);
                  setShowAdForm(false);
                }}
                onCancel={() => setShowAdForm(false)}
              />
            )}

            {ads.length === 0 && !showAdForm ? (
              <div className="text-center py-16">
                <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-body">{t('noAdsYet')}</p>
                <p className="text-muted-foreground/60 font-body text-sm mt-1">{t('addFirstAd')}</p>
              </div>
            ) : (
              ads.map(ad => {
                const isActive = ad.start_date <= now && ad.end_date >= now;
                return (
                  <motion.div key={ad.id} layout className="glass-card rounded-2xl overflow-hidden">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-28 object-cover" loading="lazy" width={1200} height={512} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display font-semibold text-sm truncate flex-1">{ad.title}</h3>
                        <div className="flex items-center gap-2 ms-2">
                          <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {isActive ? t('active') : t('expired')}
                          </span>
                          <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${
                            ad.type === 'internal' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                          }`}>
                            {t(ad.type)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {ad.views} {t('views')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3" /> {ad.clicks} {t('clicks')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="capitalize">{t(ad.position as TranslationKey)}</span>
                          <span>•</span>
                          <button onClick={() => deleteAd(ad.id)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('totalOrders'), value: orders.length, emoji: '📦' },
                { label: t('revenue'), value: `$${orders.reduce((s, o) => s + o.total_price, 0).toFixed(2)}`, emoji: '💰' },
                { label: t('pending'), value: orders.filter(o => o.status === 'pending').length, emoji: '⏳' },
                { label: t('completed'), value: orders.filter(o => o.status === 'delivered').length, emoji: '✅' },
              ].map(stat => (
                <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
                  <span className="text-2xl">{stat.emoji}</span>
                  <p className="text-lg font-bold font-body mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
