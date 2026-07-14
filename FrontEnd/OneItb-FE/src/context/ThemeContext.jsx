import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'oneitb-theme';
const ThemeContext = createContext(null);

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const normalizeTheme = (value) => (value === 'dark' || value === 'light' ? value : null);

const hasStoredSession = () => {
  if (!isBrowser) return false;
  return Boolean(window.localStorage.getItem('token') && window.localStorage.getItem('user'));
};

const getInitialTheme = () => {
  if (!isBrowser) return 'light';
  if (!hasStoredSession()) return 'light';
  const savedTheme = normalizeTheme(window.localStorage.getItem(STORAGE_KEY));
  return savedTheme ?? 'light';
};

const applyTheme = (theme) => {
  if (!isBrowser) return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

const TRANSITION_DURATION_MS = 800;

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);
  const transitionTimerRef = useRef(null);

  const beginThemeTransition = useCallback(() => {
    if (!isBrowser || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    document.documentElement.classList.add('theme-transitioning');
    transitionTimerRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      transitionTimerRef.current = null;
    }, TRANSITION_DURATION_MS);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    const resolvedTheme = normalizeTheme(typeof nextTheme === 'function' ? nextTheme(theme) : nextTheme);
    if (!resolvedTheme) return;
    if (resolvedTheme !== theme) beginThemeTransition();
    setThemeState(resolvedTheme);
    if (isBrowser) {
      window.localStorage.setItem(STORAGE_KEY, resolvedTheme);
    }
  }, [beginThemeTransition, theme]);

  const toggleTheme = useCallback(() => {
    beginThemeTransition();
    setThemeState((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      if (isBrowser) {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      }
      return nextTheme;
    });
  }, [beginThemeTransition]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => () => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    document.documentElement.classList.remove('theme-transitioning');
  }, []);

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
