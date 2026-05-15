'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  ScreenDim,
  RGBSplit,
  Scanlines,
  PixelStorm,
  GrassTide,
  ControllerShape,
  BallShape,
  ViewportShake,
  DelayedBurst
} from './effects';

interface Props {
  /** Total takeover duration in ms. */
  durationMs: number;
  narrow: boolean;
  onDone: () => void;
}

// Gaming → Football takeover.
//   Beat 1 (0–0.28):   controller takes over (center, scales up).
//   Beat 2 (0.28–0.5): max glitch — RGB-split, scanlines, pixel storm, viewport shake.
//   Beat 3 (0.5–0.78): grass tide rises L→R, soccer ball sweeps across.
//   Beat 4 (0.78–0.94): floodlight radial flare from top edges + gold confetti center.
//   Beat 5 (0.94–1):    settle / fade out.
export const GamingToFootballTakeover = ({ durationMs, narrow, onDone }: Props) => {
  const d = durationMs / 1000;

  useEffect(() => {
    const t = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ pointerEvents: 'none', isolation: 'isolate' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Dim background */}
      <ScreenDim d={d} />

      <ViewportShake d={d} peakAt={0.4} amount={narrow ? 5 : 10}>
        {/* Beat 1: Controller shape — appears center, scales up rapidly. */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.1, opacity: 0, rotate: -8 }}
          animate={{
            scale: [0.1, 1.0, 1.05, 0.85, 0],
            opacity: [0, 1, 1, 0.7, 0],
            rotate: [-8, 0, 4, -6, 12]
          }}
          transition={{
            duration: d,
            times: [0, 0.22, 0.38, 0.48, 0.55],
            ease: 'easeOut'
          }}
        >
          <ControllerShape />
        </motion.div>

        {/* Beat 1+2: RGB split — applied to the whole viewport at peak glitch. */}
        {!narrow && <RGBSplit d={d} peakAt={0.4} holdFrac={0.22} />}

        {/* Beat 2: Scanlines flood top→bottom. */}
        <Scanlines d={d} peakAt={0.45} holdFrac={0.32} />

        {/* Beat 2: Pixel storm — cubes bloom from corners inward. */}
        <PixelStorm d={d} narrow={narrow} />
      </ViewportShake>

      {/* Beat 3: Grass tide rising L→R. */}
      <GrassTide d={d} narrow={narrow} />

      {/* Beat 3 cont.: Soccer ball sweeps across, kicking remaining gaming chunks away. */}
      <motion.div
        className="absolute top-[55%] -translate-y-1/2"
        initial={{ left: '108%', rotate: 0, opacity: 0 }}
        animate={{
          left: ['108%', '-30%'],
          rotate: [0, -720],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: d,
          times: [0.5, 0.58, 0.85, 0.9],
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <div className="-translate-x-1/2">
          <div className="h-[20vmin] w-[20vmin]">
            <BallShape />
          </div>
        </div>
      </motion.div>

      {/* Beat 4: Floodlight radial flare from top edges. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 8% -10%, rgba(255,245,200,0.85) 0%, rgba(255,245,200,0.0) 50%), radial-gradient(ellipse 70% 70% at 92% -10%, rgba(255,245,200,0.85) 0%, rgba(255,245,200,0.0) 50%)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 0.55, 0] }}
        transition={{ duration: d, times: [0, 0.78, 0.86, 0.94, 1], ease: 'easeOut' }}
      />

      {/* Beat 4: White flash crest at floodlight peak. */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.6, 0] }}
        transition={{ duration: d, times: [0, 0.83, 0.88, 0.96] }}
      />

      {/* Beat 4: Gold confetti burst from center, scheduled to fire near the flare. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-1 w-1">
          <div className="absolute -inset-[50vmin]">
            <DelayedBurst
              delayMs={durationMs * 0.8}
              kind="gold-confetti"
              durationMs={durationMs * 0.3}
              particleCount={narrow ? 50 : 110}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
