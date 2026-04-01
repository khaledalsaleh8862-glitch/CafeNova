import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Ad } from '@/types';
import adSpecial from '@/assets/ad-special.jpg';
import adMatcha from '@/assets/ad-matcha.jpg';
import adExternal from '@/assets/ad-external.jpg';

interface AdsState {
  ads: Ad[];
  addAd: (ad: Omit<Ad, 'id' | 'views' | 'clicks'>) => void;
  updateAd: (id: string, data: Partial<Ad>) => void;
  deleteAd: (id: string) => void;
  trackView: (id: string) => void;
  trackClick: (id: string) => void;
  getActiveAds: (position?: Ad['position']) => Ad[];
}

const AdsContext = createContext<AdsState | null>(null);

export const useAds = () => {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
};

const INITIAL_ADS: Ad[] = [
  {
    id: '1',
    title: "Today's Special - Buy 2 Get 1 Free",
    image_url: adSpecial,
    type: 'internal',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    position: 'top',
    link: '',
    views: 342,
    clicks: 48,
  },
  {
    id: '2',
    title: 'New Matcha Collection',
    image_url: adMatcha,
    type: 'internal',
    start_date: '2026-03-01',
    end_date: '2026-06-30',
    position: 'middle',
    link: '',
    views: 215,
    clicks: 31,
  },
  {
    id: '3',
    title: 'TechCo - Smart Solutions',
    image_url: adExternal,
    type: 'external',
    start_date: '2026-03-01',
    end_date: '2026-04-30',
    position: 'bottom',
    link: 'https://example.com',
    views: 128,
    clicks: 12,
  },
];

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);

  const addAd = useCallback((data: Omit<Ad, 'id' | 'views' | 'clicks'>) => {
    const newAd: Ad = { ...data, id: crypto.randomUUID(), views: 0, clicks: 0 };
    setAds(prev => [...prev, newAd]);
  }, []);

  const updateAd = useCallback((id: string, data: Partial<Ad>) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }, []);

  const deleteAd = useCallback((id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
  }, []);

  const trackView = useCallback((id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, views: (a.views || 0) + 1 } : a));
  }, []);

  const trackClick = useCallback((id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, clicks: (a.clicks || 0) + 1 } : a));
  }, []);

  const getActiveAds = useCallback((position?: Ad['position']) => {
    const now = new Date().toISOString().split('T')[0];
    return ads.filter(a => {
      const active = a.start_date <= now && a.end_date >= now;
      return position ? active && a.position === position : active;
    });
  }, [ads]);

  return (
    <AdsContext.Provider value={{ ads, addAd, updateAd, deleteAd, trackView, trackClick, getActiveAds }}>
      {children}
    </AdsContext.Provider>
  );
};
