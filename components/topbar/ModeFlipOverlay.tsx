'use client';

import { PALETTE } from './palette';
import type { ModeFlipTransition } from './useModeFlip';

interface Props {
  transition: ModeFlipTransition | null;
}

// Cinematic 900ms transition layer. Three painted layers:
//   1. Diagonal wipe slab in the target mode's gradient (sweeps in then out)
//   2. White flash near the midpoint
//   3. Six skewed light streaks shooting across
//   4. Outgoing label falls / blurs out, incoming label rises into place
//
// Mounted globally by <ModeFlipProvider>. Rendered conditionally on
// `transition` — keyed by nonce so a fresh DOM is created each flip,
// which restarts the CSS animations cleanly.
export const ModeFlipOverlay = ({ transition }: Props) => {
  if (!transition) return null;
  const { from, to, nonce } = transition;
  const fromP = PALETTE[from];
  const toP = PALETTE[to];

  return (
    <div
      key={nonce}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Diagonal slab in the target mode's gradient */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          bottom: -40,
          left: 0,
          width: '160%',
          background: `linear-gradient(135deg, ${toP.bgA} 0%, ${toP.bgB} 45%, ${toP.bgC} 100%)`,
          transform: 'skewX(-12deg) translateX(120%)',
          animation:
            'tb-wipe-diag-in .42s cubic-bezier(.6,1.1,.3,1) both, tb-wipe-diag-out .42s cubic-bezier(.5,0,.7,1) .48s both'
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${toP.accent}33 1.2px, transparent 1.5px)`,
            backgroundSize: '10px 10px',
            opacity: 0.6,
            mixBlendMode: 'screen'
          }}
        />
      </div>

      {/* White flash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffffff',
          opacity: 0,
          animation: 'tb-flash-bright .55s ease-out .25s both'
        }}
      />

      {/* Light streaks */}
      {[0.15, 0.25, 0.4, 0.55, 0.7, 0.85].map((y, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: `${y * 100}%`,
            height: 4 + (i % 3) * 2,
            width: '40%',
            background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? toP.accent : toP.accent2}, transparent)`,
            opacity: 0.85,
            transform: 'translateX(-100%) skewX(-20deg)',
            animation: `tb-streak ${0.6 + (i % 3) * 0.15}s cubic-bezier(.4,.6,.5,1) ${0.18 + i * 0.04}s both`,
            mixBlendMode: 'screen',
            boxShadow: `0 0 12px ${i % 2 === 0 ? toP.accent : toP.accent2}`
          }}
        />
      ))}

      {/* Outgoing label falls off */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(80px, 14vw, 220px)',
          color: fromP.ink,
          letterSpacing: 4,
          textShadow: `0 0 32px ${fromP.accent}, 0 0 64px ${fromP.accent2}`,
          animation: 'tb-fall-label .25s cubic-bezier(.5,.1,.7,.4) both',
          whiteSpace: 'nowrap'
        }}
      >
        {fromP.emoji} {fromP.label}
      </div>

      {/* Incoming label rises into place */}
      <div
        style={{
          position: 'absolute',
          top: '54%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(80px, 14vw, 220px)',
          color: toP.ink,
          letterSpacing: 4,
          textShadow: `0 0 32px ${toP.accent}, 0 0 64px ${toP.accent2}`,
          animation: 'tb-rise-label .55s cubic-bezier(.3,1.4,.4,1) .35s both',
          whiteSpace: 'nowrap'
        }}
      >
        {toP.emoji} {toP.label}
      </div>
    </div>
  );
};
