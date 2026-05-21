import type { CSSProperties } from 'react';
import type { Mode } from '@/lib/content';
import type { ArenaTheme } from '../theme';
import type { ArenaSize } from '../useArenaSize';
import { Polaroid } from '../Polaroid';

interface Props {
  icon: string;
  label: string;
  sub: string;
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  style?: CSSProperties;
  /** Optional real photo URL; falls back to the emoji icon when absent. */
  photoUrl?: string | null;
  /** Pass-throughs to Polaroid for stack-level interactivity (§5). */
  rotate?: number;
  bobDelay?: number;
  spreadX?: number;
  spreadY?: number;
  onTap?: () => void;
}

// Middle card — circular portrait frame holding either a real photo (when
// available) or an emoji placeholder. Caption strip + polaroid label.
export const CardPortrait = ({
  icon,
  label,
  sub,
  mode,
  theme,
  size,
  style,
  photoUrl,
  rotate,
  bobDelay,
  spreadX,
  spreadY,
  onTap
}: Props) => {
  const isDesktop = size === 'desktop';
  const iconFs = isDesktop ? 90 : size === 'tablet' ? 70 : 60;
  return (
    <Polaroid
      style={style}
      tapeColor="#ffb8b8"
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
              ? `radial-gradient(ellipse at 50% 30%, ${theme.accent}55 0%, #1a0838 70%)`
              : `radial-gradient(ellipse at 50% 30%, ${theme.accent}40 0%, #001233 70%)`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '60%',
            aspectRatio: '1',
            borderRadius: '50%',
            background:
              mode === 'gaming'
                ? 'linear-gradient(180deg, #0e0625 0%, #2a0f5a 100%)'
                : 'linear-gradient(180deg, #0a4a6a 0%, #002a55 100%)',
            border: `3px solid ${theme.accent}`,
            boxShadow: `0 0 24px ${theme.accent}, inset 0 0 16px rgba(0,0,0,0.5)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: iconFs,
            overflow: 'hidden'
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Khalil"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span aria-hidden>{icon}</span>
          )}
        </div>
        <div
          style={{
            marginTop: 12,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${theme.cardBorder}`,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: isDesktop ? 11 : 9,
            color: theme.accent,
            letterSpacing: 1.5
          }}
        >
          {sub}
        </div>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)',
            pointerEvents: 'none'
          }}
        />
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: isDesktop ? 14 : 12,
          color: '#3a2a14',
          fontWeight: 700,
          textAlign: 'center'
        }}
      >
        {label}
      </div>
    </Polaroid>
  );
};
