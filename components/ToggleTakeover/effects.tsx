'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ParticleBurst, type BurstKind } from '@/components/ModeToggleBanner/ParticleBurst';

// ─────────────────────────────────────────────────────────────────────────────
// Shared full-viewport effect helpers used by both takeover directions.
// All durations are passed in seconds (`d`) and effects are scheduled inside
// the overall takeover timeline using `times` arrays on the animate prop.
// ─────────────────────────────────────────────────────────────────────────────

interface TimedProps {
  /** total takeover duration (seconds) */
  d: number;
  /** scale particle counts / row counts down on narrow viewports */
  narrow?: boolean;
}

/** Solid screen-dim under the takeover content. Eases in and out. */
export const ScreenDim = ({ d }: TimedProps) => (
  <motion.div
    className="absolute inset-0 bg-black"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.65, 0.65, 0] }}
    transition={{ duration: d, times: [0, 0.15, 0.8, 1], ease: 'easeOut' }}
  />
);

/** RGB-split chromatic aberration — three offset-tinted copies of a center mask.
 *  Visually reads as the screen "tearing" without the cost of an actual snapshot. */
interface RGBProps extends TimedProps {
  /** 0..1 — when the glitch peaks within the takeover timeline */
  peakAt: number;
  /** how long the glitch holds, as a fraction of total duration */
  holdFrac?: number;
}
export const RGBSplit = ({ d, peakAt, holdFrac = 0.25 }: RGBProps) => {
  const start = Math.max(0, peakAt - holdFrac / 2);
  const end = Math.min(1, peakAt + holdFrac / 2);
  return (
    <>
      {(['#ff2bd6', '#00b8ff', '#b026ff'] as const).map((color, i) => (
        <motion.div
          key={color}
          className="absolute inset-0 mix-blend-screen"
          style={{
            background: color,
            opacity: 0
          }}
          initial={{ x: 0, opacity: 0 }}
          animate={{
            x: [0, (i - 1) * 14, (i - 1) * 6, 0],
            opacity: [0, 0.22, 0.18, 0]
          }}
          transition={{
            duration: d,
            times: [start, peakAt - 0.03, peakAt + 0.03, end].map(t => Math.min(1, Math.max(0, t))),
            ease: 'easeInOut'
          }}
        />
      ))}
    </>
  );
};

/** Sweeping scanlines that travel top→bottom. */
export const Scanlines = ({ d, peakAt = 0.5, holdFrac = 0.35 }: TimedProps & { peakAt?: number; holdFrac?: number }) => {
  const start = Math.max(0, peakAt - holdFrac / 2);
  const end = Math.min(1, peakAt + holdFrac / 2);
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background:
          'repeating-linear-gradient(0deg, rgba(0,200,255,0.18) 0 2px, transparent 2px 5px)',
        backgroundSize: '100% 8px',
        mixBlendMode: 'screen'
      }}
      initial={{ backgroundPositionY: -200, opacity: 0 }}
      animate={{
        backgroundPositionY: [-200, 600],
        opacity: [0, 0.85, 0.85, 0]
      }}
      transition={{
        duration: d,
        times: [start, start + 0.05, end - 0.05, end].map(t => Math.min(1, Math.max(0, t))),
        ease: 'linear'
      }}
    />
  );
};

/** Pixel cubes that bloom from the four corners and rush inward. */
export const PixelStorm = ({ d, narrow }: TimedProps) => {
  const count = narrow ? 28 : 56;
  const palette = ['#00b8ff', '#b026ff', '#ff2bd6', '#ffffff'];
  const pixels = Array.from({ length: count }, (_, i) => {
    const corner = i % 4;
    const cx = corner === 0 || corner === 3 ? -5 : 105;
    const cy = corner < 2 ? -5 : 105;
    const tx = 30 + Math.random() * 40;
    const ty = 30 + Math.random() * 40;
    const colorIdx = i % palette.length;
    return {
      key: i,
      cx,
      cy,
      tx,
      ty,
      size: narrow ? 8 : 8 + ((i * 3) % 9),
      delay: (i / count) * 0.18,
      color: palette[colorIdx] ?? '#fff'
    };
  });
  return (
    <>
      {pixels.map(p => (
        <motion.span
          key={p.key}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}aa`
          }}
          initial={{ left: `${p.cx}%`, top: `${p.cy}%`, opacity: 0, scale: 0.5 }}
          animate={{
            left: [`${p.cx}%`, `${p.tx}%`, `${p.tx + (p.tx - 50) * 0.4}%`],
            top: [`${p.cy}%`, `${p.ty}%`, `${p.ty + (p.ty - 50) * 0.4}%`],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.6]
          }}
          transition={{
            duration: d,
            times: [0.28 + p.delay * 0.05, 0.55, 0.78].map(t => Math.min(1, t)),
            ease: 'easeOut'
          }}
        />
      ))}
    </>
  );
};

/** A rising tide of grass blades sprouting bottom→top in a left-to-right wave. */
export const GrassTide = ({ d, narrow }: TimedProps) => {
  const blades = narrow ? 28 : 56;
  return (
    <div className="absolute inset-x-0 bottom-0 h-[70%]">
      {Array.from({ length: blades }).map((_, i) => {
        const height = 40 + ((i * 7) % 50);
        const delay = (i / blades) * 0.22;
        return (
          <motion.span
            key={i}
            className="absolute bottom-0 origin-bottom"
            style={{
              left: `${(i / blades) * 100}%`,
              width: `${100 / blades}%`,
              height: `${height}%`,
              background:
                'linear-gradient(to top, #07391a 0%, #0e6a2c 55%, #1aa648 100%)',
              borderRadius: '4px 4px 0 0',
              filter: 'drop-shadow(0 -4px 6px rgba(0,80,0,0.4))'
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1.05, 1, 0.3] }}
            transition={{
              duration: d,
              times: [0.5 + delay * 0.1, 0.7, 0.82, 1].map(t => Math.min(1, t)),
              ease: [0.22, 1, 0.36, 1]
            }}
          />
        );
      })}
    </div>
  );
};

/** Stylized gamepad SVG (full-viewport size, for the takeover hero shape). */
export const ControllerShape = () => (
  <svg viewBox="0 0 220 120" className="h-[60vmin] w-[80vmin] max-w-[90vw]" aria-hidden>
    <defs>
      <linearGradient id="ctrl-tx" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#1c1640" />
        <stop offset="100%" stopColor="#04020c" />
      </linearGradient>
      <linearGradient id="ctrl-rim" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#00b8ff" />
        <stop offset="100%" stopColor="#ff2bd6" />
      </linearGradient>
    </defs>
    <path
      d="M30 38 Q12 44 12 70 Q12 100 36 100 L66 100 Q82 78 110 78 Q138 78 154 100 L184 100 Q208 100 208 70 Q208 44 190 38 Q170 28 150 36 L110 44 L70 36 Q50 28 30 38 Z"
      fill="url(#ctrl-tx)"
      stroke="url(#ctrl-rim)"
      strokeWidth="3"
    />
    <circle cx="58" cy="66" r="7" fill="#00b8ff" />
    <circle cx="162" cy="66" r="7" fill="#ff2bd6" />
    <circle cx="110" cy="62" r="6" fill="#b026ff" />
    <rect x="42" y="62" width="14" height="3" fill="#fff" opacity="0.7" />
    <rect x="48" y="56" width="3" height="14" fill="#fff" opacity="0.7" />
  </svg>
);

/** Stylized soccer ball SVG (full-viewport size for the takeover hero shape). */
export const BallShape = () => (
  <div
    className="h-[70vmin] w-[70vmin] max-h-[90vmin] max-w-[90vmin] rounded-full shadow-[0_0_60px_rgba(255,255,255,0.25)]"
    style={{
      backgroundImage:
        'radial-gradient(circle at 35% 30%, #ffffff 35%, #d8d8d8 48%, #ffffff 70%), conic-gradient(from 0deg, #000 0 12deg, transparent 12deg 60deg, #000 60deg 72deg, transparent 72deg 120deg, #000 120deg 132deg, transparent 132deg 180deg, #000 180deg 192deg, transparent 192deg 240deg, #000 240deg 252deg, transparent 252deg 300deg, #000 300deg 312deg, transparent 312deg 360deg)',
      backgroundBlendMode: 'multiply'
    }}
  />
);

/** Mounts a ParticleBurst after `delayMs` so a burst can be scheduled inside a
 *  longer timeline without playing immediately on mount. */
interface DelayedBurstProps {
  delayMs: number;
  kind: BurstKind;
  durationMs: number;
  particleCount: number;
  originX?: number;
  originY?: number;
}
export const DelayedBurst = ({
  delayMs,
  kind,
  durationMs,
  particleCount,
  originX = 0.5,
  originY = 0.5
}: DelayedBurstProps) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  if (!show) return null;
  return (
    <ParticleBurst
      kind={kind}
      originX={originX}
      originY={originY}
      durationMs={durationMs}
      particleCount={particleCount}
    />
  );
};

/** Hard shake wrapper — translates the children by jittery amounts for `holdFrac`
 *  of the timeline centered at `peakAt`. Used during the glitch-max beats. */
interface ShakeProps {
  children: React.ReactNode;
  d: number;
  peakAt: number;
  amount?: number;
}
export const ViewportShake = ({ children, d, peakAt, amount = 8 }: ShakeProps) => {
  const start = Math.max(0, peakAt - 0.08);
  const end = Math.min(1, peakAt + 0.08);
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [0, -amount, amount, -amount / 2, amount / 2, 0],
        y: [0, amount / 2, -amount / 2, amount, -amount, 0]
      }}
      transition={{
        duration: d,
        times: [start, start + 0.02, start + 0.05, start + 0.08, start + 0.11, end].map(t => Math.min(1, t)),
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};
