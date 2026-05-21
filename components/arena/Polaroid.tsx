'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Style for the OUTER positioning wrapper (top/left/width/height/zIndex). */
  style?: CSSProperties;
  tapeColor?: string;
  shadow?: boolean;
  /** Static rotation in degrees. Exposed as the --rot CSS var on the inner
   *  card so hover, pop, and fan-out animations compose with rotation
   *  rather than stripping it. */
  rotate?: number;
  /** Seconds offset on the k-bob keyframe so each card breathes out of
   *  phase with the others. */
  bobDelay?: number;
  /** Fan-out vector (px) — used by .k-polaroid-stack:hover. */
  spreadX?: number;
  spreadY?: number;
  /** Notified when the user pointer-downs a card — used by PolaroidStack
   *  to trigger the touch-only .fan-out timer alongside the tap-pop. */
  onTap?: () => void;
}

const POP_ANIMATION = 'k-polaroid-pop .55s cubic-bezier(.2,1.4,.4,1) both';

// Polaroid wrapper used by all three corkboard cards. Two-div architecture:
//
//   outer  ← bob animation lives here (translateY only — no rotation
//            collision, so the rotation is never stripped mid-animation)
//   inner  ← rotation (as --rot var), hover-lift, tap-pop, fan-out, tape
//            strips, paper background, children
//
// Why split: a CSS keyframe that animates `transform` fully replaces the
// element's static transform. If rotation + bob shared a transform, the
// card would un-tilt every time the bob ran. Separating concerns keeps
// the bob purely positional and lets the inner card own all its other
// motion through composable `translate`/`rotate`/`scale` longhand
// properties (browsers compose those automatically).
export const Polaroid = ({
  children,
  style,
  tapeColor = '#ffe48f',
  shadow = true,
  rotate = 0,
  bobDelay = 0,
  spreadX = 0,
  spreadY = 0,
  onTap
}: Props) => {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const triggerPop = () => {
    const el = innerRef.current;
    if (el) {
      // CSS animation-restart trick: blank the animation, force a reflow
      // read, then reapply. Without the read the browser coalesces both
      // writes and the animation doesn't re-trigger on rapid taps.
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = POP_ANIMATION;
    }
    if (onTap) onTap();
  };

  // Pull positional keys out of the consumer's style and hand them to
  // the outer wrapper. Everything else (background, padding overrides,
  // etc.) goes on the inner card so it composes with the paper styling.
  const {
    top,
    left,
    right,
    bottom,
    width,
    height,
    zIndex,
    transform: _ignoreTransform,
    ...innerOverrides
  } = style ?? {};

  return (
    <div
      className="k-polaroid-outer"
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width,
        height,
        zIndex,
        // Bob ONLY translates — rotation stays on the inner card.
        animation: `k-bob 4.6s ease-in-out ${bobDelay}s infinite`,
        // 3D-friendly container so any parent perspective (e.g. PolaroidStack's
        // hover-tilt) renders each card in space rather than flat.
        transformStyle: 'preserve-3d'
      }}
    >
      <div
        ref={innerRef}
        className="k-polaroid-card"
        onPointerDown={triggerPop}
        style={
          {
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#f3ede0',
            padding: 10,
            boxShadow: shadow
              ? '0 18px 38px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.3)'
              : 'none',
            // CSS custom properties consumed by .k-polaroid-card rules in
            // globals.css. Browser composes `rotate` + `translate` + `scale`
            // as separate properties so hover / fan / pop never collide.
            '--rot': `${rotate}deg`,
            '--spread-x': `${spreadX}px`,
            '--spread-y': `${spreadY}px`,
            cursor: 'pointer',
            ...innerOverrides
          } as CSSProperties
        }
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: -8,
            left: '12%',
            width: 44,
            height: 16,
            background: tapeColor,
            opacity: 0.85,
            transform: 'rotate(-6deg)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: -8,
            right: '12%',
            width: 44,
            height: 16,
            background: tapeColor,
            opacity: 0.85,
            transform: 'rotate(7deg)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        {children}
      </div>
    </div>
  );
};
