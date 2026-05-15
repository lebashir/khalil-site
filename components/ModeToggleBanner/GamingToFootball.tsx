'use client';

import { motion } from 'framer-motion';
import { ParticleBurst } from './ParticleBurst';
import type { ToggleQuality } from './useToggleQuality';

interface Props {
  /** 0..1 — where the seam is at the START of the transition (currently active gaming = 0.7) */
  fromSeam: number;
  /** 0..1 — where the seam settles after (football active = 0.3) */
  toSeam: number;
  durationMs: number;
  quality: ToggleQuality;
}

// Organic invasion: a ball rolls across the gaming pane, grass sprouts behind it,
// a white wave floods up, gold confetti bursts at the meeting point.
// On 'lite' quality (touch screens), particle counts are halved and the grass blade
// count is dropped — keeps the wow but reduces paint cost on iPhones / iPads.
export const GamingToFootball = ({ fromSeam, toSeam, durationMs, quality }: Props) => {
  const duration = durationMs / 1000;
  const grassBlades = quality === 'lite' ? 14 : 26;
  const confettiCount = quality === 'lite' ? 35 : 70;
  // Ball moves from right edge of the banner toward the new seam position.
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* White flood rising from bottom — sweeps left as the football pane invades. */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/0"
        initial={{ height: '0%', opacity: 0 }}
        animate={{ height: ['0%', '60%', '0%'], opacity: [0, 0.45, 0] }}
        transition={{ duration, ease: 'easeOut', times: [0, 0.55, 1] }}
      />

      {/* Grass blades sprouting bottom→top in a left→right wave. */}
      <div className="absolute bottom-0 left-0 right-0 flex h-1/2 items-end">
        {Array.from({ length: grassBlades }).map((_, i) => (
          <motion.div
            key={i}
            className="mx-[1px] flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-green-700 via-green-500 to-green-400"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0.9, 0.7, 0] }}
            transition={{
              duration,
              times: [0, 0.45, 0.7, 1],
              delay: (i / grassBlades) * duration * 0.4,
              ease: 'easeOut'
            }}
            style={{ height: `${20 + (i % 5) * 8}%` }}
          />
        ))}
      </div>

      {/* Rolling soccer ball — sweeps right to left, kicking up bits. */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        initial={{ left: '100%', rotate: 0 }}
        animate={{
          left: [`${fromSeam * 100}%`, `${toSeam * 100}%`],
          rotate: [0, -540]
        }}
        transition={{ duration: duration * 0.7, ease: 'easeOut' }}
      >
        <div
          className="h-8 w-8 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 30%, #fff 40%, #d8d8d8 41%, #fff 56%), conic-gradient(from 0deg, #000 0 12deg, transparent 12deg 60deg, #000 60deg 72deg, transparent 72deg 120deg, #000 120deg 132deg, transparent 132deg 180deg, #000 180deg 192deg, transparent 192deg 240deg, #000 240deg 252deg, transparent 252deg 300deg, #000 300deg 312deg, transparent 312deg 360deg)',
            backgroundBlendMode: 'multiply'
          }}
        />
      </motion.div>

      {/* Gold confetti burst near the settling seam. */}
      <div
        className="absolute inset-y-0 w-32 -translate-x-1/2"
        style={{ left: `${toSeam * 100}%` }}
      >
        <ParticleBurst
          kind="gold-confetti"
          originX={0.5}
          originY={0.5}
          durationMs={durationMs}
          particleCount={confettiCount}
        />
      </div>
    </div>
  );
};
