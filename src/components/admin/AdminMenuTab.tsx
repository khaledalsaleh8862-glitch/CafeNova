import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
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
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    name: '',
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
      setFormData({ name: '', description: '', price: 0, image_url: '', category: '', available: true });
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
      nameAr: item.nameAr,
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
        <Button onClick={() => { setShowForm(true); loadMenu(); }} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          {t('addItem')}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card p-4 rounded-xl space-y-3">
          <Input
            placeholder={t('itemName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            placeholder={t('description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder={t('price')}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          />
          <Input
            placeholder={t('category')}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <Input
            placeholder={t('imageUrl')}
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
            <Button onClick={() => { setShowForm(false); setEditingId(null); }} variant="outline">
              <X className="h-4 w-4 mr-2" />
              {t('cancel')}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>{t('loading')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-card p-4 rounded-xl">
              <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
              <h3 className="font-heading font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="font-semibold mt-2">{item.price} {t('sar')}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}