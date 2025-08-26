import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface Colors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  colors: Colors;
  setTheme: (theme: Theme) => void;
}

const lightColors: Colors = {
  primary: '#1e3a8a',
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  accent: '#10b981',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  shadow: '#00000010',
};

const darkColors: Colors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  secondary: '#94a3b8',
  accent: '#34d399',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#475569',
  shadow: '#00000040',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        setThemeState(storedTheme as Theme);
      }
    })();
  }, []);

  useEffect(() => {
    const systemTheme = Appearance.getColorScheme() || 'light';
    setCurrentTheme(theme === 'system' ? systemTheme : theme === 'dark' ? 'dark' : 'light');

    if (theme === 'system') {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setCurrentTheme(colorScheme || 'light');
      });
      return () => subscription?.remove();
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

  const colors = currentTheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
