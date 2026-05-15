'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useMode } from '@/components/ModeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsNarrow } from '@/hooks/useIsNarrow';
import { GamingToFootballTakeover } from './GamingToFootballTakeover';
import { FootballToGamingTakeover } from './FootballToGamingTakeover';

const FULL_DURATION_MS = 1800;
const NARROW_DURATION_MS = 1200;

type Direction = 'g2f' | 'f2g';

interface ActiveOverlay {
  dir: Direction;
  key: number;
  durationMs: number;
}

// Watches for mode changes and mounts the full-screen cinematic takeover for the
// transition. The v1 banner animation continues to run in parallel — they're
// designed to feel like one moment.
export const ToggleTakeover = () => {
  const { mode } = useMode();
  const reduced = useReducedMotion();
  const narrow = useIsNarrow();
  const prevRef = useRef(mode);
  const [overlay, setOverlay] = useState<ActiveOverlay | null>(null);

  useEffect(() => {
    if (prevRef.current === mode) return;
    const prev = prevRef.current;
    prevRef.current = mode;
    if (reduced) return; // reduced-motion users get just the banner cross-fade
    const dir: Direction = prev === 'gaming' && mode === 'football' ? 'g2f' : 'f2g';
    setOverlay({
      dir,
      key: performance.now(),
      durationMs: narrow ? NARROW_DURATION_MS : FULL_DURATION_MS
    });
  }, [mode, reduced, narrow]);

  const clear = () => setOverlay(null);

  return (
    <AnimatePresence>
      {overlay && overlay.dir === 'g2f' && (
        <GamingToFootballTakeover
          key={overlay.key}
          durationMs={overlay.durationMs}
          narrow={narrow}
          onDone={clear}
        />
      )}
      {overlay && overlay.dir === 'f2g' && (
        <FootballToGamingTakeover
          key={overlay.key}
          durationMs={overlay.durationMs}
          narrow={narrow}
          onDone={clear}
        />
      )}
    </AnimatePresence>
  );
};
