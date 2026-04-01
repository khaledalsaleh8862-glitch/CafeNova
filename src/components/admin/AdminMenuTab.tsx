import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Pencil, Check, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { menuService } from '@/lib/database';
import type { MenuItem } from '@/types';

export default function AdminMenuTab() {
  const { t } = useLanguage();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    nameAr: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    available: true,
  });

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const items = await menuService.getAll();
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMenu();
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
      if (editingId) {
        await menuService.update(editingId, formData);
      } else {
        await menuService.create(formData);
      }
      await loadMenu();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', nameAr: '', description: '', price: 0, image_url: '', category: '', available: true });
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await menuService.delete(id);
      await loadMenu();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameAr: item.nameAr || '',
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      category: item.category,
      available: item.available,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-semibold">{t('menuManagement')}</h2>
        <Button
          onClick={() => { setShowForm(true); loadMenu(); }}
          className="gradient-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addItem')}
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
                  className="w-full h-32 object-cover rounded-lg"
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
            placeholder={t('itemName') + ' (English)'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            placeholder={t('itemName') + ' (العربية)'}
            value={formData.nameAr || ''}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
          />
          <textarea
            placeholder={t('description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm font-body min-h-[80px] resize-none"
          />
          <Input
            type="number"
            placeholder={t('price')}
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          />
          <Input
            placeholder={t('category')}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 rounded border-primary text-primary focus:ring-primary"
            />
            <span className="text-sm font-body">{t('available')}</span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 gradient-primary" disabled={!formData.name || !formData.price}>
              <Check className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
            <Button
              onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: '', nameAr: '', description: '', price: 0, image_url: '', category: '', available: true }); }}
              variant="outline"
            >
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-card p-4 rounded-xl">
              <div className="relative">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                {!item.available && (
                  <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground text-xs px-2 py-1 rounded-full">
                    {t('unavailable')}
                  </div>
                )}
              </div>
              <h3 className="font-heading font-semibold">{item.name}</h3>
              {item.nameAr && <p className="text-sm text-muted-foreground font-body">{item.nameAr}</p>}
              <p className="text-sm text-muted-foreground font-body line-clamp-2 mt-1">{item.description}</p>
              <p className="font-semibold mt-2 font-body">{item.price} {t('sar')}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} className="flex-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && menuItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('noMenuItems')}</p>
        </div>
      )}
    </div>
  );
}