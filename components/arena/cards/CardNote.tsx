import type { CSSProperties } from 'react';
import type { ArenaTheme } from '../theme';
import type { ArenaSize } from '../useArenaSize';
import { Polaroid } from '../Polaroid';

interface Props {
  text: string;
  theme: ArenaTheme;
  size: ArenaSize;
  style?: CSSProperties;
}

// Front card — handwritten note on lined paper with red margin, Caveat
// font, and a signature swoosh in the bottom right.
export const CardNote = ({ text, theme, size, style }: Props) => {
  const isDesktop = size === 'desktop';
  const textFs = isDesktop ? 26 : size === 'tablet' ? 22 : 18;
  return (
    <Polaroid style={{ ...style, padding: 14, background: '#fef9e6' }} tapeColor="#7ec6c2">
      {/* Lined paper */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 14,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0 18px, rgba(120,90,40,0.18) 18px 19px)',
          pointerEvents: 'none'
        }}
      />
      {/* Red margin line */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 14,
          bottom: 14,
          left: 32,
          width: 1,
          background: '#d44545',
          opacity: 0.5
        }}
      />
      <div
        style={{
          position: 'relative',
          padding: '4px 4px 4px 28px',
          fontFamily: "'Caveat', 'Bradley Hand', cursive",
          fontSize: textFs,
          lineHeight: 1.15,
          color: '#1a1310',
          fontWeight: 700,
          whiteSpace: 'pre-line',
          transform: 'rotate(-1deg)'
        }}
      >
        {text}
      </div>
      <svg
        viewBox="0 0 80 30"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: 70,
          height: 26,
          transform: 'rotate(4deg)'
        }}
        aria-hidden
      >
        <path
          d="M2 18 Q 12 4, 24 16 T 50 14 Q 60 8, 76 22"
          fill="none"
          stroke={theme.accent}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </Polaroid>
  );
};
