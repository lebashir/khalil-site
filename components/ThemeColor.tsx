'use client';

import { useEffect } from 'react';
import { useMode } from '@/components/ModeProvider';
import { useGamingTheme } from '@/components/GamingThemeProvider';
import { PALETTE } from '@/components/topbar/palette';

// Tints the iOS status bar / Android chrome to match the active mode +
// active gaming theme. Reads the active GamingTheme's bgA so the status
// bar bleeds into the page background — flipping to a new theme repaints
// the status bar in the new deepest shade. Football mode stays anchored
// to the Real Madrid deep navy (single palette).
export const ThemeColor = () => {
  const { mode } = useMode();
  const { theme } = useGamingTheme();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    if (!meta) return;
    const color = mode === 'gaming' ? theme.bgA : PALETTE.football.bgA;
    meta.setAttribute('content', color);
  }, [mode, theme.bgA]);
  return null;
};
