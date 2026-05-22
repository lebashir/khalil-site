import type { Metadata, Viewport } from 'next';
import { ModeProvider } from '@/components/ModeProvider';
import { ThemeColor } from '@/components/ThemeColor';
import { ModeFlipProvider } from '@/components/topbar';
import { GamingThemeProvider } from '@/components/GamingThemeProvider';
import { MuteToggle } from '@/components/audio/MuteToggle';
import { getContent } from '@/lib/content';
import {
  GAMING_THEMES,
  DEFAULT_GAMING_THEME,
  isGamingThemeKey,
  type GamingThemeKey
} from '@/lib/gaming-themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'Khalil the Goat',
  description: 'Streamer · Gamer · Author · Madridista. 10 years old, big dreams, wildest reactions on YouTube.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  appleWebApp: {
    capable: true,
    title: 'Khalil',
    statusBarStyle: 'black-translucent'
  },
  openGraph: {
    title: 'Khalil the Goat',
    description: 'Streamer · Gamer · Author · Madridista.',
    type: 'website'
  }
};

// Static viewport-level meta. The <ThemeColor /> client component overrides
// the non-media-queried theme-color on mode change so iOS Safari's status bar tints live.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0e0030' },
    { media: '(prefers-color-scheme: dark)',  color: '#0e0030' },
    // The bare entry below is the one ThemeColor mutates per mode.
    { color: '#0e0030' }
  ],
  width: 'device-width',
  initialScale: 1,
  // Allow user zoom but keep the layout at the device width so iOS doesn't shrink-to-fit.
  maximumScale: 5,
  viewportFit: 'cover'
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const content = getContent();
  const defaultMode = content.defaultMode;

  // Published gaming-theme settings (read from content.json). Falls back
  // to DEFAULT_GAMING_THEME if content.json doesn't carry the field
  // (older deploys before the schema migration).
  const themeSettings = content.theme?.gaming ?? null;
  const rawFixedKey = themeSettings?.fixedKey;
  const publishedThemeKey: GamingThemeKey =
    rawFixedKey && isGamingThemeKey(rawFixedKey) ? rawFixedKey : DEFAULT_GAMING_THEME;
  const themeMode: 'fixed' | 'random' = themeSettings?.mode ?? 'fixed';
  // Filter the pool to known-valid keys so the inline script never picks
  // a stale key (e.g. content.json was set when a theme existed that's
  // since been removed from the registry).
  const themePool = (themeSettings?.pool ?? []).filter(isGamingThemeKey);
  const validThemes = Object.keys(GAMING_THEMES);

  // Inline pre-hydration script avoids first-paint flash. Sets BOTH the
  // mode class AND the theme class on <html> before any paint, so
  // CSS-var-driven elements (every consumer of --bg-1, --accent, …)
  // resolve to the right values on first frame.
  //
  // Theme resolution priority (descending):
  //   1. localStorage[khalil-gaming-theme] if valid AND still in pool
  //      (random mode) — sticky for returning visitors / Khalil's preview
  //   2. If random mode + pool non-empty — pick one + persist
  //   3. publishedThemeKey (the fixed setting from content.json)
  //   4. DEFAULT_GAMING_THEME
  const inlineModeScript = `
    (function() {
      try {
        var s = localStorage.getItem('khalil-mode');
        var m = (s === 'gaming' || s === 'football') ? s : '${defaultMode}';
        document.documentElement.classList.add(m);

        var validThemes = ${JSON.stringify(validThemes)};
        var pool = ${JSON.stringify(themePool)};
        var themeMode = '${themeMode}';
        var published = '${publishedThemeKey}';

        var saved = localStorage.getItem('khalil-gaming-theme');
        var theme;

        var savedValid = saved && validThemes.indexOf(saved) !== -1;
        var savedInPool = savedValid && pool.indexOf(saved) !== -1;

        if (savedValid && (themeMode === 'fixed' || pool.length === 0 || savedInPool)) {
          // Khalil's preview OR a sticky random pick that's still in the pool
          theme = saved;
        } else if (themeMode === 'random' && pool.length > 0) {
          theme = pool[Math.floor(Math.random() * pool.length)];
          try { localStorage.setItem('khalil-gaming-theme', theme); } catch (e) {}
        } else {
          theme = published;
        }

        if (validThemes.indexOf(theme) === -1) theme = '${DEFAULT_GAMING_THEME}';
        document.documentElement.classList.add('theme-' + theme);
      } catch (e) {
        document.documentElement.classList.add('${defaultMode}');
        document.documentElement.classList.add('theme-${DEFAULT_GAMING_THEME}');
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bungee&family=Russo+One&family=Caveat:wght@500;600;700&family=Inter:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: inlineModeScript }} />
      </head>
      <body>
        <ModeProvider initialMode={defaultMode}>
          <GamingThemeProvider initialKey={publishedThemeKey}>
            <ThemeColor />
            <ModeFlipProvider>{children}</ModeFlipProvider>
            <MuteToggle />
          </GamingThemeProvider>
        </ModeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
