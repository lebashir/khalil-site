'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { ArenaTheme } from '@/components/arena/theme';
import type { ArenaSize } from '@/components/arena/useArenaSize';

// Shared atoms used across the /manual page. Mode-reactive — each
// primitive takes the active ArenaTheme so the whole manual repaints
// when the user flips modes via TopBarMode.

const FONT_DISPLAY = "'Anton', sans-serif";
const FONT_MONO = "'DM Mono', ui-monospace, monospace";
const FONT_HANDWRITING = "'Caveat', 'Bradley Hand', cursive";

// ── PartMarker ────────────────────────────────────────────────────────
// The "01 ◇ PART ONE ───────────" header that opens each section.

interface PartMarkerProps {
  num: number;
  tag: string;
  theme: ArenaTheme;
  size: ArenaSize;
}

export const PartMarker = ({ num, tag, theme, size }: PartMarkerProps) => {
  const isPhone = size === 'phone';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 12
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: isPhone ? 44 : 64,
          lineHeight: 1,
          color: theme.accent,
          textShadow: `0 0 24px ${theme.accent}`,
          minWidth: isPhone ? 60 : 80
        }}
      >
        {String(num).padStart(2, '0')}
      </div>
      <div
        style={{
          flex: 1,
          height: 2,
          background: `linear-gradient(90deg, ${theme.accent} 0%, transparent 100%)`
        }}
      />
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: 2,
          color: theme.accent,
          textTransform: 'uppercase'
        }}
      >
        {tag}
      </div>
    </div>
  );
};

// ── PartTitle ─────────────────────────────────────────────────────────

interface PartTitleProps {
  children: ReactNode;
  theme: ArenaTheme;
  size: ArenaSize;
}

export const PartTitle = ({ children, theme, size }: PartTitleProps) => (
  <h2
    style={{
      fontFamily: FONT_DISPLAY,
      fontSize: size === 'phone' ? 38 : 56,
      lineHeight: 0.95,
      letterSpacing: -1,
      marginBottom: 24,
      color: theme.fg,
      textShadow: `0 0 18px ${theme.accent}`
    }}
  >
    {children}
  </h2>
);

// ── Tldr ──────────────────────────────────────────────────────────────
// Handwritten "tl;dr" sticky note that closes each section. Yellow
// lined paper with a red "TL;DR" stamp and a translucent tape strip in
// the top-right.

interface TldrProps {
  children: ReactNode;
}

export const Tldr = ({ children }: TldrProps) => (
  <div
    style={{
      position: 'relative',
      marginTop: 24,
      background:
        'repeating-linear-gradient(0deg, #fef9e6 0 22px, #f5edd0 22px 23px)',
      color: '#3a2a14',
      padding: '24px 22px 22px 64px',
      transform: 'rotate(-1deg)',
      boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
      borderLeft: '3px solid #c54',
      fontFamily: FONT_HANDWRITING,
      fontWeight: 700,
      fontSize: 22,
      lineHeight: 1.25,
      maxWidth: 760
    }}
  >
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: -14,
        left: 22,
        background: '#ff3a3a',
        color: '#fff',
        fontFamily: FONT_DISPLAY,
        fontSize: 14,
        letterSpacing: 2,
        padding: '4px 10px',
        textTransform: 'uppercase',
        boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
      }}
    >
      tl;dr
    </div>
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: -14,
        right: 30,
        width: 70,
        height: 24,
        background: 'rgba(255,255,255,0.5)',
        border: '1px dashed rgba(0,0,0,0.18)',
        transform: 'rotate(6deg)'
      }}
    />
    {children}
  </div>
);

// ── Panel ─────────────────────────────────────────────────────────────
// HUD card with an accent-colored top label.

interface PanelProps {
  label?: string;
  theme: ArenaTheme;
  children: ReactNode;
  style?: CSSProperties;
}

export const Panel = ({ label, theme, children, style }: PanelProps) => (
  <div
    style={{
      background: 'rgba(0,0,0,0.45)',
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: 6,
      padding: 22,
      margin: '18px 0',
      boxShadow: `0 0 24px rgba(0,0,0,0.4), inset 0 0 24px ${theme.accent}10`,
      ...style
    }}
  >
    {label && (
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: 2,
          color: theme.accent,
          textTransform: 'uppercase',
          marginBottom: 14
        }}
      >
        {label}
      </div>
    )}
    {children}
  </div>
);

// ── Terminal ──────────────────────────────────────────────────────────
// Dark monospace block with subtle border. Children render as lines.

interface TerminalProps {
  children: ReactNode;
  style?: CSSProperties;
}

export const Terminal = ({ children, style }: TerminalProps) => (
  <div
    style={{
      background: '#0a0d0f',
      border: '1px solid #2a333d',
      borderRadius: 6,
      padding: '18px 22px',
      fontFamily: FONT_MONO,
      fontSize: 13,
      lineHeight: 1.7,
      color: '#92a4ae',
      overflowX: 'auto',
      ...style
    }}
  >
    {children}
  </div>
);

// ── TermLine ──────────────────────────────────────────────────────────
// One line inside a Terminal block — colored "prompt" prefix + ink text.

interface TermLineProps {
  prompt: string;
  promptColor: string;
  children: ReactNode;
  inkColor?: string;
}

export const TermLine = ({ prompt, promptColor, children, inkColor = '#92a4ae' }: TermLineProps) => (
  <div>
    <span style={{ color: promptColor }}>{prompt}</span>
    {'  '}
    <span style={{ color: inkColor }}>{children}</span>
  </div>
);

// ── Prose ─────────────────────────────────────────────────────────────
// Paragraph-style copy with consistent measure + line-height.

interface ProseProps {
  children: ReactNode;
  style?: CSSProperties;
}

export const Prose = ({ children, style }: ProseProps) => (
  <div
    style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 17,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.78)',
      maxWidth: 760,
      ...style
    }}
  >
    {children}
  </div>
);

// ── KsRows ────────────────────────────────────────────────────────────
// Two-column key/spec rows. Used for tables of attributes — the HUD
// equivalent of a <dl>.

interface KsRowsProps {
  rows: ReadonlyArray<readonly [string, ReactNode]>;
  theme: ArenaTheme;
}

export const KsRows = ({ rows, theme }: KsRowsProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '10px 18px',
      alignItems: 'baseline'
    }}
  >
    {rows.map(([k, v], i) => (
      <div key={`${k}-${i}`} style={{ display: 'contents' }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: 1.5,
            color: theme.accent,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          {k}
        </div>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.85)'
          }}
        >
          {v}
        </div>
      </div>
    ))}
  </div>
);

// ── Notebook ──────────────────────────────────────────────────────────
// Inline aside on lined-paper. Lower-key than Tldr — used for callouts
// inside a part rather than the closing summary.

interface NotebookProps {
  children: ReactNode;
}

export const Notebook = ({ children }: NotebookProps) => (
  <div
    style={{
      background:
        'repeating-linear-gradient(0deg, #fef9e6 0 22px, #f5edd0 22px 23px)',
      color: '#2a1f08',
      padding: '18px 20px 18px 50px',
      margin: '18px 0',
      borderLeft: '3px solid #c54',
      boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
      fontFamily: FONT_HANDWRITING,
      fontWeight: 700,
      fontSize: 19,
      lineHeight: 1.3,
      maxWidth: 760,
      position: 'relative'
    }}
  >
    {children}
  </div>
);
