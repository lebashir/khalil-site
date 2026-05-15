'use client';

import { motion, useReducedMotion, type MotionStyle } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { useSectionScroll } from '@/hooks/useSectionScroll';

// Wraps a section so its scroll progress drives a soft camera-pass choreography:
// before-view it's slightly tilted back and pushed away, becomes flat and forward
// at center, then tilts forward and recedes as it scrolls out.
//
// `as` lets callers keep semantic tags (section, footer, header) without losing
// the motion behavior. `disabled` turns off the choreography for sections that
// want their own behavior (hero, scroll-pinned book).
interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div' | 'footer' | 'header' | 'article';
  disabled?: boolean;
  // depth baseline — added on top of the scroll-driven translateZ.
  baseTranslateZ?: number;
}

export const SectionStage = ({
  children,
  className,
  id,
  as = 'section',
  disabled = false,
  baseTranslateZ = 0
}: Props) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const scroll = useSectionScroll(ref);

  const MotionTag = motion[as];

  // When choreography is off we keep the section in plain flow (no transforms),
  // which preserves accessibility tools that compute reading order from layout.
  if (disabled || reduced) {
    const StaticTag = as as 'section';
    return (
      <StaticTag ref={ref as React.RefObject<HTMLElement>} id={id} className={className}>
        {children}
      </StaticTag>
    );
  }

  const style: MotionStyle = {
    transformStyle: 'preserve-3d',
    rotateX: scroll.rotateX,
    translateZ: scroll.translateZ,
    opacity: scroll.opacity,
    willChange: 'transform, opacity'
  };

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLElement & HTMLDivElement>}
      id={id}
      className={className}
      style={{ ...style, '--base-z': `${baseTranslateZ}px` } as MotionStyle}
    >
      {children}
    </MotionTag>
  );
};
