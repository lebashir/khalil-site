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
  /** TRANSIENT preview for THIS browser: swaps the html class so the page
   *  repaints, but does NOT touch localStorage. Reverts to the published
   *  theme on the next reload. The /edit picker uses this for both hover
   *  and click so auditioning a theme can never permanently override what
   *  Khalil sees vs. what visitors see. */
  previewThemeKey: (k: GamingThemeKey) => void;
  /** PERSISTED preview: same as previewThemeKey but also writes localStorage
   *  so the choice survives reloads/navigation. Kept for callers that want
   *  a sticky local override; the /edit picker intentionally does NOT use
   *  this (see previewThemeKey) to avoid silent preview/published drift. */
  setThemeKey: (k: GamingThemeKey) => void;
  /** Clear the localStorage preview so this browser falls back to the
   *  published theme. Called by the /edit picker's "view as visitor" /
   *  reset so a stale override is genuinely removed, not re-written. */
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

  // Transient: update React state + swap the html theme class so every
  // CSS-var consumer repaints. Deliberately does NOT persist.
  const previewThemeKey = useCallback((next: GamingThemeKey) => {
    setKeyState(next);
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      Array.from(html.classList)
        .filter((c) => c.startsWith('theme-'))
        .forEach((c) => html.classList.remove(c));
      html.classList.add(`theme-${next}`);
    }
  }, []);

  // Persisted: preview + remember it across reloads via localStorage.
  const setThemeKey = useCallback(
    (next: GamingThemeKey) => {
      previewThemeKey(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private-mode safari etc. */
      }
    },
    [previewThemeKey]
  );

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
      previewThemeKey,
      setThemeKey,
      clearLocalOverride,
      theme: GAMING_THEMES[themeKey] ?? GAMING_THEMES[DEFAULT_GAMING_THEME]!
    }),
    [themeKey, previewThemeKey, setThemeKey, clearLocalOverride]
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
