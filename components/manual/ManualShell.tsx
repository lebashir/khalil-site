'use client';

import type { ReactNode } from 'react';
import type { SiteContent } from '@/lib/content';
import { useModeFlipContext } from '@/components/topbar';
import { TopBarMode } from '@/components/topbar';
import { useGamingTheme } from '@/components/GamingThemeProvider';
import { getArenaTheme, type ArenaTheme } from '@/components/arena/theme';
import { useArenaSize } from '@/components/arena/useArenaSize';
import { themedBackdrop, themedFg } from '@/lib/gaming-themes';
import { ManualCover } from './ManualCover';
import { ManualBody } from './ManualBody';
import { Panel } from './primitives';

interface Props {
  content: SiteContent;
}

// Top-level client wrapper for /manual. Subscribes to mode via the
// shared ModeFlipProvider mounted in app/layout.tsx, so the toggle at
// the top of this page coordinates with the same global flip used by
// the arena. THEMES drives every per-mode color on the page — flipping
// modes repaints the whole manual including the polaroid cover.
export const ManualShell = ({ content }: Props) => {
  const { mode } = useModeFlipContext();
  const { themeKey } = useGamingTheme();
  const size = useArenaSize();
  const theme = getArenaTheme(mode, themeKey);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: `radial-gradient(ellipse at top, ${theme.sceneBgC} 0%, ${theme.sceneBgB} 38%, ${theme.sceneBgA} 100%)`,
        backgroundAttachment: 'fixed',
        color: theme.fg,
        transition: 'background .8s ease'
      }}
    >
      {/* Faint mode-tinted grid overlay — matches the arena vibe. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `linear-gradient(${theme.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.line} 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
          opacity: 0.5,
          zIndex: 0
        }}
      />
      {/* Gentle scanlines for the CRT feel. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)',
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
          zIndex: 1
        }}
      />

      {/* Sticky mode toggle — same component as the arena. Hovering the
          idle half broadcasts a peek event, which we ignore here (no
          mode-peek overlay on /manual) but the cinematic flip overlay
          itself is mounted globally and works automatically. */}
      <div style={{ position: 'sticky', top: 0, zIndex: 80 }}>
        <TopBarMode />
      </div>

      <main
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1080,
          margin: '0 auto',
          padding: size === 'phone' ? '0 16px 80px' : '0 20px 120px'
        }}
      >
        <ManualCover mode={mode} theme={theme} size={size} content={content} />

        <Toc theme={theme} />

        <ManualBody mode={mode} theme={theme} size={size} content={content} />

        <EndCard theme={theme}>
          welcome to your own arena. hit the goal.
        </EndCard>
      </main>
    </div>
  );
};

// ── Table of contents ─────────────────────────────────────────────

const TOC_ROWS: ReadonlyArray<readonly [string, string]> = [
  ['PART 1', 'the site · what visitors see'],
  ['PART 2', 'the two modes · gaming vs football'],
  ['PART 3', 'the tunnel · the walk-in intro'],
  ['PART 4', 'the arena · your homepage layout'],
  ['PART 5', 'secret door (/edit) · where you change stuff'],
  ['PART 6', 'mission control · LAUNCH tab · fire messages'],
  ['PART 7', 'control deck · INLINE tab · edit fields'],
  ['PART 8', 'image uploads · drop your own photos'],
  ['PART 9', 'save & fire · how stuff goes live'],
  ['PART 10', 'troubleshooting · when something looks wrong']
];

const Toc = ({ theme }: { theme: ArenaTheme }) => (
  <Panel label="◇ MISSION BRIEF · 10 PARTS" theme={theme}>
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 18px' }}>
      {TOC_ROWS.map(([h, c], i) => (
        <div key={`toc-${i}`} style={{ display: 'contents' }}>
          <a
            href={`#part-${i + 1}`}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: 1.5,
              color: theme.accent,
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {h}
          </a>
          <a
            href={`#part-${i + 1}`}
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              color: themedFg(theme.fg, 0.78),
              textDecoration: 'none'
            }}
          >
            {c}
          </a>
        </div>
      ))}
    </div>
  </Panel>
);

// ── End card ──────────────────────────────────────────────────────

interface EndCardProps {
  theme: ArenaTheme;
  children: ReactNode;
}

const EndCard = ({ theme, children }: EndCardProps) => (
  <div
    style={{
      marginTop: 80,
      padding: '60px 32px',
      textAlign: 'center',
      border: `2px solid ${theme.accent}`,
      borderRadius: 8,
      background: themedBackdrop(theme.fg, 0.45),
      boxShadow: `0 0 40px ${theme.accent}40`,
      animation: 'k-stamp-in .6s cubic-bezier(.2,1.2,.4,1) both'
    }}
  >
    <h2
      style={{
        fontFamily: "'Anton', sans-serif",
        fontSize: 48,
        margin: '0 0 14px',
        color: theme.fg,
        textShadow: `0 0 24px ${theme.accent}`
      }}
    >
      WELCOME TO YOUR OWN ARENA
    </h2>
    <p
      style={{
        margin: '0 0 24px',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 16,
        color: themedFg(theme.fg, 0.75)
      }}
    >
      {children}
    </p>
    <a
      href="/"
      style={{
        display: 'inline-block',
        padding: '16px 36px',
        fontFamily: "'Anton', sans-serif",
        fontSize: 24,
        letterSpacing: 2,
        color: theme.ctaText,
        background: `linear-gradient(180deg, ${theme.ctaA} 0%, ${theme.ctaB} 100%)`,
        textDecoration: 'none',
        clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
        boxShadow: `0 0 24px ${theme.ctaA}80`
      }}
    >
      ▶ ENTER
    </a>
    <div
      style={{
        marginTop: 32,
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: 2,
        color: theme.accent,
        opacity: 0.7
      }}
    >
      END OF MANUAL · KHALIL.OPS v1.0
    </div>
  </div>
);
