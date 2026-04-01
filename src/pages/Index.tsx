import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, QrCode, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import logo from '@/assets/logo.png';
import heroCafe from '@/assets/hero-cafe.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/menu');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroCafe} alt="CafeNova" className="w-full h-full object-cover" width={1280} height={640} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/80" />
      </div>

      <div className="absolute top-4 end-4 z-20">
        <LanguageToggle className="bg-foreground/20 text-primary-foreground border border-primary-foreground/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          src={logo}
          alt="CafeNova"
          className="h-24 mb-6 brightness-200"
          width={512}
          height={512}
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3"
        >
          {t('smartCafeOrdering')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-primary-foreground/70 font-body text-sm max-w-sm mb-10"
        >
          {t('scanQrDescription')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 w-full max-w-xs"
        >
          <Button
            onClick={() => navigate('/menu')}
            className="w-full gradient-primary text-primary-foreground h-14 rounded-2xl font-body font-semibold text-base shadow-xl gap-2"
          >
            <QrCode className="h-5 w-5" />
            {t('orderNow')}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="w-full h-12 rounded-2xl font-body font-medium border-primary-foreground/20 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 gap-2"
          >
            <Shield className="h-4 w-4" />
            {t('adminPanel')}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-6 mt-12 text-primary-foreground/50"
        >
          {[t('qrOrdering'), t('loyaltyPoints'), t('realTime')].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-xs font-body">
              <Coffee className="h-3 w-3" />
              {f}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;