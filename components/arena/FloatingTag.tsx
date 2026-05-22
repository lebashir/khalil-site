import type { CSSProperties } from 'react';
import type { ArenaTheme } from './theme';
import { themedBackdrop } from '@/lib/gaming-themes';

interface Props {
  label: string;
  value: string | number;
  theme: ArenaTheme;
  position: CSSProperties;
  delay?: string;
}

// Lanyard / ID-card style chip with a small clip-hole on the left.
// Floats with the k-bob-s keyframe; used on the hero stack as floating
// stat tags (SUBS, RANK).
export const FloatingTag = ({ label, value, theme, position, delay = '0s' }: Props) => (
  <div
    style={{
      position: 'absolute',
      ...position,
      background: themedBackdrop(theme.fg, 0.7),
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: 4,
      padding: '6px 10px 6px 26px',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      animation: `k-bob-s 4s ease-in-out ${delay} infinite`,
      transition: 'border-color .6s ease',
      zIndex: 10
    }}
  >
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 8,
        height: 8,
        borderRadius: '50%',
        border: `1.5px solid ${theme.accent}`,
        background: themedBackdrop(theme.fg, 0.7),
        boxShadow: `0 0 6px ${theme.accent}`,
        transition: 'border-color .6s ease, box-shadow .6s ease'
      }}
    />
    <div
      style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 9,
        color: theme.accent,
        letterSpacing: 1.5,
        transition: 'color .6s ease'
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: "'Anton', sans-serif",
        fontSize: 22,
        color: theme.fg,
        lineHeight: 1
      }}
    >
      {value}
    </div>
  </div>
);
