import { create } from 'zustand';

type ThemeMode = 'glass' | 'normal';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

// Load from localStorage on init
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme-mode-storage');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.state?.themeMode || 'glass';
      } catch {
        return 'glass';
      }
    }
  }
  return 'glass';
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: getInitialTheme(),
  setThemeMode: (mode: ThemeMode) => {
    set({ themeMode: mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode-storage', JSON.stringify({ state: { themeMode: mode } }));
    }
  },
}));

