'use client';

import { useCallback, useEffect, useState } from 'react';
import { setMuted as engineSetMuted } from '@/lib/audio/engine';

const STORAGE_KEY = 'khalil_audio_muted';
const SYNC_EVENT = 'khalil:audio-mute-change';

const readMute = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const writeMute = (next: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  } catch {
    // localStorage may be blocked — ignore
  }
};

interface UseMuteResult {
  muted: boolean;
  toggle: () => void;
}

// SSR-safe mute hook. Returns false on first render so the server-rendered
// HTML matches the initial client paint; on mount it hydrates from
// localStorage and syncs the audio engine. A custom window event keeps
// multiple <MuteToggle> instances in sync.
export const useMute = (): UseMuteResult => {
  const [muted, setMuted] = useState(false);

  // Hydrate + sync engine on mount
  useEffect(() => {
    const initial = readMute();
    setMuted(initial);
    engineSetMuted(initial);
  }, []);

  // Listen for cross-instance changes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail !== 'boolean') return;
      setMuted(detail);
      engineSetMuted(detail);
    };
    window.addEventListener(SYNC_EVENT, handler as EventListener);
    return () => window.removeEventListener(SYNC_EVENT, handler as EventListener);
  }, []);

  const toggle = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      writeMute(next);
      engineSetMuted(next);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
      return next;
    });
  }, []);

  return { muted, toggle };
};
