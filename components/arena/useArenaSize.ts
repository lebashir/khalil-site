'use client';

import { useEffect, useState } from 'react';

export type ArenaSize = 'desktop' | 'tablet' | 'phone';

// Matches the breakpoints used by the design canvas. Desktop ≥ 900px.
export const useArenaSize = (): ArenaSize => {
  const [size, setSize] = useState<ArenaSize>('desktop');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = (): ArenaSize => {
      const w = window.innerWidth;
      if (w >= 900) return 'desktop';
      if (w >= 560) return 'tablet';
      return 'phone';
    };
    const update = () => setSize(compute());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
};
