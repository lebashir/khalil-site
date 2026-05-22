'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import {
  GAMING_THEMES,
  DEFAULT_GAMING_THEME,
  isGamingThemeKey,
  type GamingThemeKey,
  type GamingTheme
} from '@/lib/gaming-themes';

interface ThemeContextValue {
  themeKey: GamingThemeKey;
  /** Set the active theme for THIS browser only (writes localStorage +
   *  swaps the html class). Used by the /edit picker as a "preview" —
   *  the published theme (visible to visitors) is set via content.json
   *  + SAVE. */
  setThemeKey: (k: GamingThemeKey) => void;
  /** Clear the localStorage preview so this browser falls back to the
   *  published theme. Called after Khalil hits SAVE in /edit so his
   *  preview ends and he sees what visitors will see. */
  clearLocalOverride: () => void;
  theme: GamingTheme;
}

const GamingThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'khalil-gaming-theme';

interface Props {
  initialKey: GamingThemeKey;
  children: ReactNode;
}

// Mounts INSIDE ModeProvider in app/layout.tsx so any descendant client
// component can subscribe to the active theme. State is hydrated from the
// pre-paint inline script (which reads localStorage + content.json
// published settings) — this provider then keeps things in sync after
// hydration.
export const GamingThemeProvider = ({ initialKey, children }: Props) => {
  const [themeKey, setKeyState] = useState<GamingThemeKey>(initialKey);

  // After mount, read the class the inline script wrote so React state
  // and the DOM agree. The script may have picked a different theme than
  // `initialKey` (e.g. random rotation or returning-visitor localStorage).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const cls = Array.from(document.documentElement.classList).find((c) =>
      c.startsWith('theme-')
    );
    const k = cls?.slice('theme-'.length);
    if (k && isGamingThemeKey(k) && k !== themeKey) setKeyState(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThemeKey = useCallback((next: GamingThemeKey) => {
    setKeyState(next);
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      Array.from(html.classList)
        .filter((c) => c.startsWith('theme-'))
        .forEach((c) => html.classList.remove(c));
      html.classList.add(`theme-${next}`);
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private-mode safari etc. */
    }
  }, []);

  const clearLocalOverride = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* private-mode safari etc. */
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeKey,
      setThemeKey,
      clearLocalOverride,
      theme: GAMING_THEMES[themeKey] ?? GAMING_THEMES[DEFAULT_GAMING_THEME]!
    }),
    [themeKey, setThemeKey, clearLocalOverride]
  );

  return (
    <GamingThemeContext.Provider value={value}>
      {children}
    </GamingThemeContext.Provider>
  );
};

export const useGamingTheme = (): ThemeContextValue => {
  const ctx = useContext(GamingThemeContext);
  if (!ctx) {
    throw new Error('useGamingTheme must be used inside <GamingThemeProvider>');
  }
  return ctx;
};
