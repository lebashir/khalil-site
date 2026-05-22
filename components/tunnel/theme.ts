import type { Mode } from '@/lib/content';
import { PALETTE, getGamingPalette, type ModePalette } from '@/components/topbar/palette';
import {
  GAMING_THEMES,
  DEFAULT_GAMING_THEME,
  type GamingTheme,
  type GamingThemeKey
} from '@/lib/gaming-themes';

// Tunnel-specific theme. Reuses PALETTE for the canonical mode accent
// colors (so the cinematic flip + topbar agree) and adds four depth-bands
// for the corridor (deep → far → mid → near), wall/floor tints, and the
// destination room label.
//
// Gaming-side colors come from the active GamingTheme via
// getTunnelTheme(mode, themeKey). Football is single-palette.

export interface TunnelTheme extends ModePalette {
  bgDeep: string;
  bgFar: string;
  bgMid: string;
  bgNear: string;
  fg: string;
  wallTint: string;
  floorTint: string;
  glow: string;
  card: string;
  cardBorder: string;
  titleA: string;
  titleB: string;
  role: string;
  burstKind: 'gold' | 'neon';
  destLabel: string;
  chip: Array<{ label: string; value: string }>;
}

// Football tunnel — single Real Madrid identity. Exported for any call
// site that always wants football regardless of the active gaming theme.
export const FOOTBALL_TUNNEL: TunnelTheme = {
  ...PALETTE.football,
  bgDeep: '#000814',
  bgFar: '#001a3a',
  bgMid: '#003366',
  bgNear: '#0a4a6a',
  fg: '#ffffff',
  wallTint: 'rgba(255,215,0,0.16)',
  floorTint: 'rgba(255,255,255,0.10)',
  glow: 'rgba(255,215,0,0.7)',
  card: 'rgba(0,30,90,0.65)',
  cardBorder: 'rgba(255,215,0,0.5)',
  titleA: 'KHALIL',
  titleB: 'NO. 7',
  role: 'STRIKER · MADRIDISTA · FOREVER 7',
  burstKind: 'gold',
  destLabel: 'BERNABÉU TUNNEL',
  chip: [
    { label: 'TEAM', value: 'REAL MADRID' },
    { label: 'KIT', value: 'HOME · #7' },
    { label: 'STATUS', value: 'READY · COLD' }
  ]
};

// Collapse the GamingTheme.burstKind to tunnel's narrower union.
const collapseBurstKind = (
  k: 'gold' | 'neon' | 'paper' | 'glass' | 'confetti'
): 'gold' | 'neon' => (k === 'gold' ? 'gold' : 'neon');

// Derive corridor depth bands from a gaming theme's bg stops. The four
// depth bands correspond to deepest → far → mid → near; we sample bgA
// (deepest), bgB (mid), and bgC twice for mid/near so the tunnel reads
// as a single coherent gradient even when colors are tuned per-theme.
const deepestOf = (t: GamingTheme) => t.bgA;
const farOf = (t: GamingTheme) => t.bgB;
const midOf = (t: GamingTheme) => t.bgC;
const nearOf = (t: GamingTheme) => t.bgC;

// Tunnel theme resolver — paints the corridor in the active gaming theme
// or the fixed football palette. Football ignores the theme key.
export const getTunnelTheme = (mode: Mode, themeKey: GamingThemeKey): TunnelTheme => {
  if (mode === 'football') return FOOTBALL_TUNNEL;
  const t: GamingTheme =
    GAMING_THEMES[themeKey] ?? GAMING_THEMES[DEFAULT_GAMING_THEME]!;
  const a = t.accent;
  return {
    ...getGamingPalette(themeKey),
    bgDeep: deepestOf(t),
    bgFar: farOf(t),
    bgMid: midOf(t),
    bgNear: nearOf(t),
    fg: t.fg,
    wallTint: t.line,
    floorTint: t.line,
    glow: a,
    card: t.card,
    cardBorder: t.cardBorder,
    titleA: 'KHALIL',
    titleB: 'THE GOAT',
    role: 'STREAMER · GAMER · GOAT',
    burstKind: collapseBurstKind(t.burstKind),
    destLabel: 'STREAMING ROOM',
    chip: [
      { label: 'RIG', value: 'PS5 + RTX 4070' },
      { label: 'GAME', value: 'FORTNITE — ZERO BUILD' },
      { label: 'STATUS', value: 'ONLINE · ON FIRE' }
    ]
  };
};
