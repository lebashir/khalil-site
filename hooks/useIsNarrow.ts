'use client';

import { useEffect, useState } from 'react';

// True when the viewport is narrower than the breakpoint (default 880px).
// Used to drop the most expensive effects on phones / small tablets.
export const useIsNarrow = (breakpoint = 880): boolean => {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);
  return narrow;
};
