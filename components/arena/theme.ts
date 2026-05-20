import type { Mode } from '@/lib/content';
import { PALETTE, type ModePalette } from '@/components/topbar/palette';

// Arena-specific theme extension. Reuses PALETTE for the canonical mode
// colors (so the topbar and the rest of the site agree on hex codes) and
// adds richer values used only by Arena sections — CTA gradient stops,
// HUD card colors, deeper scene bg, role labels, burst kind, book cover.
//
// PALETTE is the single source of truth for mode-flip colors. THEMES is
// the production version of design/directions/arena.jsx's THEMES const,
// minus the now-dynamic stat values (those live in content.json).

export interface ArenaTheme extends ModePalette {
  fg: string;
  line: string;
  card: string;
  cardBorder: string;
  ctaA: string;
  ctaB: string;
  sectionLabel: string;
  role: string;
  role2: string;
  role3: string;
  burstKind: 'gold' | 'neon';
  titleA: string;
  titleB: string;
  coverA: string;
  coverB: string;
  // Deeper bg for the Arena scene; PALETTE's bgA tends to be too bright
  // for the full-page background gradient.
  sceneBgA: string;
  sceneBgB: string;
  sceneBgC: string;
}

export const THEMES: Record<Mode, ArenaTheme> = {
  gaming: {
    ...PALETTE.gaming,
    fg: '#ffffff',
    line: 'rgba(0,240,255,0.15)',
    card: 'rgba(60,30,120,0.45)',
    cardBorder: 'rgba(0,240,255,0.4)',
    ctaA: '#ff2bd6',
    ctaB: '#9a0096',
    sectionLabel: 'LOADOUT',
    role: 'STREAMER',
    role2: 'GAMER',
    role3: 'GOAT',
    burstKind: 'neon',
    titleA: 'KHALIL',
    titleB: 'THE GOAT',
    coverA: '#3a0a5a',
    coverB: '#1a0838',
    sceneBgA: '#08010c',
    sceneBgB: '#1a0838',
    sceneBgC: '#3a0a5a'
  },
  football: {
    ...PALETTE.football,
    fg: '#ffffff',
    line: 'rgba(255,215,0,0.18)',
    card: 'rgba(0,30,90,0.55)',
    cardBorder: 'rgba(255,215,0,0.5)',
    ctaA: '#ffd700',
    ctaB: '#b58a00',
    sectionLabel: 'LINEUP',
    role: 'STRIKER',
    role2: 'MADRIDISTA',
    role3: 'FOREVER 7',
    burstKind: 'gold',
    titleA: 'KHALIL',
    titleB: 'THE GOAT',
    coverA: '#003366',
    coverB: '#001233',
    sceneBgA: '#001233',
    sceneBgB: '#003366',
    sceneBgC: '#0a4a2a'
  }
};
