'use client';

import { useEffect, useState } from 'react';

// 1-Hz wall-clock for the TopBar UTC pill. Starts from null on the
// server to avoid hydration mismatches; populates after mount.
export const useNow = (): Date | null => {
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    setT(new Date());
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return t;
};

export const pad2 = (n: number): string => String(n).padStart(2, '0');
