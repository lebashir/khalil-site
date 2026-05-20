import type { CSSProperties, ReactNode } from 'react';
import type { ArenaTheme } from './theme';

interface Props {
  children: ReactNode;
  theme: ArenaTheme;
  style?: CSSProperties;
}

// Small uppercase mono caption used to introduce HUD sections.
export const HudLabel = ({ children, theme, style }: Props) => (
  <div
    style={{
      fontFamily: "'DM Mono', ui-monospace, monospace",
      fontSize: 10,
      fontWeight: 500,
      color: theme.accent,
      letterSpacing: 2,
      textTransform: 'uppercase',
      transition: 'color .6s ease',
      ...style
    }}
  >
    {children}
  </div>
);
