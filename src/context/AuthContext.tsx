import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { customerService } from '@/lib/database';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (phone: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserPoints: (points: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const STORAGE_KEY = 'café_user_phone';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshUser = useCallback(async () => {
    const storedPhone = localStorage.getItem(STORAGE_KEY);
    if (storedPhone) {
      try {
        const userData = await customerService.getByPhone(storedPhone);
        if (userData) {
          setUser(userData);
          setIsAdmin(userData.phone === 'admin');
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (phone: string, name: string) => {
    setIsLoading(true);
    try {
      let userData = await customerService.getByPhone(phone);

      if (!userData) {
        userData = await customerService.create({
          name,
          phone,
          points: 0,
        });
      } else if (userData.name !== name) {
        userData = await customerService.update(userData.id, { name });
      }

      localStorage.setItem(STORAGE_KEY, phone);
      setUser(userData);
      setIsAdmin(phone === 'admin');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsAdmin(false);
  };

  const updateUserPoints = (points: number) => {
    if (user) {
      setUser({ ...user, points });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout, updateUserPoints, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};