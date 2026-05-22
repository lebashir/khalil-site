// Single source of truth for mode visuals.
//
// PALETTE holds the canonical "template" for each mode:
//   - football: full palette (single Real Madrid identity, no themes)
//   - gaming:   neon defaults — overridden at render time by the active
//               GamingTheme via getGamingPalette(themeKey)
//
// The CSS vars in globals.css mirror this; the constants here are used
// by components that need raw hex strings at render time (the cinematic
// flip overlay paints inline gradients in the target mode's color,
// before any class-driven CSS var swap has occurred).
//
// Spec: design/HANDOFF.md "Mode palettes" + docs/HANDOFF_THEMES_CC.md
// for the gaming-themes layer.

import type { Mode } from '@/lib/content';
import {
  GAMING_THEMES,
  DEFAULT_GAMING_THEME,
  type GamingThemeKey
} from '@/lib/gaming-themes';

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
    // Neon defaults — kept as a safe fallback for any code path that
    // hasn't yet been migrated to getGamingPalette(themeKey). Live
    // rendering always uses the resolver.
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

// ── Theme-aware palette resolvers ──────────────────────────────────────

const hexA = (hex: string, a: number): string => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

// Merge the gaming-mode template (label / emoji / sub / ink) with the
// active theme's colors. Use this instead of `PALETTE.gaming` directly
// in any component that paints with raw hex (TopBarMode, ModeFlipOverlay).
export const getGamingPalette = (themeKey: GamingThemeKey): ModePalette => {
  const t = GAMING_THEMES[themeKey] ?? GAMING_THEMES[DEFAULT_GAMING_THEME]!;
  return {
    ...PALETTE.gaming,
    bgA: t.bgA,
    bgB: t.bgB,
    bgC: t.bgC,
    accent: t.accent,
    accent2: t.accent2,
    accent3: t.accent3,
    ink: t.fg,
    seamGlow: hexA(t.accent, 0.7)
  };
};

// Mode-agnostic resolver — pass the active gaming theme key. Football
// ignores the theme (single palette by design).
export const getPalette = (mode: Mode, themeKey: GamingThemeKey): ModePalette =>
  mode === 'gaming' ? getGamingPalette(themeKey) : PALETTE.football;
