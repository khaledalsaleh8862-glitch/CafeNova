import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations, { type Language, type TranslationKey } from '@/i18n/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('cafenova-lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const isRtl = lang === 'ar';

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('cafenova-lang', l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en');
  }, [lang, setLang]);

  const t = useCallback((key: TranslationKey) => {
    return translations[lang][key] || translations.en[key] || key;
  }, [lang]);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
