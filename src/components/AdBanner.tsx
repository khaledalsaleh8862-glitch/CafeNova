import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useAds } from '@/context/AdsContext';
import { useLanguage } from '@/context/LanguageContext';
import type { Ad } from '@/types';

interface AdBannerProps {
  position: Ad['position'];
  className?: string;
}

const AdBanner = ({ position, className = '' }: AdBannerProps) => {
  const { getActiveAds, trackView, trackClick } = useAds();
  const { t } = useLanguage();
  const trackedRef = useRef<Set<string>>(new Set());

  const ads = getActiveAds(position);

  useEffect(() => {
    ads.forEach(ad => {
      if (!trackedRef.current.has(ad.id)) {
        trackView(ad.id);
        trackedRef.current.add(ad.id);
      }
    });
  }, [ads, trackView]);

  if (ads.length === 0) return null;

  const handleClick = (ad: Ad) => {
    trackClick(ad.id);
    if (ad.link && ad.type === 'external') {
      window.open(ad.link, '_blank', 'noopener');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {ads.map(ad => (
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md"
          onClick={() => handleClick(ad)}
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            width={1200}
            height={512}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          {ad.type === 'external' && (
            <div className="absolute top-2 end-2 bg-foreground/50 text-background text-[10px] font-body px-2 py-0.5 rounded-full flex items-center gap-1">
              <ExternalLink className="h-2.5 w-2.5" />
              {t('sponsoredAd')}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default AdBanner;
