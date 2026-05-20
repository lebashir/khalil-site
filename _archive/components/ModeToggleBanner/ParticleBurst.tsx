'use client';

import { useEffect, useRef } from 'react';

export type BurstKind = 'gold-confetti' | 'neon-shards' | 'pixel-bits';

interface Props {
  kind: BurstKind;
  /** 0..1 horizontal anchor for the burst origin */
  originX: number;
  /** 0..1 vertical anchor */
  originY: number;
  durationMs: number;
  particleCount?: number;
  onDone?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'triangle';
  life: number;
}

const PALETTES: Record<BurstKind, string[]> = {
  'gold-confetti': ['#ffd700', '#ffffff', '#ffaa00', '#fff5b8'],
  'neon-shards':   ['#00b8ff', '#b026ff', '#ff2bd6', '#ffffff'],
  'pixel-bits':    ['#00b8ff', '#b026ff', '#1a0a3a', '#ff2bd6']
};

export const ParticleBurst = ({
  kind, originX, originY, durationMs, particleCount = 60, onDone
}: Props): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const palette = PALETTES[kind];
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width * originX;
    const cy = rect.height * originY;
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      const shape: Particle['shape'] = kind === 'pixel-bits'
        ? 'rect'
        : kind === 'neon-shards'
          ? (Math.random() < 0.6 ? 'triangle' : 'rect')
          : (Math.random() < 0.7 ? 'rect' : 'circle');
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        size: kind === 'pixel-bits' ? 3 + Math.random() * 4 : 4 + Math.random() * 7,
        color: palette[Math.floor(Math.random() * palette.length)] ?? '#fff',
        shape,
        life: 1
      };
    });

    const start = performance.now();
    const gravity = 380;

    const frame = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dt = 1 / 60;
      for (const p of particles) {
        p.vy += gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vRot * dt;
        p.life = 1 - t;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [kind, originX, originY, durationMs, particleCount, onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
};
