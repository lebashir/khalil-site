import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  tapeColor?: string;
  shadow?: boolean;
}

// Common cream-paper frame with two tape strips on the top corners.
// Floats with the k-bob keyframe.
export const Polaroid = ({ children, style, tapeColor = '#ffe48f', shadow = true }: Props) => (
  <div
    style={{
      position: 'absolute',
      background: '#f3ede0',
      padding: 10,
      boxShadow: shadow ? '0 18px 38px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.3)' : 'none',
      transformOrigin: '50% 50%',
      transition: 'transform .6s cubic-bezier(.4,1.2,.4,1)',
      animation: 'k-bob 5s ease-in-out infinite',
      ...style
    }}
  >
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top: -8,
        left: '12%',
        width: 44,
        height: 16,
        background: tapeColor,
        opacity: 0.85,
        transform: 'rotate(-6deg)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    />
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top: -8,
        right: '12%',
        width: 44,
        height: 16,
        background: tapeColor,
        opacity: 0.85,
        transform: 'rotate(7deg)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    />
    {children}
  </div>
);
