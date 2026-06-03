import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { DarkThemeColors, LightThemeColors, type AppThemeColors } from '@/constants/fitnexia';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: AppThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const colors = isDark ? DarkThemeColors : LightThemeColors;

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setThemeModeState((prev) => {
      const currentlyDark =
        prev === 'dark' || (prev === 'system' && systemScheme === 'dark');
      return currentlyDark ? 'light' : 'dark';
    });
  }, [systemScheme]);

  const value = useMemo(
    () => ({ themeMode, isDark, colors, setThemeMode, toggleDarkMode }),
    [themeMode, isDark, colors, setThemeMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
