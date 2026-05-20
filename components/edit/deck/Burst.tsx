'use client';

import { useEffect, useState } from 'react';

type BurstKind = 'paper' | 'gold' | 'neon' | 'glass' | 'confetti';

interface Props {
  x?: number;
  y?: number;
  count?: number;
  kind?: BurstKind;
  colors?: string[];
  durationMs?: number;
  spread?: number;
  onDone?: () => void;
}

const PALETTES: Record<BurstKind, string[]> = {
  gold: ['#ffd700', '#ffb35a', '#ffe48f', '#fff7c2'],
  neon: ['#00f0ff', '#b026ff', '#ff2bd6', '#ffe600'],
  paper: ['#ec5b3f', '#fde26a', '#7ec6c2', '#3aa867', '#9b6dc4', '#ec9b9b'],
  glass: ['#a9d4ff', '#f0c2ff', '#b9ffe0', '#ffd6a8', '#ffc4d8'],
  confetti: ['#ffffff', '#dddddd']
};

interface Particle {
  dx: number;
  dy: number;
  dr: number;
  size: number;
  color: string;
  delay: number;
  shape: 'rect' | 'circ';
}

// Tap-to-pop particle effect. Mount with a fresh `key` (e.g. a nonce) to
// retrigger. Mirrors the prototype Burst in design/directions/lib.jsx so
// the LaunchWindow explosion matches the spec.
export const Burst = ({
  x = 0.5,
  y = 0.5,
  count = 20,
  kind = 'confetti',
  colors,
  durationMs = 900,
  spread = 220,
  onDone
}: Props) => {
  const [parts] = useState<Particle[]>(() => {
    const palette = colors ?? PALETTES[kind];
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = spread * (0.4 + Math.random() * 0.7);
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - spread * 0.3,
        dr: (Math.random() - 0.5) * 720,
        size: 4 + Math.random() * (kind === 'paper' || kind === 'confetti' ? 8 : 6),
        color: palette[Math.floor(Math.random() * palette.length)] ?? '#fff',
        delay: Math.random() * 120,
        shape: Math.random() < 0.4 ? 'rect' : 'circ'
      };
    });
  });

  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, durationMs + 200);
    return () => clearTimeout(t);
  }, [onDone, durationMs]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        pointerEvents: 'none',
        zIndex: 90,
        width: 0,
        height: 0
      }}
    >
      {parts.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: -p.size / 2,
            top: -p.size / 2,
            width: p.size,
            height: p.size * (p.shape === 'rect' ? 0.5 : 1),
            background: p.color,
            borderRadius: p.shape === 'circ' ? '50%' : 2,
            // CSS custom props consumed by k-confetti keyframe (globals.css).
            ['--dx' as const]: `${p.dx}px`,
            ['--dy' as const]: `${p.dy}px`,
            ['--dr' as const]: `${p.dr}deg`,
            animation: `k-confetti ${durationMs}ms cubic-bezier(.25,.7,.45,1) ${p.delay}ms both`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
