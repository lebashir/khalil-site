'use client';

import {
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react';

interface JiggleableProps {
  children: ReactNode;
  /** Style passes through to the wrapper div. */
  style?: CSSProperties;
  className?: string;
  /** Optional tap callback fired alongside the jiggle. */
  onTap?: () => void;
}

const JIGGLE_ANIMATION = 'k-jiggle .42s cubic-bezier(.2,1.4,.4,1) both';

// Wrap children in a div that rotates ±deg on tap, settling back via
// the k-jiggle keyframe. Uses the animation-restart trick (clear ->
// force reflow -> reapply) so children are NOT remounted on each tap —
// any child-level mount-time animations (k-pop-in, etc.) keep their
// run-once behavior.
//
// Stat tiles use this for personality on tap.
export const Jiggleable = ({ children, style, className, onTap }: JiggleableProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPointerDown = (_: ReactPointerEvent) => {
    const el = ref.current;
    if (el) {
      // CSS animation restart: blank it, force reflow, reapply. Without
      // the reflow read, the browser coalesces the writes and the
      // animation never restarts.
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = JIGGLE_ANIMATION;
    }
    if (onTap) onTap();
  };

  return (
    <div ref={ref} onPointerDown={onPointerDown} className={className} style={style}>
      {children}
    </div>
  );
};
