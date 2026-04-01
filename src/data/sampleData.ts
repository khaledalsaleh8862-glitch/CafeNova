import type { MenuItem, Table } from '@/types';
import type { TranslationKey } from '@/i18n/translations';

import heroCafeImg from '@/assets/hero-cafe.jpg';

export interface LocalizedMenuItem extends MenuItem {
  nameKey: TranslationKey;
  descKey: TranslationKey;
}

export const SAMPLE_MENU: LocalizedMenuItem[] = [
  { id: '1', name: 'Espresso', nameKey: 'espresso', descKey: 'espressoDesc', description: '', price: 3.5, image_url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', category: 'Coffee', available: true },
  { id: '2', name: 'Cappuccino', nameKey: 'cappuccino', descKey: 'cappuccinoDesc', description: '', price: 5.0, image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', category: 'Coffee', available: true },
  { id: '3', name: 'Latte', nameKey: 'latte', descKey: 'latteDesc', description: '', price: 5.5, image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400', category: 'Coffee', available: true },
  { id: '4', name: 'Iced Mocha', nameKey: 'icedMocha', descKey: 'icedMochaDesc', description: '', price: 6.0, image_url: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc39?w=400', category: 'Cold Drinks', available: true },
  { id: '5', name: 'Fresh Orange Juice', nameKey: 'freshOJ', descKey: 'freshOJDesc', description: '', price: 4.5, image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', category: 'Cold Drinks', available: true },
  { id: '6', name: 'Croissant', nameKey: 'croissant', descKey: 'croissantDesc', description: '', price: 3.0, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', category: 'Pastries', available: true },
  { id: '7', name: 'Chocolate Cake', nameKey: 'chocolateCake', descKey: 'chocolateCakeDesc', description: '', price: 7.0, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'Pastries', available: true },
  { id: '8', name: 'Club Sandwich', nameKey: 'clubSandwich', descKey: 'clubSandwichDesc', description: '', price: 9.0, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', category: 'Food', available: true },
  { id: '9', name: 'Caesar Salad', nameKey: 'caesarSalad', descKey: 'caesarSaladDesc', description: '', price: 8.0, image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', category: 'Food', available: true },
  { id: '10', name: 'Matcha Latte', nameKey: 'matchaLatte', descKey: 'matchaLatteDesc', description: '', price: 6.5, image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400', category: 'Coffee', available: false },
];

export const SAMPLE_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `Table ${i + 1}`,
  qr_code: `/table/${i + 1}`,
}));

export const CATEGORIES = ['All', 'Coffee', 'Cold Drinks', 'Pastries', 'Food'] as const;

export const CATEGORY_KEYS: Record<string, string> = {
  All: 'all',
  Coffee: 'coffee',
  'Cold Drinks': 'coldDrinks',
  Pastries: 'pastries',
  Food: 'food',
};
