import type { Mode } from '@/lib/content';
import { PALETTE, type ModePalette } from '@/components/topbar/palette';

// Tunnel-specific theme. Reuses PALETTE for the canonical mode accent
// colors (so the cinematic flip + topbar agree) and adds four depth-bands
// for the corridor (deep → far → mid → near), wall/floor tints, and the
// destination room label.

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

export const TUNNEL_THEMES: Record<Mode, TunnelTheme> = {
  gaming: {
    ...PALETTE.gaming,
    bgDeep: '#020108',
    bgFar: '#0a0530',
    bgMid: '#1a0a3a',
    bgNear: '#2a0f5a',
    fg: '#ffffff',
    wallTint: 'rgba(0,240,255,0.18)',
    floorTint: 'rgba(255,43,214,0.12)',
    glow: 'rgba(0,240,255,0.7)',
    card: 'rgba(20,10,60,0.65)',
    cardBorder: 'rgba(0,240,255,0.45)',
    titleA: 'KHALIL',
    titleB: 'THE GOAT',
    role: 'STREAMER · GAMER · GOAT',
    burstKind: 'neon',
    destLabel: 'STREAMING ROOM',
    chip: [
      { label: 'RIG', value: 'PS5 + RTX 4070' },
      { label: 'GAME', value: 'FORTNITE — ZERO BUILD' },
      { label: 'STATUS', value: 'ONLINE · ON FIRE' }
    ]
  },
  football: {
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
  }
};
