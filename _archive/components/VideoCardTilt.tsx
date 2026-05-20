'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const MAX_TILT_DEG = 8;
const SPRING = { stiffness: 220, damping: 18, mass: 0.4 };

interface Props {
  href: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Anchor card with subtle 3D tilt on hover (desktop with fine pointer only).
 * On touch or reduced-motion, renders as a plain anchor.
 */
export const VideoCardTilt = ({ href, ariaLabel, className, children }: Props) => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  const rotateX = useTransform(sy, [-0.5, 0.5], [MAX_TILT_DEG, -MAX_TILT_DEG]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-MAX_TILT_DEG, MAX_TILT_DEG]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(hover && !reduced);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(nx);
    y.set(ny);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      style={enabled ? { rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 800 } : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.a>
  );
};
