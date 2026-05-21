'use client';

import { useEffect, useRef } from 'react';

interface UseHoverTiltOptions {
  /** Max tilt on either axis, in degrees. Default 8. */
  max?: number;
  /** Scale applied during hover. Default 1.0 (no scale). */
  scale?: number;
  /** Perspective distance for the 3D effect. Default 900. */
  perspective?: number;
}

// Attaches a pointermove listener to apply a 3D tilt to the element.
// The transform is throttled with requestAnimationFrame and uses GPU
// composites only. Disabled on `@media (hover: none)` (touch devices)
// and `prefers-reduced-motion: reduce`. The returned ref must be
// attached to the element you want to tilt.
export const useHoverTilt = <T extends HTMLElement = HTMLDivElement>(
  options: UseHoverTiltOptions = {}
) => {
  const ref = useRef<T | null>(null);
  const max = options.max ?? 8;
  const scale = options.scale ?? 1.0;
  const perspective = options.perspective ?? 900;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    // Skip on touch-primary devices (no real hover) and reduced-motion.
    const noHover = window.matchMedia('(hover: none)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noHover || reduced) return;

    let raf: number | null = null;
    let nextRotY = 0;
    let nextRotX = 0;

    const apply = () => {
      raf = null;
      el.style.transform = `perspective(${perspective}px) rotateX(${nextRotX}deg) rotateY(${nextRotY}deg) scale(${scale})`;
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      // dx > 0 → mouse right of center → rotateY positive (top-right pulls forward)
      // dy > 0 → mouse below center → rotateX negative (bottom tips forward)
      nextRotY = Math.max(-1, Math.min(1, dx)) * max;
      nextRotX = -Math.max(-1, Math.min(1, dy)) * max;
      if (raf === null) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [max, scale, perspective]);

  return ref;
};
