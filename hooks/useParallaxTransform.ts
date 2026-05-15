'use client';

import { useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useMouseParallax } from './useMouseParallax';

// Maps the shared parallax cursor MotionValue to a per-layer translation/rotation amount.
// Outside the parallax provider (SSR, or sections that aren't wrapped in <Stage3D>)
// it falls back to a static 0 so consumers can call it unconditionally.
export const useParallaxTransform = (
  axis: 'x' | 'y',
  amount: number
): MotionValue<number> => {
  const parallax = useMouseParallax();
  const fallback = useMotionValue(0);
  const source = parallax ? parallax[axis] : fallback;
  return useTransform(source, [-1, 1], [-amount, amount]);
};
