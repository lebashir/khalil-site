'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useInView } from './useInView';

interface Props {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
}

// Scroll-triggered entrance — pops in with the k-pop-in keyframe once the
// element crosses 15% of the viewport. Stays animated; doesn't replay.
export const Reveal = ({ children, delay = 0, style, className }: Props) => {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        animation: inView ? `k-pop-in .5s cubic-bezier(.2,1.3,.4,1) ${delay}ms both` : 'none',
        opacity: inView ? 1 : 0,
        ...style
      }}
    >
      {children}
    </div>
  );
};
