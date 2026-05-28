'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type { Song } from '@/lib/content';

interface PlayerState {
  playingId: string | null;
  progress: number; // 0–1
  togglePlay: (song: Song) => void;
  stop: () => void;
}

const Ctx = createContext<PlayerState | null>(null);

export const useBangersPlayer = (): PlayerState => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBangersPlayer outside provider');
  return ctx;
};

// Single shared <audio> element. Switching songs pauses the current one,
// loads the new src, then plays. No autoplay on initial mount.
export const BangersPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lazy-create the audio element on the client. Avoids SSR mismatch.
  useEffect(() => {
    const a = new Audio();
    a.preload = 'none';
    audioRef.current = a;
    const onTime = () => {
      if (a.duration > 0) setProgress(a.currentTime / a.duration);
    };
    const onEnd = () => {
      setPlayingId(null);
      setProgress(0);
    };
    const onError = () => {
      setPlayingId(null);
      setProgress(0);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onError);
    return () => {
      a.pause();
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, []);

  const togglePlay = useCallback((song: Song) => {
    const a = audioRef.current;
    if (!a) return;
    if (playingId === song.id) {
      a.pause();
      setPlayingId(null);
      return;
    }
    a.pause();
    a.src = song.audioUrl;
    a.currentTime = 0;
    setProgress(0);
    setPlayingId(song.id);
    void a.play().catch(() => {
      // Most likely: blocked autoplay or invalid blob URL. Reset state.
      setPlayingId(null);
    });
  }, [playingId]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    setPlayingId(null);
    setProgress(0);
  }, []);

  const value = useMemo(
    () => ({ playingId, progress, togglePlay, stop }),
    [playingId, progress, togglePlay, stop]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
