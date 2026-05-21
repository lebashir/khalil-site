'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

interface UseLongPressOptions {
  /** Hold duration before the callback fires. Default 500ms. */
  ms?: number;
}

export interface LongPressHandlers {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
}

// Returns a set of pointer handlers that fires `callback` when the user
// holds the press for >= ms. The timer lives in a ref (not state) so
// StrictMode double-mounting in dev doesn't double-fire it. The caller
// is responsible for spreading these onto the target element.
export const useLongPress = (
  callback: () => void,
  options: UseLongPressOptions = {}
): LongPressHandlers => {
  const { ms = 500 } = options;
  const timerRef = useRef<number | null>(null);
  const cbRef = useRef(callback);

  // Keep the latest callback without re-creating handlers on every render.
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cancel any pending timer when the consumer unmounts.
  useEffect(() => clear, [clear]);

  const onPointerDown = useCallback(() => {
    clear();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      cbRef.current();
    }, ms);
  }, [clear, ms]);

  return {
    onPointerDown,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear
  };
};
