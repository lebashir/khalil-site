'use client';

import { useEffect, useState } from 'react';

// True when the primary input is a precise pointer with hover (laptop/desktop with mouse).
// Used to gate cursor-parallax / hover-tilt features that don't translate to touch.
export const useIsHoverDevice = (): boolean => {
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return hover;
};
