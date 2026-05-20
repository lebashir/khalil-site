'use client';

import { useEffect } from 'react';
import { useMode } from '@/components/ModeProvider';

// Tints the iOS status bar / Android chrome to match the active mode.
// We keep two <meta> tags in the document head (one per mode, gated by media query)
// AND update a single dynamic <meta name="theme-color"> for browsers that don't
// honor media-queried theme-color (most iOS Safari versions).
// Mirror components/topbar/palette.ts. Picks the deepest bg shade per mode
// so the iOS status bar bleeds into the page background.
const COLORS = {
  gaming: '#0e0030',
  football: '#001233'
} as const;

export const ThemeColor = () => {
  const { mode } = useMode();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', COLORS[mode]);
  }, [mode]);
  return null;
};
