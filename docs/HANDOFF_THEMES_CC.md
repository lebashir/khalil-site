# Handoff — Gaming themes (delta on top of existing Next.js implementation)

This is **additive only** — the existing `ModeProvider` / `PALETTE` /
CSS-var architecture stays exactly as-is. Adds a parallel
**`GamingThemeProvider`** that swaps the gaming-mode colors at runtime
without touching football, mode-flip timing, or any content code.

**Estimated scope:** 3 new files + 7 small edits. No refactors.

---

## What's already in place (do NOT redo)

- `ModeProvider` — mode state + localStorage + html class
- `PALETTE` (`components/topbar/palette.ts`) — single source of truth for raw hex per mode
- CSS-var mirror in `globals.css` keyed on `html.gaming` / `html.football`
- `THEMES` in `components/arena/theme.ts` and `components/tunnel/theme.ts` — extend `PALETTE` with per-area extras
- `TopBarMode` + `ModeFlipOverlay` — consume `PALETTE`
- `ThemeColor.tsx` — mutates iOS status bar meta on mode change

The theme system **wraps** this. Football stays single-palette by design (Real Madrid identity).

---

## The mental model

```
mode    = 'gaming' | 'football'           ← ModeProvider (already exists)
themeKey = 'neon' | 'storm' | ...         ← GamingThemeProvider (NEW)

When mode === 'gaming':
  PALETTE.gaming    ← TEMPLATE (label / emoji / sub / ink)
  GAMING_THEMES[themeKey]  ← COLORS (bgA/B/C, accent, accent2, accent3, fg, ...)
  → merged at render time via getGamingPalette(themeKey)

When mode === 'football':
  PALETTE.football  ← unchanged. themeKey is ignored.
```

`<html>` gets TWO classes: the mode class (existing) + a theme class (new). CSS vars are scoped to the combo.

```html
<html class="gaming theme-storm">   <!-- swap theme-storm → theme-neon to repaint -->
<html class="football theme-storm"> <!-- theme-X is ignored in football -->
```

---

## File-by-file changes

### NEW · `lib/gaming-themes.ts`

The theme registry. Pure data — no React.

```ts
// lib/gaming-themes.ts
// Color palettes for gaming mode. Content (labels, copy, stat names)
// is theme-agnostic and lives in content.json. Each theme is COLORS ONLY.
//
// To add a theme: append an entry below + a key to GAMING_THEME_ORDER.
// To remove a theme: delete from BOTH places.

export interface GamingTheme {
  key: string;
  name: string;       // ALL CAPS short label
  tagline: string;    // "category · descriptor"
  bgA: string; bgB: string; bgC: string;
  fg: string;
  accent: string; accent2: string; accent3: string;
  line: string;
  card: string;
  cardBorder: string;
  ctaA: string; ctaB: string; ctaText: string;
  coverA: string; coverB: string;
  burstKind: 'gold' | 'neon' | 'paper' | 'glass' | 'confetti';
}

export const GAMING_THEMES: Record<string, GamingTheme> = {
  neon:  { key: 'neon',  name: 'NEON',   tagline: 'arcade · cyan + magenta',
    bgA: '#08010c', bgB: '#1a0838', bgC: '#3a0a5a', fg: '#ffffff',
    accent: '#00f0ff', accent2: '#ff2bd6', accent3: '#ffe600',
    line: 'rgba(0,240,255,0.15)', card: 'rgba(60,30,120,0.45)',
    cardBorder: 'rgba(0,240,255,0.4)',
    ctaA: '#ff2bd6', ctaB: '#9a0096', ctaText: '#0a0420',
    coverA: '#3a0a5a', coverB: '#1a0838', burstKind: 'neon' },
  toxic: { key: 'toxic', name: 'HAZARD', tagline: 'tactical · acid lime',
    bgA: '#040c08', bgB: '#0e2418', bgC: '#1a4226', fg: '#ffffff',
    accent: '#b8ff00', accent2: '#ff5500', accent3: '#ff003c',
    line: 'rgba(184,255,0,0.16)', card: 'rgba(20,50,30,0.55)',
    cardBorder: 'rgba(184,255,0,0.45)',
    ctaA: '#b8ff00', ctaB: '#5a8a00', ctaText: '#0a1410',
    coverA: '#1a4226', coverB: '#040c08', burstKind: 'neon' },
  lava:  { key: 'lava',  name: 'LAVA',   tagline: 'forge · molten orange',
    bgA: '#070300', bgB: '#1a0a04', bgC: '#2e1810', fg: '#ffffff',
    accent: '#ff6a00', accent2: '#ffae42', accent3: '#ff1744',
    line: 'rgba(255,106,0,0.16)', card: 'rgba(50,18,8,0.55)',
    cardBorder: 'rgba(255,106,0,0.45)',
    ctaA: '#ff6a00', ctaB: '#b04200', ctaText: '#1a0500',
    coverA: '#2e1810', coverB: '#070300', burstKind: 'gold' },
  mono:  { key: 'mono',  name: 'GLITCH', tagline: 'mono · siren red',
    bgA: '#050505', bgB: '#0e0e0e', bgC: '#1a1a1a', fg: '#ffffff',
    accent: '#ff2400', accent2: '#ffffff', accent3: '#ffd700',
    line: 'rgba(255,255,255,0.10)', card: 'rgba(20,20,20,0.65)',
    cardBorder: 'rgba(255,36,0,0.5)',
    ctaA: '#ff2400', ctaB: '#a01400', ctaText: '#ffffff',
    coverA: '#0e0e0e', coverB: '#000000', burstKind: 'paper' },
  crt:   { key: 'crt',   name: 'CRT',    tagline: 'arcade · phosphor green',
    bgA: '#000400', bgB: '#001a08', bgC: '#002f12', fg: '#d9ffd0',
    accent: '#39ff14', accent2: '#ffaa00', accent3: '#ff003c',
    line: 'rgba(57,255,20,0.18)', card: 'rgba(0,30,15,0.55)',
    cardBorder: 'rgba(57,255,20,0.45)',
    ctaA: '#39ff14', ctaB: '#1a8800', ctaText: '#000800',
    coverA: '#002f12', coverB: '#000400', burstKind: 'neon' },
  deep:  { key: 'deep',  name: 'DEEP',   tagline: 'oceanic · indigo + coral',
    bgA: '#02061a', bgB: '#0a1238', bgC: '#1a2a6c', fg: '#e8f0ff',
    accent: '#6c8bff', accent2: '#ff7a8a', accent3: '#ffd700',
    line: 'rgba(108,139,255,0.18)', card: 'rgba(20,30,80,0.55)',
    cardBorder: 'rgba(108,139,255,0.42)',
    ctaA: '#6c8bff', ctaB: '#2d4abf', ctaText: '#02061a',
    coverA: '#1a2a6c', coverB: '#02061a', burstKind: 'neon' },

  // ── light themes (NEW direction — flip the canvas) ──
  paper: { key: 'paper', name: 'PAPER',  tagline: 'kraft · warm orange + ink',
    bgA: '#f3ede0', bgB: '#fbf6ea', bgC: '#fffaf0', fg: '#1a140a',
    accent: '#ff5a1f', accent2: '#1a140a', accent3: '#0f7b5a',
    line: 'rgba(26,20,10,0.12)', card: 'rgba(255,250,240,0.85)',
    cardBorder: 'rgba(26,20,10,0.18)',
    ctaA: '#ff5a1f', ctaB: '#c63a00', ctaText: '#fffaf0',
    coverA: '#fbf6ea', coverB: '#f3ede0', burstKind: 'paper' },
  ice:   { key: 'ice',   name: 'ICE',    tagline: 'frost · pale cyan',
    bgA: '#dbe9f2', bgB: '#ecf4fa', bgC: '#f7fbff', fg: '#0a2540',
    accent: '#0084ff', accent2: '#00b4d8', accent3: '#ff3d6a',
    line: 'rgba(10,37,64,0.10)', card: 'rgba(255,255,255,0.75)',
    cardBorder: 'rgba(0,132,255,0.30)',
    ctaA: '#0084ff', ctaB: '#0057b3', ctaText: '#ffffff',
    coverA: '#ecf4fa', coverB: '#dbe9f2', burstKind: 'glass' },
  storm: { key: 'storm', name: 'STORM',  tagline: 'sport · slate + royal blue',
    bgA: '#bcc4cf', bgB: '#d8dde5', bgC: '#eef0f4', fg: '#0a0f1a',
    accent: '#2563eb', accent2: '#0a0f1a', accent3: '#f97316',
    line: 'rgba(10,15,26,0.10)', card: 'rgba(255,255,255,0.75)',
    cardBorder: 'rgba(37,99,235,0.32)',
    ctaA: '#2563eb', ctaB: '#1e40af', ctaText: '#ffffff',
    coverA: '#d8dde5', coverB: '#bcc4cf', burstKind: 'glass' },
};

export const GAMING_THEME_ORDER = [
  'neon', 'toxic', 'lava', 'mono', 'crt', 'deep', 'paper', 'ice', 'storm',
] as const;

export type GamingThemeKey = typeof GAMING_THEME_ORDER[number];

export const DEFAULT_GAMING_THEME: GamingThemeKey = 'neon';

export const isGamingThemeKey = (v: unknown): v is GamingThemeKey =>
  typeof v === 'string' && v in GAMING_THEMES;

// Whether the theme's canvas is light (used to flex dark-assuming overlays).
// Derived from bgA luminance — do NOT add an isLight flag to the registry
// (contributors will forget to set it on new themes).
export const isLightGamingTheme = (t: GamingTheme): boolean => {
  const h = t.bgA.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
};
```

---

### NEW · `components/GamingThemeProvider.tsx`

Mirrors `ModeProvider` exactly. Mount it INSIDE `ModeProvider` in `app/layout.tsx`.

```tsx
'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import {
  GAMING_THEMES, DEFAULT_GAMING_THEME, isGamingThemeKey,
  type GamingThemeKey, type GamingTheme,
} from '@/lib/gaming-themes';

interface ThemeContextValue {
  themeKey: GamingThemeKey;
  setThemeKey: (k: GamingThemeKey) => void;
  theme: GamingTheme;
}

const GamingThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'khalil-gaming-theme';

interface Props {
  initialKey: GamingThemeKey;
  children: ReactNode;
}

export const GamingThemeProvider = ({ initialKey, children }: Props) => {
  const [themeKey, setKeyState] = useState<GamingThemeKey>(initialKey);

  // Sync from the pre-hydration <head> script (read class off <html>).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const cls = Array.from(document.documentElement.classList)
      .find((c) => c.startsWith('theme-'));
    const k = cls?.slice('theme-'.length);
    if (k && isGamingThemeKey(k) && k !== themeKey) setKeyState(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThemeKey = useCallback((next: GamingThemeKey) => {
    setKeyState(next);
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      Array.from(html.classList)
        .filter((c) => c.startsWith('theme-'))
        .forEach((c) => html.classList.remove(c));
      html.classList.add(`theme-${next}`);
    }
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode */ }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeKey, setThemeKey, theme: GAMING_THEMES[themeKey] }),
    [themeKey, setThemeKey],
  );

  return (
    <GamingThemeContext.Provider value={value}>
      {children}
    </GamingThemeContext.Provider>
  );
};

export const useGamingTheme = (): ThemeContextValue => {
  const ctx = useContext(GamingThemeContext);
  if (!ctx) throw new Error('useGamingTheme must be used inside <GamingThemeProvider>');
  return ctx;
};
```

---

### EDIT · `app/layout.tsx`

Wrap `ModeFlipProvider` in `GamingThemeProvider` + extend the inline pre-hydration script to set the theme class.

```diff
+ import { GamingThemeProvider } from '@/components/GamingThemeProvider';
+ import { DEFAULT_GAMING_THEME, isGamingThemeKey, GAMING_THEMES } from '@/lib/gaming-themes';
  ...

  const inlineModeScript = `
    (function() {
      try {
        var s = localStorage.getItem('khalil-mode');
        var m = (s === 'gaming' || s === 'football') ? s : '${defaultMode}';
        document.documentElement.classList.add(m);
+       var t = localStorage.getItem('khalil-gaming-theme');
+       var validThemes = ${JSON.stringify(Object.keys(GAMING_THEMES))};
+       var theme = (t && validThemes.indexOf(t) !== -1) ? t : '${DEFAULT_GAMING_THEME}';
+       document.documentElement.classList.add('theme-' + theme);
      } catch (e) {
        document.documentElement.classList.add('${defaultMode}');
+       document.documentElement.classList.add('theme-${DEFAULT_GAMING_THEME}');
      }
    })();
  `;
  ...

  <ModeProvider initialMode={defaultMode}>
    <ThemeColor />
+   <GamingThemeProvider initialKey={DEFAULT_GAMING_THEME}>
      <ModeFlipProvider>{children}</ModeFlipProvider>
+   </GamingThemeProvider>
    <MuteToggle />
  </ModeProvider>
```

The inline script must include the `'theme-X'` class so first paint matches the user's saved choice — no FOUC.

---

### EDIT · `app/globals.css`

The current `html.gaming { --bg-1: ... }` block hard-codes neon. Change it so the gaming CSS vars are driven by the **`html.theme-X`** class instead, layered with `html.gaming`. Football stays untouched.

Replace the existing gaming block with:

```css
/* Gaming CSS vars are now theme-keyed. Each html.gaming.theme-X block
   maps to a row in lib/gaming-themes.ts. The :root fallback is neon —
   matches DEFAULT_GAMING_THEME. */
:root { /* gaming/neon defaults (used before JS hydrates the class) */
  --bg-1: #08010c;  --bg-2: #1a0838;  --bg-3: #3a0a5a;
  --accent: #00f0ff;  --accent-2: #ff2bd6;  --accent-3: #ffe600;
  --text: #ffffff;  --text-dim: #b8c4ff;
  --card: rgba(60,30,120,0.45);
  --card-border: rgba(0,240,255,0.4);
  --glow: 0 0 28px rgba(0,240,255,0.55), 0 0 60px rgba(255,43,214,0.3);
  --display-font: 'Bungee', cursive;
}
html.gaming.theme-neon,   .preview-scope.gaming.theme-neon  { /* same as :root */ }
html.gaming.theme-toxic,  .preview-scope.gaming.theme-toxic  { --bg-1: #040c08; --bg-2: #0e2418; --bg-3: #1a4226;
  --accent: #b8ff00; --accent-2: #ff5500; --accent-3: #ff003c;
  --card: rgba(20,50,30,0.55); --card-border: rgba(184,255,0,0.45);
  --glow: 0 0 28px rgba(184,255,0,0.55), 0 0 60px rgba(255,85,0,0.3); }
html.gaming.theme-lava,   .preview-scope.gaming.theme-lava   { --bg-1: #070300; --bg-2: #1a0a04; --bg-3: #2e1810;
  --accent: #ff6a00; --accent-2: #ffae42; --accent-3: #ff1744;
  --card: rgba(50,18,8,0.55); --card-border: rgba(255,106,0,0.45);
  --glow: 0 0 28px rgba(255,106,0,0.55), 0 0 60px rgba(255,174,66,0.3); }
html.gaming.theme-mono,   .preview-scope.gaming.theme-mono   { --bg-1: #050505; --bg-2: #0e0e0e; --bg-3: #1a1a1a;
  --accent: #ff2400; --accent-2: #ffffff; --accent-3: #ffd700;
  --card: rgba(20,20,20,0.65); --card-border: rgba(255,36,0,0.5);
  --glow: 0 0 28px rgba(255,36,0,0.55), 0 0 60px rgba(255,255,255,0.2); }
html.gaming.theme-crt,    .preview-scope.gaming.theme-crt    { --bg-1: #000400; --bg-2: #001a08; --bg-3: #002f12;
  --accent: #39ff14; --accent-2: #ffaa00; --accent-3: #ff003c; --text: #d9ffd0;
  --card: rgba(0,30,15,0.55); --card-border: rgba(57,255,20,0.45);
  --glow: 0 0 28px rgba(57,255,20,0.55), 0 0 60px rgba(255,170,0,0.3); }
html.gaming.theme-deep,   .preview-scope.gaming.theme-deep   { --bg-1: #02061a; --bg-2: #0a1238; --bg-3: #1a2a6c; --text: #e8f0ff;
  --accent: #6c8bff; --accent-2: #ff7a8a; --accent-3: #ffd700;
  --card: rgba(20,30,80,0.55); --card-border: rgba(108,139,255,0.42);
  --glow: 0 0 28px rgba(108,139,255,0.55), 0 0 60px rgba(255,122,138,0.3); }

/* Light themes — invert text + lighten card chrome */
html.gaming.theme-paper,  .preview-scope.gaming.theme-paper  { --bg-1: #f3ede0; --bg-2: #fbf6ea; --bg-3: #fffaf0; --text: #1a140a; --text-dim: #5a4a2a;
  --accent: #ff5a1f; --accent-2: #1a140a; --accent-3: #0f7b5a;
  --card: rgba(255,250,240,0.85); --card-border: rgba(26,20,10,0.18);
  --glow: 0 0 28px rgba(255,90,31,0.35), 0 0 60px rgba(26,20,10,0.15); }
html.gaming.theme-ice,    .preview-scope.gaming.theme-ice    { --bg-1: #dbe9f2; --bg-2: #ecf4fa; --bg-3: #f7fbff; --text: #0a2540; --text-dim: #4a6a8a;
  --accent: #0084ff; --accent-2: #00b4d8; --accent-3: #ff3d6a;
  --card: rgba(255,255,255,0.75); --card-border: rgba(0,132,255,0.30);
  --glow: 0 0 28px rgba(0,132,255,0.40), 0 0 60px rgba(0,180,216,0.20); }
html.gaming.theme-storm,  .preview-scope.gaming.theme-storm  { --bg-1: #bcc4cf; --bg-2: #d8dde5; --bg-3: #eef0f4; --text: #0a0f1a; --text-dim: #3a4a5a;
  --accent: #2563eb; --accent-2: #0a0f1a; --accent-3: #f97316;
  --card: rgba(255,255,255,0.75); --card-border: rgba(37,99,235,0.32);
  --glow: 0 0 28px rgba(37,99,235,0.40), 0 0 60px rgba(249,115,22,0.20); }
```

**Keep `html.football { ... }` exactly as-is** — football ignores theme. The `.theme-X` class is harmless when football is active.

---

### EDIT · `components/topbar/palette.ts`

Make `PALETTE.gaming` a **template** (label/emoji/sub/ink only). Add a `getGamingPalette(themeKey)` helper.

```diff
+ import { GAMING_THEMES, DEFAULT_GAMING_THEME, type GamingThemeKey } from '@/lib/gaming-themes';
  ...

  export const PALETTE: Record<Mode, ModePalette> = {
    gaming: {
+     // colors filled at render time by getGamingPalette(themeKey)
+     bgA: '', bgB: '', bgC: '',
+     accent: '', accent2: '', accent3: '',
-     bgA: '#0e0030', bgB: '#3a0a5a', bgC: '#5a14a0',
-     accent: '#00f0ff', accent2: '#ff2bd6', accent3: '#ffe600',
      ink: '#ffffff',
      label: 'GAMING',
      emoji: '🎮',
      sub: 'streamer · gamer · goat',
+     seamGlow: '',
-     seamGlow: 'rgba(0,240,255,0.7)',
    },
    football: { /* unchanged */ },
  };

+ const hexA = (hex: string, a: number) => {
+   const h = hex.replace('#', '');
+   return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
+ };
+
+ // Merge the gaming template with the active theme's colors. Use this
+ // instead of `PALETTE.gaming` directly in any component that paints with
+ // raw hex (TopBarMode, ModeFlipOverlay).
+ export const getGamingPalette = (themeKey: GamingThemeKey): ModePalette => {
+   const t = GAMING_THEMES[themeKey] ?? GAMING_THEMES[DEFAULT_GAMING_THEME];
+   return {
+     ...PALETTE.gaming,
+     bgA: t.bgA, bgB: t.bgB, bgC: t.bgC,
+     accent: t.accent, accent2: t.accent2, accent3: t.accent3,
+     ink: t.fg,
+     seamGlow: hexA(t.accent, 0.7),
+   };
+ };
+
+ // Mode-agnostic resolver — pass the active gaming theme key; ignored for football.
+ export const getPalette = (mode: Mode, themeKey: GamingThemeKey): ModePalette =>
+   mode === 'gaming' ? getGamingPalette(themeKey) : PALETTE.football;
```

---

### EDIT · `components/topbar/TopBarMode.tsx`

Subscribe to the theme + use `getGamingPalette`:

```diff
- import { PALETTE, type ModePalette } from './palette';
+ import { PALETTE, getGamingPalette, type ModePalette } from './palette';
+ import { useGamingTheme } from '@/components/GamingThemeProvider';
  ...

  // inside the component, where pGaming/pFoot are computed:
+ const { themeKey } = useGamingTheme();
- const pGaming = PALETTE.gaming;
+ const pGaming = getGamingPalette(themeKey);
  const pFoot = PALETTE.football;
```

(Find the existing `pGaming` / `pFoot` assignments and swap them. Everything below uses these references and keeps working unchanged.)

---

### EDIT · `components/topbar/ModeFlipOverlay.tsx`

Same pattern — flip animation needs to paint in the active theme on the gaming side:

```diff
- import { PALETTE } from './palette';
+ import { getPalette } from './palette';
+ import { useGamingTheme } from '@/components/GamingThemeProvider';
  ...

  export const ModeFlipOverlay = ({ transition }: Props) => {
    if (!transition) return null;
    const { from, to, nonce } = transition;
+   const { themeKey } = useGamingTheme();
-   const fromP = PALETTE[from];
-   const toP = PALETTE[to];
+   const fromP = getPalette(from, themeKey);
+   const toP   = getPalette(to,   themeKey);
```

---

### EDIT · `components/arena/theme.ts`

Currently `THEMES.gaming` is a static merge of `PALETTE.gaming` + arena extras. Convert to a function returning the active theme:

```diff
+ import { GAMING_THEMES, DEFAULT_GAMING_THEME, type GamingThemeKey } from '@/lib/gaming-themes';
+ import { getGamingPalette } from '@/components/topbar/palette';
  ...

  // Replace the constant export with a resolver. Call sites pass the
  // active theme key (from useGamingTheme()).
- export const THEMES: Record<Mode, ArenaTheme> = {
-   gaming: { ...PALETTE.gaming, fg: '#ffffff', line: 'rgba(0,240,255,0.15)', ... },
-   football: { ...PALETTE.football, ... },
- };

+ export const FOOTBALL_THEME: ArenaTheme = {
+   ...PALETTE.football,
+   fg: '#ffffff', line: 'rgba(255,215,0,0.18)', card: 'rgba(0,30,90,0.55)',
+   cardBorder: 'rgba(255,215,0,0.5)', ctaA: '#ffd700', ctaB: '#b58a00',
+   sectionLabel: 'LINEUP', role: 'STRIKER', role2: 'MADRIDISTA', role3: 'FOREVER 7',
+   burstKind: 'gold', titleA: 'KHALIL', titleB: 'THE GOAT',
+   coverA: '#003366', coverB: '#001233',
+   sceneBgA: '#001233', sceneBgB: '#003366', sceneBgC: '#0a4a2a',
+ };
+
+ export const getArenaTheme = (mode: Mode, themeKey: GamingThemeKey): ArenaTheme => {
+   if (mode === 'football') return FOOTBALL_THEME;
+   const t = GAMING_THEMES[themeKey] ?? GAMING_THEMES[DEFAULT_GAMING_THEME];
+   return {
+     ...getGamingPalette(themeKey),
+     fg: t.fg, line: t.line, card: t.card, cardBorder: t.cardBorder,
+     ctaA: t.ctaA, ctaB: t.ctaB,
+     sectionLabel: 'LOADOUT', role: 'STREAMER', role2: 'GAMER', role3: 'GOAT',
+     burstKind: t.burstKind === 'paper' || t.burstKind === 'glass' || t.burstKind === 'confetti'
+       ? 'neon'  // ArenaTheme.burstKind is narrower; map for arena consumers
+       : t.burstKind,
+     titleA: 'KHALIL', titleB: 'THE GOAT',
+     coverA: t.coverA, coverB: t.coverB,
+     sceneBgA: t.bgA, sceneBgB: t.bgB, sceneBgC: t.bgC,
+   };
+ };
```

Update every existing call site `THEMES[mode]` → `getArenaTheme(mode, themeKey)`. Grep tells me there's one in `ArenaShell.tsx`. Read the theme key via `useGamingTheme()` at the shell level and pass `t` down through props (already the pattern).

---

### EDIT · `components/tunnel/theme.ts`

Same pattern. `TUNNEL_THEMES` becomes `getTunnelTheme(mode, themeKey)`. Update `TunnelShell.tsx` accordingly — `const themeKey = useGamingTheme().themeKey; const theme = getTunnelTheme(mode, themeKey);`.

---

### EDIT · 3 hardcoded purple stops in arena cards

Found via grep — these read `theme.accent` but hard-code the dark background stop. They'll look wrong on every non-neon dark theme AND every light theme. Replace with `theme.bgA` / `theme.bgB` / `theme.bgC`:

**`components/arena/cards/CardPortrait.tsx:61`**
```diff
- `radial-gradient(ellipse at 50% 30%, ${theme.accent}55 0%, #1a0838 70%)`
+ `radial-gradient(ellipse at 50% 30%, ${theme.accent}55 0%, ${theme.bgB} 70%)`
```

**`components/arena/cards/CardPortrait.tsx:77`**
```diff
- 'linear-gradient(180deg, #0e0625 0%, #2a0f5a 100%)'
+ `linear-gradient(180deg, ${theme.bgA} 0%, ${theme.bgB} 100%)`
```

**`components/arena/cards/CardEmblem.tsx:56`**
```diff
- 'linear-gradient(135deg, #1a0838 0%, #3a0a5a 50%, #ff2bd6 130%)'
+ `linear-gradient(135deg, ${theme.bgB} 0%, ${theme.bgC} 50%, ${theme.accent}cc 130%)`
```

**`components/arena/VideoCard.tsx:87`** — this is a tile fallback background. The full-bleed tile uses a tier gradient when one is set. Read it in context — if it's the "no thumbnail yet" placeholder, use `theme.bgB` / `theme.bgA`:
```diff
- 'linear-gradient(135deg, #1a0838, #0a0420)'
+ `linear-gradient(135deg, ${theme.bgB}, ${theme.bgA})`
```

---

### EDIT · `components/ThemeColor.tsx`

Read the active theme's `bgA` so the iOS status bar matches the picked theme, not just the mode.

```diff
- import { useMode } from '@/components/ModeProvider';
+ import { useMode } from '@/components/ModeProvider';
+ import { useGamingTheme } from '@/components/GamingThemeProvider';
+ import { PALETTE } from '@/components/topbar/palette';

- const COLORS = {
-   gaming: '#0e0030',
-   football: '#001233'
- } as const;

  export const ThemeColor = () => {
    const { mode } = useMode();
+   const { theme } = useGamingTheme();
    useEffect(() => {
      if (typeof document === 'undefined') return;
      const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
-     if (meta) meta.setAttribute('content', COLORS[mode]);
+     const color = mode === 'gaming' ? theme.bgA : PALETTE.football.bgA;
+     if (meta) meta.setAttribute('content', color);
-   }, [mode]);
+   }, [mode, theme.bgA]);
    return null;
  };
```

---

### NEW · `app/themes/page.tsx`

The picker route. Self-contained — reuses the active mode + theme. See `design/Gaming Themes.html` in the project's `design/` folder for the live design (full preview cards, not just swatches).

Minimum viable version below — port the card mini-hero from the design file when you build it out.

```tsx
'use client';

import { useGamingTheme } from '@/components/GamingThemeProvider';
import { GAMING_THEMES, GAMING_THEME_ORDER, type GamingThemeKey } from '@/lib/gaming-themes';

export default function ThemesPage() {
  const { themeKey, setThemeKey } = useGamingTheme();
  return (
    <main style={{ maxWidth: 1360, margin: '0 auto', padding: '56px 32px 96px' }}>
      <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: 72, margin: '0 0 18px' }}>
        pick a vibe.
      </h1>
      <p style={{ maxWidth: 760, opacity: 0.7, marginBottom: 40 }}>
        Click any card to set it as active. Football mode is unchanged.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        {GAMING_THEME_ORDER.map((key) => {
          const t = GAMING_THEMES[key];
          const active = key === themeKey;
          return (
            <button key={key}
              onClick={() => setThemeKey(key as GamingThemeKey)}
              style={{
                textAlign: 'left', border: active ? `2px solid ${t.accent}` : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 24, cursor: 'pointer',
                background: `radial-gradient(ellipse at 50% 0%, ${t.bgC} 0%, ${t.bgB} 35%, ${t.bgA} 80%)`,
                color: t.fg, minHeight: 280,
                boxShadow: active ? `0 12px 40px ${t.accent}40, 0 0 80px ${t.accent}30` : 'none',
              }}>
              <div style={{ fontFamily: 'Anton', fontSize: 28, letterSpacing: 1.5 }}>{t.name}</div>
              <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: 1.5, opacity: 0.7, marginTop: 4 }}>
                {t.tagline}
              </div>
              {/* Replace with full mini-hero from design/Gaming Themes.html when you build it out */}
              <div style={{ marginTop: 32, fontFamily: 'Anton', fontSize: 64, lineHeight: 0.95 }}>KHALIL</div>
              <div style={{ fontFamily: 'Anton', fontSize: 48, lineHeight: 0.95,
                backgroundImage: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                THE GOAT
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
```

---

### NEW · `components/edit/deck/modules/ThemeModule.tsx`

A compact picker for the Control Deck launch tab. Add it to `ControlDeck.tsx`'s LaunchTab right-column.

```tsx
'use client';

import { useGamingTheme } from '@/components/GamingThemeProvider';
import { GAMING_THEMES, GAMING_THEME_ORDER, type GamingThemeKey } from '@/lib/gaming-themes';
import { Panel } from '../primitives';
import { ED, FONT } from '../constants';

export const ThemeModule = () => {
  const { themeKey, setThemeKey } = useGamingTheme();
  return (
    <Panel title="THEME.GAMING" kicker="// gaming-mode palette" accent={ED.pink}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {GAMING_THEME_ORDER.map((key) => {
          const t = GAMING_THEMES[key];
          const active = key === themeKey;
          return (
            <button key={key}
              onClick={() => setThemeKey(key as GamingThemeKey)}
              style={{
                padding: '10px 8px', cursor: 'pointer',
                background: active ? `linear-gradient(180deg, ${t.bgC}, ${t.bgA})` : 'rgba(0,0,0,0.4)',
                border: active ? `2px solid ${t.accent}` : `1px solid ${ED.line}`,
                color: active ? t.fg : ED.ink,
                fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.5,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
              <span style={{ fontFamily: 'Anton', fontSize: 14, letterSpacing: 1.5 }}>{t.name}</span>
              <span style={{ display: 'flex', gap: 3 }}>
                {[t.bgC, t.accent, t.accent2, t.accent3].map((c, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: '50%',
                    background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)' }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <a href="/themes" style={{
        display: 'block', marginTop: 12, fontFamily: FONT.mono, fontSize: 10,
        letterSpacing: 1.5, color: ED.amber, textDecoration: 'none',
      }}>OPEN FULL PICKER →</a>
    </Panel>
  );
};
```

Then in `ControlDeck.tsx`'s `LaunchTab`, add `<ThemeModule />` to the right-column list (after `<PinnedVideoModule />` is a natural spot).

---

## Verifying

1. **Hot path:** in dev, open `/themes`, click each theme. The arena, swipe bar, flip animation, AND iOS status bar meta should all repaint.
2. **No FOUC:** view-source the rendered HTML — `<html>` should already carry `class="gaming theme-X"` (or football) before any React boots.
3. **Flip animation:** swap to a non-neon theme, then flip to football and back. The gaming side of the flip slab + label glow uses the new theme; football is unchanged.
4. **Light themes:** activate `paper`, `ice`, or `storm`. Body text reads dark on light. Look for any black overlays you may have missed — black `rgba(0,0,0,0.4)` backdrops on stat tiles etc. read as punchcard holes on light bgs. Fix by reading `fg` at low opacity instead. (Optional — leave for a v2 polish pass if the readability is acceptable.)

---

## What's NOT in this batch

- Visitor theme override (Khalil's choice still applies to all visitors)
- Animated transitions on theme swap (instant by design — wouldn't want to conflict with the mode-flip animation)
- Football themes (single palette by intent)
- Edge Config persistence for the theme key (localStorage is fine for now — Khalil edits in his own browser)

---

## File inventory

```
NEW
───
lib/gaming-themes.ts                                      Registry + order + helpers
components/GamingThemeProvider.tsx                        Context + hook + html class sync
app/themes/page.tsx                                       Picker route
components/edit/deck/modules/ThemeModule.tsx              Control Deck panel

CHANGED
───────
app/layout.tsx                                            +GamingThemeProvider wrap; +inline class
app/globals.css                                           gaming :root + html.gaming.theme-X blocks
components/topbar/palette.ts                              PALETTE.gaming → template; +getGamingPalette / getPalette
components/topbar/TopBarMode.tsx                          uses getGamingPalette(themeKey)
components/topbar/ModeFlipOverlay.tsx                     uses getPalette(mode, themeKey)
components/arena/theme.ts                                 THEMES → getArenaTheme(mode, themeKey)
components/tunnel/theme.ts                                TUNNEL_THEMES → getTunnelTheme(mode, themeKey)
components/arena/cards/CardPortrait.tsx                   2 hardcoded purples → theme.bgA / bgB
components/arena/cards/CardEmblem.tsx                     1 hardcoded purple → theme.bgB / bgC / accent
components/arena/VideoCard.tsx                            1 hardcoded purple → theme.bgB / bgA
components/ThemeColor.tsx                                 reads active theme.bgA
components/edit/deck/ControlDeck.tsx                      adds <ThemeModule /> to LaunchTab
```

That's it — no other refactors needed. Football, mode-flip timing, content,
auth, image store, announcements, audio: all unchanged.
