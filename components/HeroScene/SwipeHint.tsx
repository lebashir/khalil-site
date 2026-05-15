'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'khalil-swipe-hint-dismissed';

/**
 * Once-only "swipe →" chip shown on touch devices on first visit.
 * Auto-dismisses after the user swipes or after 6 seconds, and never returns.
 */
export const SwipeHint = ({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!isTouch) return;
    if (!visible) return;
    setShow(true);
    const t = window.setTimeout(() => {
      setShow(false);
      localStorage.setItem(STORAGE_KEY, '1');
      onDismiss();
    }, 6000);
    return () => window.clearTimeout(t);
  }, [visible, onDismiss]);

  if (!show) return null;
  return (
    <div
      className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      swipe to switch worlds →
    </div>
  );
};

export const dismissSwipeHint = () => {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch { /* private mode */ }
};
