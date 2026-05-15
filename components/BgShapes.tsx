'use client';

import { useEffect, useRef, useState } from 'react';
import { useMode } from '@/components/ModeProvider';
import { usePrefersReducedMotion } from './ModeToggleBanner/usePrefersReducedMotion';

const gamingShapes = [
  <svg key="ctrl" viewBox="0 0 24 24" fill="#00b8ff" aria-hidden><path d="M6 9h2v2H6v2H4v-2H2V9h2V7h2v2zm14 5a2 2 0 100-4 2 2 0 000 4zm-3-3a2 2 0 11-4 0 2 2 0 014 0zm-7 9h12a4 4 0 004-4v-4a8 8 0 00-8-8H4a4 4 0 00-4 4v4a4 4 0 004 4h6z" /></svg>,
  <svg key="star" viewBox="0 0 24 24" fill="#b026ff" aria-hidden><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  <svg key="cube" viewBox="0 0 24 24" fill="#ff2bd6" aria-hidden><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
];

const footballShapes = [
  <svg key="ball" viewBox="0 0 24 24" fill="#ffd700" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 4l3 3-3 3-3-3z" fill="#001233" /></svg>,
  <svg key="star" viewBox="0 0 24 24" fill="#ffffff" aria-hidden><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  <svg key="orbit" viewBox="0 0 24 24" fill="#4d8fff" aria-hidden><circle cx="12" cy="12" r="10" stroke="#ffd700" strokeWidth="1.5" fill="none" /><circle cx="12" cy="12" r="3" fill="#ffd700" /></svg>
];

interface ShapePos {
  top: string;
  left: string;
  size: number;
  delay: number;
  opacity?: number;
  depth: number; // 0..1, multiplier for parallax response
}

const positions: ShapePos[] = [
  { top: '12%', left: '6%',  size: 70, delay: 0, depth: 0.9 },
  { top: '38%', left: '90%', size: 55, delay: 2, depth: 0.5 },
  { top: '65%', left: '8%',  size: 80, delay: 4, depth: 1.0 },
  { top: '85%', left: '78%', size: 60, delay: 1, depth: 0.7 },
  { top: '25%', left: '70%', size: 45, delay: 3, depth: 0.4 },
  { top: '55%', left: '45%', size: 90, delay: 5, opacity: 0.25, depth: 1.0 }
];

const MAX_PARALLAX_PX = 15;

export const BgShapes = () => {
  const { mode } = useMode();
  const prefersReduced = usePrefersReducedMotion();
  const palette = mode === 'football' ? footballShapes : gamingShapes;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offsets, setOffsets] = useState<Array<{ x: number; y: number }>>(
    () => positions.map(() => ({ x: 0, y: 0 }))
  );
  const [hoverHover, setHoverHover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHoverHover(window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 880px)').matches);
  }, []);

  useEffect(() => {
    if (!hoverHover || prefersReduced) return;
    let raf = 0;
    const handle = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = (e.clientX - w / 2) / w; // -0.5..0.5
        const cy = (e.clientY - h / 2) / h;
        setOffsets(positions.map(p => ({
          x: -cx * MAX_PARALLAX_PX * p.depth,
          y: -cy * MAX_PARALLAX_PX * p.depth
        })));
      });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hoverHover, prefersReduced]);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {positions.map((p, i) => {
        const off = offsets[i] ?? { x: 0, y: 0 };
        return (
          <div
            key={i}
            className="absolute motion-safe:animate-float"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity ?? 0.5,
              filter: 'blur(1px)',
              transform: `translate3d(${off.x}px, ${off.y}px, 0)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {palette[i % palette.length]}
          </div>
        );
      })}
    </div>
  );
};
