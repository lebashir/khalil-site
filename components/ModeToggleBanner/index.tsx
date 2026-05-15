'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useMode } from '@/components/ModeProvider';
import type { Mode } from '@/lib/content';
import { GamingToFootball } from './GamingToFootball';
import { FootballToGaming } from './FootballToGaming';
import { useToggleQuality, type ToggleQuality } from './useToggleQuality';

const SEAM_ACTIVE = 0.7;   // active pane takes 70%
const SEAM_INACTIVE = 0.3; // inactive pane takes 30%
const TRANSITION_MS = 800;
const TRANSITION_LITE_MS = 650;
const REDUCED_MS = 200;

type Direction = 'g2f' | 'f2g' | null;

const durationFor = (q: ToggleQuality): number => {
  if (q === 'none') return REDUCED_MS;
  if (q === 'lite') return TRANSITION_LITE_MS;
  return TRANSITION_MS;
};

export const ModeToggleBanner = () => {
  const { mode, setMode } = useMode();
  const quality = useToggleQuality();
  const [transition, setTransition] = useState<Direction>(null);

  const onPick = useCallback((target: Mode) => {
    if (target === mode || transition !== null) return;
    const dir: Direction = mode === 'gaming' ? 'g2f' : 'f2g';
    setTransition(dir);
    setMode(target);
    window.setTimeout(() => setTransition(null), durationFor(quality));
  }, [mode, setMode, transition, quality]);

  const onKey = (target: Mode) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPick(target);
    }
  };

  // Width % of the left (gaming) pane.
  const gamingWidth = mode === 'gaming' ? SEAM_ACTIVE : SEAM_INACTIVE;
  const seamLeftPct = gamingWidth * 100;
  const widthDurS = durationFor(quality) / 1000;

  return (
    <div
      className="relative w-full overflow-hidden border-b border-white/15"
      style={{ height: 88 }}
      role="region"
      aria-label="Site mode toggle"
    >
      {/* Gaming pane (always on the left). The whole pane is the tap target — 88px tall × ≥30% wide,
          well above the 44pt iOS HIG minimum even on iPhone SE. */}
      <motion.button
        type="button"
        onClick={() => onPick('gaming')}
        onKeyDown={onKey('gaming')}
        aria-pressed={mode === 'gaming'}
        aria-label={`Switch to gaming mode${mode === 'gaming' ? ' (currently active)' : ''}`}
        className="group absolute left-0 top-0 h-full overflow-hidden text-left focus-visible:outline-none"
        style={{
          background:
            'linear-gradient(135deg, #0a0420 0%, #1a0a3a 45%, #2a0f5a 100%)',
          clipPath: `polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)`
        }}
        animate={{ width: `${gamingWidth * 100}%` }}
        transition={{ duration: widthDurS, ease: [0.65, 0, 0.35, 1] }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(176,38,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,184,255,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
          aria-hidden
        />
        <div className="relative z-10 flex h-full items-center gap-3 px-4 sm:px-6">
          <span
            className="font-gaming text-sm tracking-widest text-[#00b8ff] sm:text-xl"
            style={{ textShadow: '0 0 18px rgba(0,184,255,0.7)' }}
          >
            GAMING
          </span>
          {mode === 'gaming' && (
            <span className="hidden text-xs uppercase tracking-[0.3em] text-white/70 sm:inline">
              · controllers loaded
            </span>
          )}
        </div>
        {mode !== 'gaming' && (
          <span
            className="pointer-events-none absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-0"
            aria-hidden
          />
        )}
      </motion.button>

      {/* Football pane (always on the right) */}
      <motion.button
        type="button"
        onClick={() => onPick('football')}
        onKeyDown={onKey('football')}
        aria-pressed={mode === 'football'}
        aria-label={`Switch to football mode${mode === 'football' ? ' (currently active)' : ''}`}
        className="group absolute right-0 top-0 h-full overflow-hidden text-right focus-visible:outline-none"
        style={{
          background: 'linear-gradient(135deg, #001233 0%, #002970 45%, #0046b5 100%)',
          clipPath: `polygon(22px 0, 100% 0, 100% 100%, 0 100%)`
        }}
        animate={{ width: `${(1 - gamingWidth) * 100}%` }}
        transition={{ duration: widthDurS, ease: [0.65, 0, 0.35, 1] }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,255,255,0.4) 0 14px, transparent 14px 32px)'
          }}
          aria-hidden
        />
        <div className="relative z-10 flex h-full items-center justify-end gap-3 px-4 sm:px-6">
          {mode === 'football' && (
            <span className="hidden text-xs uppercase tracking-[0.3em] text-white/70 sm:inline">
              · boots laced ·
            </span>
          )}
          <span
            className="font-football text-sm tracking-widest text-[#ffd700] sm:text-xl"
            style={{ textShadow: '0 0 18px rgba(255,215,0,0.65)' }}
          >
            FOOTBALL
          </span>
        </div>
        {mode !== 'football' && (
          <span
            className="pointer-events-none absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-0"
            aria-hidden
          />
        )}
      </motion.button>

      {/* Diagonal seam shimmer */}
      <motion.div
        className="seam-shimmer pointer-events-none absolute top-0 h-full"
        animate={{ left: `${seamLeftPct}%` }}
        transition={{ duration: widthDurS, ease: [0.65, 0, 0.35, 1] }}
        style={{
          width: '6px',
          transform: 'translateX(-3px)',
          background:
            'linear-gradient(to bottom, transparent, rgba(255,255,255,0.85), transparent)',
          filter: 'blur(0.5px)'
        }}
        aria-hidden
      />

      {/* Transition overlays. 'none' → no overlay (cross-fade via width only).
          'lite' → drop the heaviest effects (RGB-split, scanlines), cut particle counts.
          'full' → everything. */}
      <AnimatePresence>
        {quality !== 'none' && transition === 'g2f' && (
          <motion.div key="g2f" className="absolute inset-0" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GamingToFootball
              fromSeam={SEAM_ACTIVE}
              toSeam={SEAM_INACTIVE}
              durationMs={durationFor(quality)}
              quality={quality}
            />
          </motion.div>
        )}
        {quality !== 'none' && transition === 'f2g' && (
          <motion.div key="f2g" className="absolute inset-0" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FootballToGaming
              fromSeam={SEAM_INACTIVE}
              toSeam={SEAM_ACTIVE}
              durationMs={durationFor(quality)}
              quality={quality}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
