'use client';

import { useScroll, useTransform, type MotionValue } from 'framer-motion';
import type { RefObject } from 'react';

// Scroll progress for a section element.
//   0   = section's leading edge is at the bottom of the viewport (just appearing)
//   0.5 = section is centered
//   1   = section's trailing edge is at the top of the viewport (just leaving)
//
// Returns the raw 0..1 progress plus three derived motion values that match
// the default scroll choreography described in the v2 brief:
//   - rotateX:   -15deg → 0 → +10deg
//   - translateZ: -200 → 0 → -100
//   - opacity:   0.4 → 1 → 0.5
//
// Sections that want different choreography can ignore the derived values and
// build their own with useTransform on `progress`.
export interface SectionScroll {
  progress: MotionValue<number>;
  rotateX: MotionValue<number>;
  translateZ: MotionValue<number>;
  opacity: MotionValue<number>;
}

export const useSectionScroll = (ref: RefObject<HTMLElement | null>): SectionScroll => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 0, 10]);
  const translateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-200, 0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.5, 0.9, 1], [0.4, 1, 1, 1, 0.5]);

  return { progress: scrollYProgress, rotateX, translateZ, opacity };
};
