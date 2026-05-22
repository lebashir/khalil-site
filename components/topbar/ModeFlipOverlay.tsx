'use client';

import { getPalette } from './palette';
import { useGamingTheme } from '@/components/GamingThemeProvider';
import type { ModeFlipTransition } from './useModeFlip';

interface Props {
  transition: ModeFlipTransition | null;
}

// Cinematic 900ms transition layer. Five painted layers:
//   1. Diagonal wipe slab in the target mode's gradient (sweeps in then out)
//   2. White flash near the midpoint
//   3. Six skewed light streaks shooting across
//   4. Outgoing label falls / blurs out (the goodbye to the previous mode)
//   5. Direction-specific scene plate (BERNABÉU stamp going to football,
//      GG·LOAD-IN terminal going to gaming) — this IS the welcome to the
//      new mode; we used to render a separate dimmed incoming label here
//      too, but it sat on top of the scene and obscured it.
//
// Mounted globally by <ModeFlipProvider>. Rendered conditionally on
// `transition` — keyed by nonce so a fresh DOM is created each flip,
// which restarts the CSS animations cleanly.
export const ModeFlipOverlay = ({ transition }: Props) => {
  // Always call hooks at the top — early return after.
  const { themeKey } = useGamingTheme();
  if (!transition) return null;
  const { from, to, nonce } = transition;
  // The flip overlay paints in both modes' colors. Gaming side renders
  // in the active theme so the cinematic transition stays consistent
  // with what the user sees on either side of the flip.
  const fromP = getPalette(from, themeKey);
  const toP = getPalette(to, themeKey);

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

      {/* Direction-specific themed scene — the part that turns this flip
          into a tiny show. Lands after the wipe finishes, holds, then
          fades. The themed scene IS the welcome to the new mode — we
          intentionally do NOT render the giant rising label on top of
          it; that label was redundant and obscured the stamp. */}
      {to === 'football' ? <FootballScene paint={toP} /> : <GamingScene paint={toP} />}
    </div>
  );
};

// ── Scene plates ────────────────────────────────────────────────────────

interface SceneProps {
  paint: ReturnType<typeof getPalette>;
}

// Football scene — two spotlight cones drop from the top corners and a
// "WELCOME TO THE BERNABÉU" stamp smacks in with a slight rotation,
// finishing just before the overlay clears.
const FootballScene = ({ paint }: SceneProps) => (
  <>
    {/* Spotlight cones — top-left and top-right */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '-10%',
        width: '60%',
        height: '110%',
        background: `linear-gradient(155deg, ${paint.accent}cc 0%, ${paint.accent}66 22%, transparent 60%)`,
        transformOrigin: 'top center',
        transform: 'translateY(-80%) scaleY(0.4)',
        animation: 'tb-spotlight-drop .55s cubic-bezier(.3,1.4,.4,1) .25s both',
        mixBlendMode: 'screen',
        opacity: 0
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: '-10%',
        width: '60%',
        height: '110%',
        background: `linear-gradient(-155deg, ${paint.accent}cc 0%, ${paint.accent}66 22%, transparent 60%)`,
        transformOrigin: 'top center',
        transform: 'translateY(-80%) scaleY(0.4)',
        animation: 'tb-spotlight-drop .55s cubic-bezier(.3,1.4,.4,1) .32s both',
        mixBlendMode: 'screen',
        opacity: 0
      }}
    />

    {/* WELCOME TO THE BERNABÉU stamp. z-index lifts it above the slab
        + flash + streaks so nothing can paint over it mid-flip. */}
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 10,
        animation:
          'tb-stamp-in .42s cubic-bezier(.3,1.6,.4,1) .42s both, tb-stamp-out .2s ease-out .82s forwards',
        opacity: 0,
        textAlign: 'center',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 'clamp(12px, 1.6vw, 16px)',
          letterSpacing: 5,
          color: paint.accent,
          marginBottom: 8,
          textShadow: `0 0 10px ${paint.accent}`,
          textTransform: 'uppercase',
          fontWeight: 700
        }}
      >
        ✦ welcome to the ✦
      </div>
      <div
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(54px, 10vw, 150px)',
          letterSpacing: 6,
          color: '#ffffff',
          lineHeight: 0.95,
          textShadow: `0 0 32px ${paint.accent}, 0 4px 0 ${paint.accent2}cc, 0 10px 24px rgba(0,0,0,0.75)`,
          // Outline so the stamp reads on any background.
          WebkitTextStroke: `2px ${paint.accent2}`
        }}
      >
        BERNABÉU
      </div>
      <div
        style={{
          height: 3,
          margin: '10px auto 0',
          width: '70%',
          background: `linear-gradient(90deg, transparent, ${paint.accent}, transparent)`,
          boxShadow: `0 0 10px ${paint.accent}`
        }}
      />
    </div>
  </>
);

// Gaming scene — scanline grid pans across the screen and a faux
// terminal types "GG · LOAD-IN" out, with a blinking cursor.
const GamingScene = ({ paint }: SceneProps) => (
  <>
    {/* Scanline grid backplate */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, ${paint.accent}1a 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, ${paint.accent2}14 0 1px, transparent 1px 24px)`,
        backgroundSize: '24px 24px, 24px 24px',
        animation: 'tb-scanlines-pan 1.2s linear infinite, tb-flash-bright .55s ease-out .25s both',
        mixBlendMode: 'screen',
        opacity: 0
      }}
    />

    {/* Terminal plate. z-index lifts it above the slab + flash + streaks
        so nothing can paint over it mid-flip. */}
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 10,
        transform: 'translate(-50%, -50%)',
        padding: 'clamp(16px, 2.2vw, 26px) clamp(22px, 3.4vw, 42px)',
        background: 'rgba(0,0,0,0.85)',
        border: `2px solid ${paint.accent}`,
        borderRadius: 6,
        boxShadow: `0 0 44px ${paint.accent}80, inset 0 0 30px ${paint.accent2}33, 0 12px 30px rgba(0,0,0,0.7)`,
        animation:
          'tb-stamp-in .38s cubic-bezier(.3,1.6,.4,1) .42s both, tb-stamp-out .2s ease-out .82s forwards',
        opacity: 0,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 'clamp(10px, 1.2vw, 13px)',
          letterSpacing: 3,
          color: paint.accent2,
          marginBottom: 4,
          textTransform: 'uppercase',
          opacity: 0.7
        }}
      >
        // KHALIL.OPS · MODE LOAD
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 'clamp(22px, 4vw, 48px)',
          letterSpacing: 3,
          color: paint.accent,
          textShadow: `0 0 18px ${paint.accent}`,
          fontWeight: 700,
          whiteSpace: 'nowrap'
        }}
      >
        <span>{'>'}</span>
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            animation: 'tb-terminal-typeon .35s steps(12, end) .55s both'
          }}
        >
          GG · LOAD-IN
        </span>
        <span
          style={{
            display: 'inline-block',
            width: '0.55em',
            height: '0.9em',
            marginLeft: 2,
            background: paint.accent,
            boxShadow: `0 0 8px ${paint.accent}`,
            animation: 'tb-terminal-cursor .45s steps(1, end) infinite'
          }}
        />
      </div>
    </div>
  </>
);
