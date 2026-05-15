'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsNarrow } from '@/hooks/useIsNarrow';

// Mode-specific ambient particle systems for the hero environment.
// Football: gold dust + occasional confetti drifting up-left.
// Gaming:   floating pixel-dust (magenta/cyan squares) + V-bucks-style diamond sparkles.
//
// Canvas-based, rAF-driven, paused via IntersectionObserver when off-screen.
// Particle counts auto-scale down on narrow viewports for the 60fps budget.

type Mode = 'football' | 'gaming';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vRot: number;
  color: string;
  shape: 'rect' | 'circle' | 'diamond';
  life: number; // 0..1 (1 = newborn)
  ttl: number;  // total life in seconds
}

interface Config {
  density: number;     // particles per 100kpx² of canvas (target steady-state count)
  spawnPerSec: number; // spawn rate
  palette: string[];
  shapeFor: (rand: number) => Particle['shape'];
  drift: { vxMin: number; vxMax: number; vyMin: number; vyMax: number };
  size: { min: number; max: number };
  ttlSec: number;
  blur: number;
}

const FOOTBALL_CONFIG: Config = {
  density: 0.015,
  spawnPerSec: 4,
  palette: ['#ffd700', '#fff5b8', '#ffffff', '#ffaa00'],
  shapeFor: r => (r < 0.25 ? 'rect' : 'circle'),
  drift: { vxMin: -22, vxMax: -6, vyMin: -34, vyMax: -10 },
  size: { min: 2, max: 5 },
  ttlSec: 9,
  blur: 0.6
};

const GAMING_CONFIG: Config = {
  density: 0.014,
  spawnPerSec: 4.5,
  palette: ['#00b8ff', '#b026ff', '#ff2bd6', '#ffffff'],
  shapeFor: r => (r < 0.7 ? 'rect' : 'diamond'),
  drift: { vxMin: -10, vxMax: 10, vyMin: -18, vyMax: -2 },
  size: { min: 3, max: 6 },
  ttlSec: 7,
  blur: 0.4
};

interface Props {
  mode: Mode;
  className?: string;
}

export const AmbientParticles = ({ mode, className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  const narrow = useIsNarrow();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = mode === 'football' ? FOOTBALL_CONFIG : GAMING_CONFIG;
    const scaleFactor = narrow ? 0.55 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let visible = true;
    const particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => {
      const r = Math.random();
      const drift = cfg.drift;
      const palette = cfg.palette;
      const colorIdx = Math.floor(Math.random() * palette.length);
      const color = palette[colorIdx] ?? '#fff';
      particles.push({
        x: Math.random() * width,
        y: height + Math.random() * 30,
        vx: drift.vxMin + Math.random() * (drift.vxMax - drift.vxMin),
        vy: drift.vyMin + Math.random() * (drift.vyMax - drift.vyMin),
        size: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min),
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 1.6,
        color,
        shape: cfg.shapeFor(r),
        life: 1,
        ttl: cfg.ttlSec * (0.8 + Math.random() * 0.4)
      });
    };

    resize();
    const initialCount = Math.floor(width * height * cfg.density * scaleFactor / 100);
    for (let i = 0; i < initialCount; i++) {
      spawn();
      const last = particles[particles.length - 1];
      if (last) {
        last.y = Math.random() * height;
        last.life = 0.4 + Math.random() * 0.6;
      }
    }

    let raf = 0;
    let last = performance.now();
    let spawnAcc = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      spawnAcc += dt * cfg.spawnPerSec * scaleFactor;
      while (spawnAcc >= 1) {
        spawnAcc -= 1;
        spawn();
      }

      ctx.clearRect(0, 0, width, height);
      if (cfg.blur > 0) ctx.filter = `blur(${cfg.blur}px)`;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vRot * dt;
        p.life -= dt / p.ttl;

        if (p.life <= 0 || p.y < -20 || p.x < -30 || p.x > width + 30) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, Math.min(1, p.life * 1.4));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.filter = 'none';
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);

    const io = new IntersectionObserver(entries => {
      const entry = entries[0];
      visible = entry ? entry.isIntersecting : true;
    }, { threshold: 0 });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, [mode, reduced, narrow]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
      aria-hidden
    />
  );
};
