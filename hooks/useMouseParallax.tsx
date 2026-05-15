'use client';

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useIsHoverDevice } from './useIsHoverDevice';
import { useReducedMotion } from './useReducedMotion';

// Normalized cursor position: -1..1 on each axis, with 0,0 at viewport center.
// Spring-smoothed so layers don't twitch with every pixel of mouse jitter.
export interface MouseParallaxValue {
  x: MotionValue<number>;
  y: MotionValue<number>;
  enabled: boolean;
}

const MouseParallaxContext = createContext<MouseParallaxValue | null>(null);

interface ProviderProps {
  children: ReactNode;
}

const SPRING_CONFIG = { stiffness: 90, damping: 18, mass: 0.6 } as const;

export const MouseParallaxProvider = ({ children }: ProviderProps) => {
  const hover = useIsHoverDevice();
  const reduced = useReducedMotion();
  const enabled = hover && !reduced;

  // Raw input (rAF-throttled), then a spring-smoothed copy that consumers actually read.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  const nextRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      nextRef.current.x = w === 0 ? 0 : (e.clientX / w) * 2 - 1;
      nextRef.current.y = h === 0 ? 0 : (e.clientY / h) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        rawX.set(nextRef.current.x);
        rawY.set(nextRef.current.y);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, rawX, rawY]);

  const value = useMemo<MouseParallaxValue>(() => ({ x, y, enabled }), [x, y, enabled]);

  return (
    <MouseParallaxContext.Provider value={value}>
      {children}
    </MouseParallaxContext.Provider>
  );
};

// Returns null on the server / outside the provider so callers can render defensively.
export const useMouseParallax = (): MouseParallaxValue | null => {
  return useContext(MouseParallaxContext);
};
