'use client';

import { useEffect, useState } from 'react';

// Three tiers of fanciness for the toggle transition, picked based on the device:
//   full — pointer:fine and viewport >880px — laptop/desktop with a mouse, full FX
//   lite — touch screens or narrow viewports — keep the wow but drop the most expensive
//          effects (RGB-split, scanlines) and cut particle counts
//   none — prefers-reduced-motion: reduce — just a quick cross-fade
export type ToggleQuality = 'full' | 'lite' | 'none';

const MATCH_FULL  = '(hover: hover) and (pointer: fine) and (min-width: 881px)';
const MATCH_REDUCE = '(prefers-reduced-motion: reduce)';

export const useToggleQuality = (): ToggleQuality => {
  const [quality, setQuality] = useState<ToggleQuality>('full');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mqFull   = window.matchMedia(MATCH_FULL);
    const mqReduce = window.matchMedia(MATCH_REDUCE);
    const update = () => {
      if (mqReduce.matches) setQuality('none');
      else if (mqFull.matches) setQuality('full');
      else setQuality('lite');
    };
    update();
    mqFull.addEventListener('change', update);
    mqReduce.addEventListener('change', update);
    return () => {
      mqFull.removeEventListener('change', update);
      mqReduce.removeEventListener('change', update);
    };
  }, []);

  return quality;
};
