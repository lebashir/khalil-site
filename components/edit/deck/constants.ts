import type { Mood } from '@/lib/content';

// Mission-control "bunker" palette. Distinct from the site palette —
// /edit is its own world, not branded gaming/football.
export const ED = {
  bg: '#0a0d0f',
  bgGrid: '#10141a',
  panel: '#171c22',
  panel2: '#1d242b',
  line: '#2a333d',
  ink: '#e6f2f6',
  inkDim: '#92a4ae',
  amber: '#ffb84d',
  green: '#3df562',
  red: '#ff3a3a',
  blue: '#3ec4ff',
  pink: '#ff63d6',
  yellow: '#ffe600'
} as const;

// Font roles for the deck — same families as the rest of the site,
// addressed by role so consumers don't repeat font stacks.
export const FONT = {
  display: "'Anton', 'Bungee', 'Russo One', sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'DM Mono', ui-monospace, monospace",
  stencil: "'Bungee', 'Anton', sans-serif"
} as const;

export interface Payload {
  id: 'confetti' | 'gold' | 'neon' | 'fire' | 'goal' | 'cake';
  name: string;
  kind: 'paper' | 'gold' | 'neon';
  color: string;
  emoji: string;
  desc: string;
}

export const PAYLOADS: Payload[] = [
  { id: 'confetti', name: 'CONFETTI', kind: 'paper', color: ED.yellow, emoji: '🎉', desc: 'paper rain' },
  { id: 'gold', name: 'GOLD SHOWER', kind: 'gold', color: ED.amber, emoji: '🪙', desc: 'big day energy' },
  { id: 'neon', name: 'NEON RAVE', kind: 'neon', color: ED.pink, emoji: '⚡', desc: 'gaming sparks' },
  { id: 'fire', name: 'FIRE', kind: 'gold', color: ED.red, emoji: '🔥', desc: 'on fire mode' },
  { id: 'goal', name: 'GOOOAL', kind: 'gold', color: ED.green, emoji: '⚽', desc: 'stadium roar' },
  { id: 'cake', name: 'BIRTHDAY', kind: 'paper', color: ED.pink, emoji: '🎂', desc: 'sprinkle bomb' }
];

export type PayloadId = Payload['id'];

export interface Fuse {
  id: 'now' | 'visit' | 'refresh' | '1h';
  name: string;
  hint: string;
}

export const FUSES: Fuse[] = [
  { id: 'now', name: 'NOW', hint: 'fires on save' },
  { id: 'visit', name: 'NEXT VISIT', hint: 'first time' },
  { id: 'refresh', name: 'ON REFRESH', hint: 'every reload' },
  { id: '1h', name: '+1 HOUR', hint: 'one hour from now' }
];

export type FuseId = Fuse['id'];

export interface MoodOption {
  id: Mood;
  label: string;
  color: string;
}

// Aligned to SiteContent's Mood union ('on-fire' not 'fire', 'in-school' not 'school').
export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'online', label: 'ONLINE', color: ED.green },
  { id: 'on-fire', label: 'ON FIRE', color: ED.red },
  { id: 'streaming', label: 'STREAMING', color: ED.pink },
  { id: 'in-school', label: 'IN SCHOOL', color: ED.amber },
  { id: 'sleeping', label: 'SLEEPING', color: ED.blue }
];

export const NOW_PLAYING_PRESETS: Record<'gaming' | 'football', string[]> = {
  gaming: ['Fortnite — Zero Build', 'Roblox', 'Brawl Stars', 'FC 25 Career Mode', 'Minecraft'],
  football: ['Real Madrid', 'Brazil NT', 'Liverpool', 'Arsenal', 'Vinicius Jr.']
};
