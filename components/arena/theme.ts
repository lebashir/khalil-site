import type { Mode } from '@/lib/content';
import { PALETTE, getGamingPalette, type ModePalette } from '@/components/topbar/palette';
import {
  GAMING_THEMES,
  DEFAULT_GAMING_THEME,
  type GamingThemeKey
} from '@/lib/gaming-themes';

// Arena-specific theme extension. Reuses PALETTE for the canonical mode
// colors (so the topbar and the rest of the site agree on hex codes) and
// adds richer values used only by Arena sections — CTA gradient stops,
// HUD card colors, deeper scene bg, role labels, burst kind, book cover.
//
// PALETTE is the single source of truth for mode-flip colors. For gaming,
// PALETTE.gaming holds neon defaults but the live values come from the
// active GamingTheme via getArenaTheme(mode, themeKey).
//
// To paint the arena, call getArenaTheme(mode, themeKey) — the result
// merges PALETTE + the gaming theme registry (or PALETTE.football +
// football-specific extras when mode is football).

export interface ArenaTheme extends ModePalette {
  fg: string;
  line: string;
  card: string;
  cardBorder: string;
  ctaA: string;
  ctaB: string;
  /** Text color rendered on top of the CTA gradient. Inverts for light
   *  themes (e.g. paper/ice/storm get light text on a dark button). */
  ctaText: string;
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

// Football stays a single palette (Real Madrid identity, by design).
// Exported so non-resolver call sites (e.g. peek previews that always
// want football regardless of theme key) can reach it directly.
export const FOOTBALL_THEME: ArenaTheme = {
  ...PALETTE.football,
  fg: '#ffffff',
  line: 'rgba(255,215,0,0.18)',
  card: 'rgba(0,30,90,0.55)',
  cardBorder: 'rgba(255,215,0,0.5)',
  ctaA: '#ffd700',
  ctaB: '#b58a00',
  ctaText: '#001233',
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
};

// GamingTheme.burstKind is wider than ArenaTheme.burstKind. Particle
// effects only know 'gold' and 'neon' — collapse the broader registry
// kinds to the closest matching arena effect.
const collapseBurstKind = (
  k: 'gold' | 'neon' | 'paper' | 'glass' | 'confetti'
): 'gold' | 'neon' => (k === 'gold' ? 'gold' : 'neon');

// Resolver — call from any Arena component that needs the active theme.
// Pass the GamingThemeKey from useGamingTheme(). Football ignores it.
export const getArenaTheme = (mode: Mode, themeKey: GamingThemeKey): ArenaTheme => {
  if (mode === 'football') return FOOTBALL_THEME;
  const t = GAMING_THEMES[themeKey] ?? GAMING_THEMES[DEFAULT_GAMING_THEME]!;
  return {
    ...getGamingPalette(themeKey),
    fg: t.fg,
    line: t.line,
    card: t.card,
    cardBorder: t.cardBorder,
    ctaA: t.ctaA,
    ctaB: t.ctaB,
    ctaText: t.ctaText,
    sectionLabel: 'LOADOUT',
    role: 'STREAMER',
    role2: 'GAMER',
    role3: 'GOAT',
    burstKind: collapseBurstKind(t.burstKind),
    titleA: 'KHALIL',
    titleB: 'THE GOAT',
    coverA: t.coverA,
    coverB: t.coverB,
    sceneBgA: t.bgA,
    sceneBgB: t.bgB,
    sceneBgC: t.bgC
  };
};
