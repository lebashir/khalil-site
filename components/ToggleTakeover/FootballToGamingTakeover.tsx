'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  ScreenDim,
  RGBSplit,
  Scanlines,
  PixelStorm,
  BallShape,
  ViewportShake,
  DelayedBurst
} from './effects';

interface Props {
  durationMs: number;
  narrow: boolean;
  onDone: () => void;
}

// Football → Gaming takeover.
//   Beat 1 (0–0.28):   ball appears bottom-right, scales while rolling to center.
//   Beat 2 (0.28–0.56): pixels attack — RGB-split, scanlines, pixel storm, ball fractures.
//   Beat 3 (0.56–0.83): CRT boot screen reveal — bright rect grows, BOOT bar zips, dissolves.
//   Beat 4 (0.83–1):    settle + small CRT flicker, fade out overlay.
export const FootballToGamingTakeover = ({ durationMs, narrow, onDone }: Props) => {
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
      {/* Dim background. */}
      <ScreenDim d={d} />

      <ViewportShake d={d} peakAt={0.45} amount={narrow ? 5 : 10}>
        {/* Beat 1: Ball appears bottom-right, rolls and scales to center. */}
        <motion.div
          className="absolute"
          initial={{ left: '70%', top: '90%', x: '-50%', y: '-50%', scale: 0.05, rotate: 0, opacity: 0 }}
          animate={{
            left: ['70%', '50%', '50%', '50%'],
            top: ['90%', '50%', '50%', '50%'],
            scale: [0.05, 1, 1, 0.4],
            rotate: [0, 540, 720, 900],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: d,
            times: [0, 0.28, 0.5, 0.58],
            ease: 'easeOut'
          }}
          style={{ x: '-50%', y: '-50%' }}
        >
          <BallShape />
        </motion.div>

        {/* Beat 2: RGB split + scanlines + pixel storm — pixels eat the ball. */}
        {!narrow && <RGBSplit d={d} peakAt={0.45} holdFrac={0.24} />}
        <Scanlines d={d} peakAt={0.5} holdFrac={0.34} />
        <PixelStorm d={d} narrow={narrow} />

        {/* Fracture flash — the ball shattering into pixels. */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.7, 0] }}
          transition={{ duration: d, times: [0, 0.48, 0.52, 0.58], ease: 'easeOut' }}
        >
          <div
            className="h-[50vmin] w-[50vmin] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,43,214,0.45) 40%, transparent 70%)',
              filter: 'blur(8px)'
            }}
          />
        </motion.div>
      </ViewportShake>

      {/* Beat 3: CRT boot screen — bright rectangle grows from a single line at center. */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: d, times: [0, 0.55, 0.62, 0.78, 0.86] }}
      >
        <motion.div
          className="relative overflow-hidden rounded-md"
          style={{
            background:
              'linear-gradient(135deg, #00b8ff 0%, #b026ff 50%, #ff2bd6 100%)',
            boxShadow:
              '0 0 60px 12px rgba(0,184,255,0.55), 0 0 140px 30px rgba(176,38,255,0.35)'
          }}
          initial={{ width: '0%', height: '2px' }}
          animate={{
            width: ['0%', '85%', '85%', '0%'],
            height: ['2px', '55%', '55%', '2px']
          }}
          transition={{
            duration: d,
            times: [0.56, 0.66, 0.78, 0.86],
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {/* BOOT loading bar that zips across. */}
          <motion.div
            className="absolute inset-y-0 left-0 w-[14%]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)'
            }}
            initial={{ x: '-30%' }}
            animate={{ x: ['-30%', '900%'] }}
            transition={{ duration: d * 0.16, delay: d * 0.62, ease: 'easeIn', repeat: 1 }}
          />
          {/* Scanline overlay on the boot screen. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px)',
              mixBlendMode: 'multiply'
            }}
          />
          {/* BOOT label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-display text-white"
              style={{
                fontSize: 'clamp(28px, 6vmin, 80px)',
                textShadow: '0 0 18px rgba(0,184,255,0.9)',
                letterSpacing: '0.3em'
              }}
            >
              BOOT
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Beat 4: CRT flicker as we settle. */}
      <motion.div
        className="absolute inset-0 bg-white mix-blend-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.3, 0, 0.18, 0] }}
        transition={{ duration: d, times: [0, 0.86, 0.88, 0.91, 0.94, 0.98] }}
      />

      {/* Beat 4: A handful of pixel-bit confetti as the gaming world arrives. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-1 w-1">
          <div className="absolute -inset-[50vmin]">
            <DelayedBurst
              delayMs={durationMs * 0.82}
              kind="pixel-bits"
              durationMs={durationMs * 0.3}
              particleCount={narrow ? 35 : 70}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
