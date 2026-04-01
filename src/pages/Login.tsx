import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, User } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageToggle from '@/components/LanguageToggle';
import logo from '@/assets/logo.png';
import heroCafe from '@/assets/hero-cafe.jpg';

const Login = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { setUser, setCurrentTable } = useAppState();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const userId = phone.replace(/\D/g, '');
    setUser({ id: userId, name: name.trim(), phone: phone.trim(), points: 45 });
    if (tableId) {
      setCurrentTable({ id: tableId, name: `${t('table')} ${tableId}`, qr_code: `/table/${tableId}` });
    }
    navigate('/menu');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroCafe} alt="Cafe" className="w-full h-full object-cover" width={1280} height={640} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      </div>

      <div className="absolute top-4 end-4 z-20">
        <LanguageToggle className="bg-foreground/20 text-primary-foreground border border-primary-foreground/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <img src={logo} alt="CafeNova" className="h-20 mx-auto mb-3 brightness-200" width={512} height={512} />
          {tableId && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mt-3">
              <span className="text-primary-foreground/80 text-sm font-body">
                {t('table')} {tableId}
              </span>
            </div>
          )}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLogin}
          className="w-full max-w-sm glass-card rounded-2xl p-8 space-y-5"
        >
          <h2 className="text-xl font-display font-semibold text-center text-card-foreground">
            {t('welcome')}
          </h2>
          <p className="text-sm text-muted-foreground text-center font-body">
            {t('enterDetails')}
          </p>

          <div className="relative">
            <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('yourName')}
              value={name}
              onChange={e => setName(e.target.value)}
              className="ps-10 bg-background/60 border-border font-body"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('phoneNumber')}
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="ps-10 bg-background/60 border-border font-body"
              required
            />
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-body font-semibold h-12 text-base rounded-xl">
            {t('startOrdering')}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
