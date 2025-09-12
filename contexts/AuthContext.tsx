import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, fetchProfile } from '@/services/authApi';
import { UserProfile } from '@/contexts/UserContext';

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) {
        setToken(stored);
      }
    };
    load();
  }, []);

  const saveToken = async (t: string | null) => {
    setToken(t);
    if (t) {
      await AsyncStorage.setItem('authToken', t);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await saveToken(res.token);
    await refreshProfile(res.token);
  };

  const register = async (email: string, password: string) => {
    const res = await apiRegister(email, password);
    await saveToken(res.token);
    await refreshProfile(res.token);
  };

  const logout = async () => {
    await saveToken(null);
    setUser(null);
  };

  const refreshProfile = async (providedToken?: string) => {
    const t = providedToken || token;
    if (!t) return;
    try {
      const profile = await fetchProfile(t);
      setUser(profile);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
