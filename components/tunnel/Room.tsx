import type { CSSProperties, ReactNode } from 'react';
import { depthToScale, depthToBlur } from './state';

interface Props {
  depth: number;
  opacity: number;
  children: ReactNode;
  style?: CSSProperties;
}

// Wraps a scene with depth-based scale/blur/opacity so the room scales up
// + blurs as the camera passes through it. Pointer events are only
// active when the room is at or near the lock position.
export const Room = ({ depth, opacity, children, style }: Props) => {
  const scale = depthToScale(depth);
  const blur = depthToBlur(depth);
  const isInteractive = depth > 0.4 && depth < 0.6;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isInteractive ? 'auto' : 'none',
        padding: '60px 16px 80px'
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity',
          ...style
        }}
      >
        {children}
      </div>
    </div>
  );
};
