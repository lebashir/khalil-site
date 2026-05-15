'use client';

import { useEffect } from 'react';
import { useMode } from '@/components/ModeProvider';

// Tints the iOS status bar / Android chrome to match the active mode.
// We keep two <meta> tags in the document head (one per mode, gated by media query)
// AND update a single dynamic <meta name="theme-color"> for browsers that don't
// honor media-queried theme-color (most iOS Safari versions).
const COLORS = {
  gaming: '#1a0a3a',
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
