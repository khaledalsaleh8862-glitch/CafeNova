import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, User, ChevronRight, Star, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';

const Login = () => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError(t('phoneRequired'));
      return;
    }
    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    try {
      await login(phone.trim(), name.trim());
    } catch (err) {
      setError(t('loginError'));
    }
  };

  const getUserLevel = (): { level: string; icon: React.ReactNode; color: string } => {
    return {
      level: t('new'),
      icon: <Sparkles className="h-5 w-5" />,
      color: 'text-muted-foreground',
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <span className="text-4xl">☕</span>
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">CafeNova</h1>
          <p className="text-muted-foreground font-body">{t('welcomeMessage')}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 space-y-5"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {t('yourName')}
              </label>
              <Input
                type="text"
                placeholder={t('enterYourName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-colors font-body"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                {t('phoneNumber')}
              </label>
              <Input
                type="tel"
                placeholder={t('enterPhoneNumber')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-colors font-body"
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-destructive font-body"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 gradient-primary text-primary-foreground font-body font-semibold rounded-xl text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {t('continue')}
                  <ChevronRight className="h-5 w-5 ml-1" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground font-body">
                {t('or')}
              </span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground font-body">{t('firstTimeUser')}</p>
            <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-xl">
              <Star className="h-4 w-4 text-primary" />
              <p className="text-sm font-body text-foreground">
                {t('earnPointsWithOrders')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted-foreground font-body">
            {t('byContinuing')}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;