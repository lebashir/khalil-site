import type { CSSProperties, ReactNode } from 'react';
import type { ArenaTheme } from './theme';

interface Props {
  children: ReactNode;
  theme: ArenaTheme;
  style?: CSSProperties;
  className?: string;
}

// Bordered HUD card with four corner brackets in the active mode's accent.
// Subtle inner glow + drop shadow. Backdrop blur keeps it readable over the
// scene background.
export const HudCard = ({ children, theme, style, className }: Props) => (
  <div
    className={className}
    style={{
      position: 'relative',
      background: theme.card,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: 12,
      padding: 16,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 28px rgba(0,0,0,0.5)',
      transition: 'background .6s ease, border-color .6s ease',
      ...style
    }}
  >
    {/* Four corner brackets */}
    {[0, 1, 2, 3].map((c) => {
      const pos =
        c === 0
          ? { top: -1, left: -1 }
          : c === 1
            ? { top: -1, right: -1 }
            : c === 2
              ? { bottom: -1, left: -1 }
              : { bottom: -1, right: -1 };
      return (
        <span
          key={c}
          aria-hidden
          style={{
            position: 'absolute',
            ...pos,
            width: 10,
            height: 10,
            borderTop: c < 2 ? `2px solid ${theme.accent}` : 'none',
            borderBottom: c >= 2 ? `2px solid ${theme.accent}` : 'none',
            borderLeft: c % 2 === 0 ? `2px solid ${theme.accent}` : 'none',
            borderRight: c % 2 === 1 ? `2px solid ${theme.accent}` : 'none',
            transition: 'border-color .6s ease'
          }}
        />
      );
    })}
    {children}
  </div>
);
