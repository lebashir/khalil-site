'use client';

import { useEffect } from 'react';

interface UseSwipeToFlipOptions {
  /** Min horizontal travel (px) to count as a swipe. Default 60. */
  threshold?: number;
  /** Max vertical travel (px). If exceeded, treat as a scroll. Default 40. */
  verticalTolerance?: number;
  /** Max gesture duration (ms). Slower than this and it's a drag, not a swipe. Default 700. */
  maxDurationMs?: number;
}

// Any element matching this selector at the start of the touch suppresses
// swipe detection. Lets buttons, inputs, drawers (via [data-no-swipe]) and
// scrollable carousels coexist with the page-wide swipe gesture.
const SKIP_SELECTOR =
  'button, a, input, textarea, select, [data-no-swipe], [contenteditable], [role="dialog"]';

// Touch-primary device check. Desktop Safari (Magic Mouse, Force Touch
// trackpads) and Chrome on a touchscreen laptop both dispatch TouchEvents,
// but we only want page-wide swipe-to-flip on phones/tablets. `pointer:
// coarse` is the right media query — it's true only when the primary input
// is imprecise (finger), false on every desktop pointing device.
const isTouchPrimary = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
};

// Detects fast horizontal swipes anywhere on the page and calls the
// provided `flip` handler. Touch-only AND touch-primary-device only —
// desktop users (including Safari on macOS with Magic Mouse, which
// synthesizes TouchEvents) flip via the TopBarMode toggle. Multi-touch
// (pinch/zoom) is ignored.
export const useSwipeToFlip = (
  flip: () => void,
  options: UseSwipeToFlipOptions = {}
): void => {
  const threshold = options.threshold ?? 60;
  const verticalTolerance = options.verticalTolerance ?? 40;
  const maxDurationMs = options.maxDurationMs ?? 700;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let startX = 0;
    let startY = 0;
    let startAt = 0;
    let tracking = false;
    let attached = false;

    const onTouchStart = (e: TouchEvent) => {
      // Single-finger only — multi-touch is for pinch/zoom and shouldn't
      // ever trigger a mode flip.
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      const touch = e.touches[0];
      if (!touch) return;
      const target = touch.target as Element | null;
      if (target && typeof target.closest === 'function' && target.closest(SKIP_SELECTOR)) {
        tracking = false;
        return;
      }
      startX = touch.clientX;
      startY = touch.clientY;
      startAt = Date.now();
      tracking = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dt = Date.now() - startAt;
      if (dt > maxDurationMs) return;
      const dy = touch.clientY - startY;
      if (Math.abs(dy) > verticalTolerance) return;
      const dx = touch.clientX - startX;
      if (Math.abs(dx) < threshold) return;
      flip();
    };

    const onTouchCancel = () => {
      tracking = false;
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchCancel, { passive: true });
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
    };

    if (isTouchPrimary()) attach();

    // Listen for input-mode changes (e.g. user pairs/unpairs a touch
    // display). Without this, switching modes mid-session wouldn't update.
    let mql: MediaQueryList | null = null;
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) attach();
      else detach();
    };
    if (typeof window.matchMedia === 'function') {
      mql = window.matchMedia('(pointer: coarse)');
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onChange);
      }
    }

    return () => {
      detach();
      if (mql && typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onChange);
      }
    };
  }, [flip, threshold, verticalTolerance, maxDurationMs]);
};
