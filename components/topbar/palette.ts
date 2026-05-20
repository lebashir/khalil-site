// Single source of truth for mode visuals. The CSS vars in globals.css
// mirror these values; the constants here are used by components that
// need raw hex strings at render time (the cinematic flip overlay paints
// inline gradients in the target mode's color, before any class-driven
// CSS var swap has occurred).
//
// Spec: design/HANDOFF.md "Mode palettes". Do not change without
// re-running the design palette through the rest of the site.

import type { Mode } from '@/lib/content';

export interface ModePalette {
  bgA: string;
  bgB: string;
  bgC: string;
  accent: string;
  accent2: string;
  accent3: string;
  ink: string;
  label: string;
  emoji: string;
  sub: string;
  seamGlow: string;
}

export const PALETTE: Record<Mode, ModePalette> = {
  gaming: {
    bgA: '#0e0030',
    bgB: '#3a0a5a',
    bgC: '#5a14a0',
    accent: '#00f0ff',
    accent2: '#ff2bd6',
    accent3: '#ffe600',
    ink: '#ffffff',
    label: 'GAMING',
    emoji: '🎮',
    sub: 'streamer · gamer · goat',
    seamGlow: 'rgba(0,240,255,0.7)'
  },
  football: {
    bgA: '#001233',
    bgB: '#003366',
    bgC: '#0a4a2a',
    accent: '#ffd700',
    accent2: '#ffffff',
    accent3: '#4d8fff',
    ink: '#ffffff',
    label: 'FOOTBALL',
    emoji: '⚽',
    sub: 'striker · madridista · 7',
    seamGlow: 'rgba(255,215,0,0.8)'
  }
};

export const FLIP_EVENT = 'khalil:flip';

// Cinematic flip timing. The slab sweeps in over 0–420ms, page content
// swaps at 400ms (behind the slab), overlay clears at 900ms.
export const FLIP_TIMING = {
  swapAtMs: 400,
  totalMs: 900
} as const;
