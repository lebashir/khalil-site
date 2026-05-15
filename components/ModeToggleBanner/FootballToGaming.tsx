'use client';

import { motion } from 'framer-motion';
import { ParticleBurst } from './ParticleBurst';
import type { ToggleQuality } from './useToggleQuality';

interface Props {
  fromSeam: number; // 0.3 when football was active
  toSeam: number;   // 0.7 after gaming takes over
  durationMs: number;
  quality: ToggleQuality;
}

// Digital corruption: pixel bloom eats the football pane, RGB-split shake,
// scanlines sweep, neon shards explode, electric-blue loading bar zips across.
// On 'lite' (touch): keep the pixel bloom + shards + loading bar (visual centerpiece),
// drop the RGB-split shake (causes jank on iOS Safari) and scanline sweep.
//
// Implementation note: the pixel bloom uses ONE element with a tiled conic-gradient
// background and an animated mask that wipes left→right. Previously it was a 320-node
// motion.div grid, which caused a ~25–50ms mount hitch on the first transition; the
// mask approach is a single DOM node with one CSS animation.
export const FootballToGaming = ({ fromSeam: _fromSeam, toSeam, durationMs, quality }: Props) => {
  const duration = durationMs / 1000;
  const lite = quality === 'lite';
  const shardCount = lite ? 35 : 70;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      // RGB-split shake — only on 'full'.
      animate={lite ? undefined : { x: [0, -3, 4, -2, 3, 0] }}
      transition={lite ? undefined : { duration: duration * 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
    >
      {/* Pixel bloom — single element. The tiled background creates the pixel grid,
          and the mask animation wipes it in left→right. Cheap to paint, single node. */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-conic-gradient(from 0deg at 50% 50%, #00b8ff 0deg 90deg, #b026ff 90deg 180deg, #ff2bd6 180deg 270deg, #0a0420 270deg 360deg)',
          backgroundSize: '14px 14px',
          opacity: 0.85,
          WebkitMaskImage:
            'linear-gradient(to right, black 0%, black 30%, transparent 60%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, black 0%, black 30%, transparent 60%, transparent 100%)',
          WebkitMaskSize: '300% 100%',
          maskSize: '300% 100%'
        }}
        initial={{ WebkitMaskPosition: '100% 0%', maskPosition: '100% 0%' }}
        animate={{
          WebkitMaskPosition: ['100% 0%', '0% 0%', '-50% 0%'],
          maskPosition:       ['100% 0%', '0% 0%', '-50% 0%']
        }}
        transition={{ duration: duration * 0.85, ease: 'easeInOut', times: [0, 0.6, 1] }}
      />

      {/* Scanlines sweeping top→bottom — only on 'full' (paint-heavy on mobile GPUs). */}
      {!lite && (
        <motion.div
          className="absolute inset-0"
          initial={{ y: '-100%' }}
          animate={{ y: '100%' }}
          transition={{ duration: duration * 0.8, ease: 'linear' }}
          aria-hidden
        >
          <div
            className="h-full w-full"
            style={{
              background:
                'repeating-linear-gradient(to bottom, rgba(0,184,255,0.22) 0px, rgba(0,184,255,0.22) 2px, transparent 2px, transparent 6px)'
            }}
          />
        </motion.div>
      )}

      {/* Loading bar zipping across — fills with electric blue */}
      <div className="absolute left-[10%] right-[10%] top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white/15 backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00b8ff] via-[#b026ff] to-[#ff2bd6]"
          initial={{ width: '0%' }}
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: duration * 0.75, ease: 'easeInOut' }}
        />
      </div>

      {/* Neon shard burst at the new seam. */}
      <div
        className="absolute inset-y-0 w-32 -translate-x-1/2"
        style={{ left: `${toSeam * 100}%` }}
      >
        <ParticleBurst
          kind="neon-shards"
          originX={0.5}
          originY={0.5}
          durationMs={durationMs}
          particleCount={shardCount}
        />
      </div>

      {/* CRT power-on flicker at the end. */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 0.6, 0] }}
        transition={{ duration, times: [0, 0.7, 0.82, 0.86, 1] }}
      />
    </motion.div>
  );
};
