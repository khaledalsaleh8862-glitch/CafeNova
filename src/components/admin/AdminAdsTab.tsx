import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Pencil, Check, X, Image as ImageIcon, Eye, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { adService } from '@/lib/database';
import type { Ad } from '@/types';

export default function AdminAdsTab() {
  const { t } = useLanguage();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    type: 'internal' as Ad['type'],
    position: 'top' as Ad['position'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    link: '',
  });

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const data = await adService.getAll();
      setAds(data);
    } catch (error) {
      console.error('Failed to load ads:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setFormData(prev => ({ ...prev, image_url: result }));
      setIsUploading(false);
    };
    reader.onerror = () => setIsUploading(false);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      if (editingAd) {
        await adService.update(editingAd.id, formData);
      } else {
        await adService.create(formData);
      }
      await loadAds();
      resetForm();
    } catch (error) {
      console.error('Failed to save ad:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adService.delete(id);
      await loadAds();
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      type: ad.type,
      position: ad.position,
      start_date: ad.start_date.split('T')[0],
      end_date: ad.end_date.split('T')[0],
      link: ad.link || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAd(null);
    setFormData({
      title: '',
      image_url: '',
      type: 'internal',
      position: 'top',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      link: '',
    });
  };

  const isAdActive = (ad: Ad) => {
    const now = new Date();
    const start = new Date(ad.start_date);
    const end = new Date(ad.end_date);
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-semibold">{t('adManagement')}</h2>
        <Button
          onClick={() => { setShowForm(true); loadAds(); }}
          className="gradient-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addAd')}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card p-4 rounded-xl space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm">Tap to change</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Tap to capture photo</p>
              </div>
            )}
          </div>

          <Input
            placeholder={t('adTitle')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">{t('adType')}</label>
              <div className="flex gap-1">
                {(['internal', 'external'] as const).map(tp => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: tp })}
                    className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                      formData.type === tp ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
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
                    onClick={() => setFormData({ ...formData, position: pos })}
                    className={`flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                      formData.position === pos ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
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
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">{t('endDate')}</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <Input
            placeholder={t('adLink') + ' (optional)'}
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 gradient-primary" disabled={!formData.title || !formData.image_url}>
              <Check className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
            <Button onClick={resetForm} variant="outline">
              <X className="h-4 w-4 mr-2" />
              {t('cancel')}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => {
            const active = isAdActive(ad);
            return (
              <div key={ad.id} className="bg-card rounded-xl overflow-hidden">
                <div className="relative">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`text-[10px] font-body px-2 py-1 rounded-full ${
                      active ? 'bg-success/90 text-success-foreground' : 'bg-destructive/90 text-destructive-foreground'
                    }`}>
                      {active ? t('active') : t('expired')}
                    </span>
                    <span className={`text-[10px] font-body px-2 py-1 rounded-full ${
                      ad.type === 'internal' ? 'bg-primary/90 text-primary-foreground' : 'bg-accent/90 text-accent-foreground'
                    }`}>
                      {t(ad.type)}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold truncate flex-1">{ad.title}</h3>
                    <div className="flex gap-1 ms-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(ad)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(ad.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {ad.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" /> {ad.clicks}
                    </span>
                    <span>{ad.position}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && ads.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('noAdsYet')}</p>
        </div>
      )}
    </div>
  );
}