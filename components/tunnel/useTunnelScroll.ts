'use client';

import { useEffect, useRef, useState } from 'react';

interface Result {
  /** Attach to the tall wrapper element (5× viewport tall). */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Normalized scroll progress through the wrapper, [0, 1]. */
  progress: number;
  /** Current viewport height in px — drives the sticky stage's height. */
  containerH: number;
}

// Tunnel scroll tracker. Reads the wrapper's bounding rect on every rAF
// scroll tick and computes a normalized progress. Falls back to a 100ms
// setInterval poll so iOS Safari (which sometimes throttles scroll events
// during momentum or address-bar collapse) stays in sync.
export const useTunnelScroll = (): Result => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [containerH, setContainerH] = useState(() =>
    typeof window === 'undefined' ? 800 : window.innerHeight
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let rafId = 0;
    let lastP = -1;
    let lastH = -1;

    const tick = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const denom = Math.max(1, rect.height - vh);
      // rect.top goes from 0 → -(height-vh) as the user scrolls the
      // wrapper past the viewport top.
      const p = Math.max(0, Math.min(1, -rect.top / denom));
      if (Math.abs(p - lastP) > 0.0008) {
        lastP = p;
        setProgress(p);
      }
      if (vh !== lastH) {
        lastH = vh;
        setContainerH(vh);
      }
    };

    const scheduleTick = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        tick();
      });
    };

    tick();
    window.addEventListener('scroll', scheduleTick, { passive: true });
    window.addEventListener('resize', scheduleTick);
    // iOS-Safari safety net — momentum scroll + address-bar collapse can
    // skip frames; a low-cost poll catches missed updates.
    const iv = window.setInterval(tick, 100);

    return () => {
      window.removeEventListener('scroll', scheduleTick);
      window.removeEventListener('resize', scheduleTick);
      if (rafId) cancelAnimationFrame(rafId);
      window.clearInterval(iv);
    };
  }, []);

  return { ref, progress, containerH };
};
