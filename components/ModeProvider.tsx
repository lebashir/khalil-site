'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Mode } from '@/lib/content';

interface ModeContextValue {
  mode: Mode;
  setMode: (next: Mode) => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

const STORAGE_KEY = 'khalil-mode';

interface Props {
  initialMode: Mode;
  children: ReactNode;
}

export const ModeProvider = ({ initialMode, children }: Props) => {
  // The inline script in <head> already set html.className from localStorage,
  // so we read from there on mount to stay in sync without a flash.
  const [mode, setModeState] = useState<Mode>(initialMode);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const current = document.documentElement.classList.contains('football')
      ? 'football'
      : 'gaming';
    if (current !== mode) setModeState(current);
    // run once on mount to sync from pre-hydration script
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('gaming', 'football');
      document.documentElement.classList.add(next);
    }
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode */ }
  }, []);

  const value = useMemo<ModeContextValue>(() => ({ mode, setMode }), [mode, setMode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export const useMode = (): ModeContextValue => {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used inside <ModeProvider>');
  return ctx;
};
