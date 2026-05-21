import type { CSSProperties } from 'react';
import type { Mode } from '@/lib/content';
import type { ArenaTheme } from '../theme';
import type { ArenaSize } from '../useArenaSize';
import { Polaroid } from '../Polaroid';

interface Props {
  label: string;
  sub: string;
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  style?: CSSProperties;
  /** Pass-throughs to Polaroid for stack-level interactivity (§5). */
  rotate?: number;
  bobDelay?: number;
  spreadX?: number;
  spreadY?: number;
  onTap?: () => void;
}

// Back card in the polaroid stack. Big "7" numeral on a mode-tinted
// gradient, halftone dots, corner brackets. Caption strip below.
export const CardEmblem = ({
  label,
  sub,
  mode,
  theme,
  size,
  style,
  rotate,
  bobDelay,
  spreadX,
  spreadY,
  onTap
}: Props) => {
  const isDesktop = size === 'desktop';
  const numberFs = isDesktop ? 240 : size === 'tablet' ? 180 : 140;
  return (
    <Polaroid
      style={style}
      tapeColor="#a9d4ff"
      rotate={rotate}
      bobDelay={bobDelay}
      spreadX={spreadX}
      spreadY={spreadY}
      onTap={onTap}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background:
            mode === 'gaming'
              ? 'linear-gradient(135deg, #1a0838 0%, #3a0a5a 50%, #ff2bd6 130%)'
              : 'linear-gradient(135deg, #001233 0%, #003366 60%, #ffd700 140%)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 25% 20%, ${theme.accent}55 0%, transparent 60%)`
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${theme.accent}33 1.2px, transparent 1.5px)`,
            backgroundSize: '8px 8px',
            opacity: 0.5,
            mixBlendMode: 'screen'
          }}
        />
        <div
          style={{
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: numberFs,
            color: '#fff',
            lineHeight: 0.85,
            textShadow: `0 0 30px ${theme.accent}, 0 6px 0 rgba(0,0,0,0.5), 0 10px 24px rgba(0,0,0,0.6)`,
            letterSpacing: -8
          }}
        >
          7
        </div>
        {/* Corner brackets */}
        {(
          [
            { c: 'tl', top: 6, left: 6 },
            { c: 'tr', top: 6, right: 6 },
            { c: 'bl', bottom: 6, left: 6 },
            { c: 'br', bottom: 6, right: 6 }
          ] as const
        ).map((c) => (
          <span
            key={c.c}
            aria-hidden
            style={{
              position: 'absolute',
              top: 'top' in c ? c.top : undefined,
              bottom: 'bottom' in c ? c.bottom : undefined,
              left: 'left' in c ? c.left : undefined,
              right: 'right' in c ? c.right : undefined,
              width: 14,
              height: 14,
              borderTop: 'top' in c ? `2px solid ${theme.accent}` : 'none',
              borderBottom: 'bottom' in c ? `2px solid ${theme.accent}` : 'none',
              borderLeft: 'left' in c ? `2px solid ${theme.accent}` : 'none',
              borderRight: 'right' in c ? `2px solid ${theme.accent}` : 'none'
            }}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 9,
          color: '#3a2a14',
          letterSpacing: 1.5
        }}
      >
        <span>{label}</span>
        <span>{sub}</span>
      </div>
    </Polaroid>
  );
};
