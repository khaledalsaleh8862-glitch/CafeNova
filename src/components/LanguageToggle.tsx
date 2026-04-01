import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle = ({ className = '' }: { className?: string }) => {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-body font-medium transition-all hover:bg-secondary/80 ${className}`}
    >
      <Globe className="h-3.5 w-3.5" />
      {lang === 'en' ? 'عربي' : 'EN'}
    </button>
  );
};

export default LanguageToggle;
