'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMode } from '@/components/ModeProvider';
import type { Mode } from '@/lib/content';
import { FLIP_EVENT, FLIP_TIMING } from './palette';

export interface ModeFlipTransition {
  from: Mode;
  to: Mode;
  nonce: number;
}

export interface UseModeFlipResult {
  mode: Mode;
  transition: ModeFlipTransition | null;
  flip: () => void;
  isTransitioning: boolean;
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// useModeFlip — coordinates the cinematic mode-toggle transition.
//
// Returns the current mode + a `flip` function. When flip() runs:
//   t=0       overlay mounts in the target mode's color
//   t=400ms   ModeProvider.setMode(target) — page swaps behind the slab
//   t=900ms   overlay clears, ready for another flip
//
// A busy ref swallows re-entrant calls during the 900ms window. The hook
// also listens for a global `khalil:flip` window event so any nested
// component (Control Deck, edit instruments) can trigger a flip without
// prop drilling.
//
// Reduced-motion users skip the overlay entirely — setMode is called
// synchronously so they see no animation, just the swap.
export const useModeFlip = (): UseModeFlipResult => {
  const { mode, setMode } = useMode();
  const [transition, setTransition] = useState<ModeFlipTransition | null>(null);
  const busy = useRef(false);
  const timeouts = useRef<number[]>([]);

  const flip = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    const target: Mode = mode === 'gaming' ? 'football' : 'gaming';

    if (prefersReducedMotion()) {
      setMode(target);
      busy.current = false;
      return;
    }

    setTransition({ from: mode, to: target, nonce: Date.now() });
    timeouts.current.push(
      window.setTimeout(() => setMode(target), FLIP_TIMING.swapAtMs),
      window.setTimeout(() => {
        setTransition(null);
        busy.current = false;
      }, FLIP_TIMING.totalMs)
    );
  }, [mode, setMode]);

  useEffect(() => {
    const handler = () => flip();
    window.addEventListener(FLIP_EVENT, handler);
    return () => window.removeEventListener(FLIP_EVENT, handler);
  }, [flip]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((id) => window.clearTimeout(id));
      timeouts.current = [];
    };
  }, []);

  return { mode, transition, flip, isTransitioning: transition !== null };
};
