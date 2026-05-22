// Gaming-mode color palettes. Content (labels, copy, stat names, fonts)
// is theme-agnostic and lives elsewhere — each theme here is COLORS ONLY.
//
// To add a theme:
//   1. Append an entry to GAMING_THEMES below
//   2. Add the key to GAMING_THEME_ORDER
//   3. Add a matching `html.gaming.theme-X` block to app/globals.css
//
// To remove a theme:
//   1. Delete from GAMING_THEMES + GAMING_THEME_ORDER
//   2. Delete the CSS block in globals.css
//   3. If any visitor's localStorage still points to the removed key,
//      isGamingThemeKey returns false at hydration and they fall back
//      to DEFAULT_GAMING_THEME — no manual cleanup needed.

export interface GamingTheme {
  key: string;
  name: string; // ALL-CAPS short label
  tagline: string; // "category · descriptor"
  bgA: string;
  bgB: string;
  bgC: string;
  fg: string;
  accent: string;
  accent2: string;
  accent3: string;
  line: string;
  card: string;
  cardBorder: string;
  ctaA: string;
  ctaB: string;
  ctaText: string;
  coverA: string;
  coverB: string;
  burstKind: 'gold' | 'neon' | 'paper' | 'glass' | 'confetti';
}

export const GAMING_THEMES: Record<string, GamingTheme> = {
  neon: {
    key: 'neon',
    name: 'NEON',
    tagline: 'arcade · cyan + magenta',
    bgA: '#08010c',
    bgB: '#1a0838',
    bgC: '#3a0a5a',
    fg: '#ffffff',
    accent: '#00f0ff',
    accent2: '#ff2bd6',
    accent3: '#ffe600',
    line: 'rgba(0,240,255,0.15)',
    card: 'rgba(60,30,120,0.45)',
    cardBorder: 'rgba(0,240,255,0.4)',
    ctaA: '#ff2bd6',
    ctaB: '#9a0096',
    ctaText: '#0a0420',
    coverA: '#3a0a5a',
    coverB: '#1a0838',
    burstKind: 'neon'
  },
  toxic: {
    key: 'toxic',
    name: 'HAZARD',
    tagline: 'tactical · acid lime',
    bgA: '#040c08',
    bgB: '#0e2418',
    bgC: '#1a4226',
    fg: '#ffffff',
    accent: '#b8ff00',
    accent2: '#ff5500',
    accent3: '#ff003c',
    line: 'rgba(184,255,0,0.16)',
    card: 'rgba(20,50,30,0.55)',
    cardBorder: 'rgba(184,255,0,0.45)',
    ctaA: '#b8ff00',
    ctaB: '#5a8a00',
    ctaText: '#0a1410',
    coverA: '#1a4226',
    coverB: '#040c08',
    burstKind: 'neon'
  },
  lava: {
    key: 'lava',
    name: 'LAVA',
    tagline: 'forge · molten orange',
    bgA: '#070300',
    bgB: '#1a0a04',
    bgC: '#2e1810',
    fg: '#ffffff',
    accent: '#ff6a00',
    accent2: '#ffae42',
    accent3: '#ff1744',
    line: 'rgba(255,106,0,0.16)',
    card: 'rgba(50,18,8,0.55)',
    cardBorder: 'rgba(255,106,0,0.45)',
    ctaA: '#ff6a00',
    ctaB: '#b04200',
    ctaText: '#1a0500',
    coverA: '#2e1810',
    coverB: '#070300',
    burstKind: 'gold'
  },
  mono: {
    key: 'mono',
    name: 'GLITCH',
    tagline: 'mono · siren red',
    bgA: '#050505',
    bgB: '#0e0e0e',
    bgC: '#1a1a1a',
    fg: '#ffffff',
    accent: '#ff2400',
    accent2: '#ffffff',
    accent3: '#ffd700',
    line: 'rgba(255,255,255,0.10)',
    card: 'rgba(20,20,20,0.65)',
    cardBorder: 'rgba(255,36,0,0.5)',
    ctaA: '#ff2400',
    ctaB: '#a01400',
    ctaText: '#ffffff',
    coverA: '#0e0e0e',
    coverB: '#000000',
    burstKind: 'paper'
  },
  crt: {
    key: 'crt',
    name: 'CRT',
    tagline: 'arcade · phosphor green',
    bgA: '#000400',
    bgB: '#001a08',
    bgC: '#002f12',
    fg: '#d9ffd0',
    accent: '#39ff14',
    accent2: '#ffaa00',
    accent3: '#ff003c',
    line: 'rgba(57,255,20,0.18)',
    card: 'rgba(0,30,15,0.55)',
    cardBorder: 'rgba(57,255,20,0.45)',
    ctaA: '#39ff14',
    ctaB: '#1a8800',
    ctaText: '#000800',
    coverA: '#002f12',
    coverB: '#000400',
    burstKind: 'neon'
  },
  deep: {
    key: 'deep',
    name: 'DEEP',
    tagline: 'oceanic · indigo + coral',
    bgA: '#02061a',
    bgB: '#0a1238',
    bgC: '#1a2a6c',
    fg: '#e8f0ff',
    accent: '#6c8bff',
    accent2: '#ff7a8a',
    accent3: '#ffd700',
    line: 'rgba(108,139,255,0.18)',
    card: 'rgba(20,30,80,0.55)',
    cardBorder: 'rgba(108,139,255,0.42)',
    ctaA: '#6c8bff',
    ctaB: '#2d4abf',
    ctaText: '#02061a',
    coverA: '#1a2a6c',
    coverB: '#02061a',
    burstKind: 'neon'
  },

  // Light themes — flip the canvas. Consumed by isLightGamingTheme so
  // dark-assuming overlays can adapt.
  paper: {
    key: 'paper',
    name: 'PAPER',
    tagline: 'kraft · warm orange + ink',
    bgA: '#f3ede0',
    bgB: '#fbf6ea',
    bgC: '#fffaf0',
    fg: '#1a140a',
    accent: '#ff5a1f',
    accent2: '#1a140a',
    accent3: '#0f7b5a',
    line: 'rgba(26,20,10,0.12)',
    card: 'rgba(255,250,240,0.85)',
    cardBorder: 'rgba(26,20,10,0.18)',
    ctaA: '#ff5a1f',
    ctaB: '#c63a00',
    ctaText: '#fffaf0',
    coverA: '#fbf6ea',
    coverB: '#f3ede0',
    burstKind: 'paper'
  },
  ice: {
    key: 'ice',
    name: 'ICE',
    tagline: 'frost · pale cyan',
    bgA: '#dbe9f2',
    bgB: '#ecf4fa',
    bgC: '#f7fbff',
    fg: '#0a2540',
    accent: '#0084ff',
    accent2: '#00b4d8',
    accent3: '#ff3d6a',
    line: 'rgba(10,37,64,0.10)',
    card: 'rgba(255,255,255,0.75)',
    cardBorder: 'rgba(0,132,255,0.30)',
    ctaA: '#0084ff',
    ctaB: '#0057b3',
    ctaText: '#ffffff',
    coverA: '#ecf4fa',
    coverB: '#dbe9f2',
    burstKind: 'glass'
  },
  storm: {
    key: 'storm',
    name: 'STORM',
    tagline: 'sport · slate + royal blue',
    bgA: '#bcc4cf',
    bgB: '#d8dde5',
    bgC: '#eef0f4',
    fg: '#0a0f1a',
    accent: '#2563eb',
    accent2: '#0a0f1a',
    accent3: '#f97316',
    line: 'rgba(10,15,26,0.10)',
    card: 'rgba(255,255,255,0.75)',
    cardBorder: 'rgba(37,99,235,0.32)',
    ctaA: '#2563eb',
    ctaB: '#1e40af',
    ctaText: '#ffffff',
    coverA: '#d8dde5',
    coverB: '#bcc4cf',
    burstKind: 'glass'
  }
};

// Display order in the picker. Dark themes first, light themes last
// (so visitors discover the dark canvas — the original site identity —
// before the light variants).
export const GAMING_THEME_ORDER = [
  'neon',
  'toxic',
  'lava',
  'mono',
  'crt',
  'deep',
  'paper',
  'ice',
  'storm'
] as const;

export type GamingThemeKey = (typeof GAMING_THEME_ORDER)[number];

export const DEFAULT_GAMING_THEME: GamingThemeKey = 'neon';

export const isGamingThemeKey = (v: unknown): v is GamingThemeKey =>
  typeof v === 'string' && v in GAMING_THEMES;

// Whether the theme's canvas is light. Derived from bgA luminance — do
// NOT add an isLight flag to the registry (contributors will forget to
// set it on new themes; derivation is foolproof).
export const isLightGamingTheme = (t: GamingTheme): boolean => {
  const h = t.bgA.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
};

// Hex → RGB triple. Used by the theme-aware color helpers below.
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ];
};

// Per-perceived-luminance check on a foreground color. The polish-pass
// helpers below use this to decide whether a backdrop should be black
// (when fg is light → page bg must be dark) or fg-tinted (when fg is
// dark → page bg must be light).
const fgIsLight = (fg: string): boolean => {
  const [r, g, b] = hexToRgb(fg);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
};

// Returns an rgba backdrop that adapts to the theme it sits on:
//   dark theme (light fg) → rgba(0,0,0,alpha)   — original "dark hole" look
//   light theme (dark fg) → rgba(fg-as-rgb,alpha) — soft ink-tint instead
// Pass `theme.fg` from any ArenaTheme / TunnelTheme / GamingTheme.
export const themedBackdrop = (fg: string, alpha: number): string => {
  if (fgIsLight(fg)) {
    return `rgba(0,0,0,${alpha})`;
  }
  const [r, g, b] = hexToRgb(fg);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Mirror of themedBackdrop but returns the fg color at the given alpha
// regardless of theme — used for text-dim sites (e.g. "subtitle at 70%")
// that should ALWAYS be the active fg color faded, not hardcoded white.
export const themedFg = (fg: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(fg);
  return `rgba(${r},${g},${b},${alpha})`;
};
