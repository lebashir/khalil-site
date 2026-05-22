'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SCENES } from './state';

/** Walking-between-rooms easing duration. */
const WALK_MS = 1600;
/** Default dwell time once a room is locked. */
const DWELL_MS = 3500;
/** First room dwells longer — visitor is still orienting. */
const FIRST_DWELL_MS = 4500;
/** Brief pause after mount before the camera starts moving — gives the
 *  ambient hum a beat to fade in. */
const BOOT_DELAY_MS = 600;

export type TunnelPhase = 'idle' | 'walking' | 'dwelling' | 'done';

export interface AutoWalkResult {
  /** Normalized progress [0, 1] through the SCENES array, same semantics
   *  the old scroll hook exposed — every downstream consumer (TunnelBG,
   *  TunnelWalls, Room, scene state machine) stays unchanged. */
  progress: number;
  /** Current phase of the state machine. */
  phase: TunnelPhase;
  /** Index of the scene we're walking TO (during 'walking') or DWELLING
   *  AT (during 'dwelling'). -1 before the first walk has begun. */
  sceneIndex: number;
  /** Fast-forward — collapse the current phase. During 'walking' it
   *  snaps to the target scene's lock position and enters dwell. During
   *  'dwelling' it skips the remaining dwell and starts walking to the
   *  next scene. At the last scene's dwell it transitions to 'done' (the
   *  ENTER button is the next action). */
  advance: () => void;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// Self-driving tunnel camera. Replaces useTunnelScroll for the intro
// experience: instead of binding `progress` to page scroll, this hook
// owns progress as state and animates it through the SCENES via a small
// walking ↔ dwelling state machine. Visitors can tap (or scroll, or
// swipe) to fast-forward; otherwise the camera marches itself to the
// destination on a comfortable cadence.
//
// State machine (linear, no branching):
//   idle    — initial. Mounts, waits BOOT_DELAY_MS, then arms scene 0.
//   walking — easing progress from current lock to next scene's lock
//             over WALK_MS. Calling advance() collapses to the target.
//   dwelling — holding at a scene's lockStart. Resolves after a timer
//             (DWELL_MS, or FIRST_DWELL_MS on scene 0). advance() also
//             resolves immediately.
//   done    — past the last scene's dwell. The ENTER button is the only
//             interaction left; advance() is a no-op here.
export const useTunnelAutoWalk = (): AutoWalkResult => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<TunnelPhase>('idle');
  const [sceneIndex, setSceneIndex] = useState(-1);

  // Per-walk easing refs — avoid re-creating the rAF loop when state
  // changes mid-animation.
  const walkFromRef = useRef(0);
  const walkToRef = useRef(0);
  const walkStartRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const dwellTimerRef = useRef<number | null>(null);

  const cancelWalk = (): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const cancelDwell = (): void => {
    if (dwellTimerRef.current !== null) {
      window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  };

  // Kick off a walk to `targetIndex`. Eases progress over WALK_MS, then
  // transitions to dwelling. The transition flips phase AFTER the final
  // frame so consumers that key off `phase` (like the TAP TO CONTINUE
  // pill) get a clean handoff.
  const startWalk = useCallback((targetIndex: number, fromProgress: number): void => {
    const target = SCENES[targetIndex];
    if (!target) return;

    cancelWalk();
    cancelDwell();

    walkFromRef.current = fromProgress;
    walkToRef.current = target.lockStart;
    walkStartRef.current = performance.now();
    setSceneIndex(targetIndex);
    setPhase('walking');

    const tick = (): void => {
      const elapsed = performance.now() - walkStartRef.current;
      const t = Math.min(1, elapsed / WALK_MS);
      const eased = easeOutCubic(t);
      const next = walkFromRef.current + (walkToRef.current - walkFromRef.current) * eased;
      setProgress(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setPhase('dwelling');
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Dwell timer — runs once per 'dwelling' entry. First scene gets a
  // longer dwell so the visitor can orient.
  useEffect(() => {
    if (phase !== 'dwelling') return;
    const isFirstScene = sceneIndex === 0;
    const ms = isFirstScene ? FIRST_DWELL_MS : DWELL_MS;
    dwellTimerRef.current = window.setTimeout(() => {
      dwellTimerRef.current = null;
      const next = sceneIndex + 1;
      if (next >= SCENES.length) {
        setPhase('done');
        return;
      }
      const fromScene = SCENES[sceneIndex];
      if (!fromScene) return;
      startWalk(next, fromScene.lockStart);
    }, ms);

    return () => {
      cancelDwell();
    };
  }, [phase, sceneIndex, startWalk]);

  // Boot — wait a beat, then start walking to scene 0.
  useEffect(() => {
    const t = window.setTimeout(() => {
      startWalk(0, 0);
    }, BOOT_DELAY_MS);
    return () => {
      window.clearTimeout(t);
      cancelWalk();
      cancelDwell();
    };
  }, [startWalk]);

  // Visitor-facing fast-forward.
  const advance = useCallback((): void => {
    if (phase === 'done' || phase === 'idle') return;

    if (phase === 'walking') {
      // Collapse the easing — snap progress to the destination and enter
      // dwell. The rAF callback will see phase === 'walking' is no longer
      // true on its next tick and bail; we cancel explicitly to be safe.
      cancelWalk();
      setProgress(walkToRef.current);
      setPhase('dwelling');
      return;
    }

    // phase === 'dwelling' — skip the remainder of the dwell and walk
    // to the next scene, or terminate at done if this was the last one.
    cancelDwell();
    const next = sceneIndex + 1;
    if (next >= SCENES.length) {
      setPhase('done');
      return;
    }
    const fromScene = SCENES[sceneIndex];
    if (!fromScene) return;
    startWalk(next, fromScene.lockStart);
  }, [phase, sceneIndex, startWalk]);

  return { progress, phase, sceneIndex, advance };
};
