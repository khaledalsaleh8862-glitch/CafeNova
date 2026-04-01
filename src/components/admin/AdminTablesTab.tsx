import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { tableService } from '@/lib/database';
import type { Table } from '@/types';

export default function AdminTablesTab() {
  const { t } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Table, 'id'>>({
    name: '',
    qr_code: '',
  });
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);

  const loadTables = async () => {
    setIsLoading(true);
    try {
      const data = await tableService.getAll();
      setTables(data);
    } catch (error) {
      console.error('Failed to load tables:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await tableService.update(editingId, formData);
      } else {
        const qrCode = `/table/${Date.now()}`;
        await tableService.create({ ...formData, qr_code: qrCode });
      }
      await loadTables();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', qr_code: '' });
    } catch (error) {
      console.error('Failed to save table:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tableService.delete(id);
      await loadTables();
    } catch (error) {
      console.error('Failed to delete table:', error);
    }
  };

  const handleEdit = (table: Table) => {
    setEditingId(table.id);
    setFormData({
      name: table.name,
      qr_code: table.qr_code,
    });
    setShowForm(true);
  };

  const generateQRCode = (table: Table) => {
    setSelectedTableForQR(table);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-semibold">{t('tableManagement')}</h2>
        <Button
          onClick={() => { setShowForm(true); loadTables(); }}
          className="gradient-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addTable')}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card p-4 rounded-xl space-y-3">
          <Input
            placeholder={t('tableName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 gradient-primary">
              <Check className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
            <Button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              {t('cancel')}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>{t('loading')}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="bg-card p-4 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary-foreground">
                  {table.name.replace(/[^0-9]/g, '') || '?'}
                </span>
              </div>
              <h3 className="font-heading font-semibold">{table.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">{table.qr_code}</p>
              <div className="flex gap-2 mt-3 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateQRCode(table)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(table)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(table.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tables.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('noTables')}</p>
        </div>
      )}

      {selectedTableForQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-2xl max-w-sm w-full text-center">
            <h3 className="font-heading font-semibold text-lg mb-4">{selectedTableForQR.name}</h3>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <QrCodeSVG
                value={`${window.location.origin}${selectedTableForQR.qr_code}`}
                size={200}
                level="H"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('scanToOpen')} - {t('table')}: {selectedTableForQR.name}
            </p>
            <Button onClick={() => setSelectedTableForQR(null)} variant="outline" className="w-full">
              {t('close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}