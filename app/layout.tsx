import type { Metadata, Viewport } from 'next';
import { ModeProvider } from '@/components/ModeProvider';
import { ThemeColor } from '@/components/ThemeColor';
import { getContent } from '@/lib/content';
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
    { media: '(prefers-color-scheme: light)', color: '#1a0a3a' },
    { media: '(prefers-color-scheme: dark)',  color: '#1a0a3a' },
    // The bare entry below is the one ThemeColor mutates per mode.
    { color: '#1a0a3a' }
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

  // Inline pre-hydration script avoids the first-paint flash when the user's
  // saved preference differs from the server-rendered default.
  const inlineModeScript = `
    (function() {
      try {
        var s = localStorage.getItem('khalil-mode');
        var m = (s === 'gaming' || s === 'football') ? s : '${defaultMode}';
        document.documentElement.classList.add(m);
      } catch (e) {
        document.documentElement.classList.add('${defaultMode}');
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Russo+One&family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: inlineModeScript }} />
      </head>
      <body>
        <ModeProvider initialMode={defaultMode}>
          <ThemeColor />
          {children}
        </ModeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
