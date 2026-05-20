'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Mode } from '@/lib/content';
import { useModeFlip, type ModeFlipTransition } from './useModeFlip';
import { ModeFlipOverlay } from './ModeFlipOverlay';

interface ModeFlipContextValue {
  mode: Mode;
  flip: () => void;
  transition: ModeFlipTransition | null;
  isTransitioning: boolean;
}

const ModeFlipContext = createContext<ModeFlipContextValue | null>(null);

interface Props {
  children: ReactNode;
}

// Mounted once at the root layout. Provides the cinematic flip handle to
// any descendant via useModeFlipContext(). Also mounts the
// <ModeFlipOverlay> globally so the transition appears on every route
// (even /intro and /edit, which don't render the topbar themselves).
export const ModeFlipProvider = ({ children }: Props) => {
  const value = useModeFlip();
  return (
    <ModeFlipContext.Provider value={value}>
      {children}
      <ModeFlipOverlay transition={value.transition} />
    </ModeFlipContext.Provider>
  );
};

export const useModeFlipContext = (): ModeFlipContextValue => {
  const ctx = useContext(ModeFlipContext);
  if (!ctx) {
    throw new Error('useModeFlipContext must be used inside <ModeFlipProvider>');
  }
  return ctx;
};
