'use client';

import { useEffect, useRef, useState } from 'react';
import { ParticleBurst } from './ModeToggleBanner/ParticleBurst';
import { usePrefersReducedMotion } from './ModeToggleBanner/usePrefersReducedMotion';

const MAX_HEAD_TILT = 10; // degrees
const MAX_EYE_OFFSET = 2; // px (pupil shift inside the eye)

export const Character = () => {
  const prefersReduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [headRotate, setHeadRotate] = useState(0);
  const [eyeShift, setEyeShift] = useState({ x: 0, y: 0 });
  const [burstNonce, setBurstNonce] = useState(0); // bumps each click → remounts burst
  const [showBurst, setShowBurst] = useState(false);
  const [hoverHover, setHoverHover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHoverHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!hoverHover || prefersReduced) return;
    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = lastX - cx;
        const dy = lastY - cy;
        const angle = Math.atan2(dy, dx);
        // Map horizontal direction to head tilt within ±MAX_HEAD_TILT.
        const horizNorm = Math.max(-1, Math.min(1, dx / 500));
        setHeadRotate(horizNorm * MAX_HEAD_TILT);
        setEyeShift({
          x: Math.cos(angle) * MAX_EYE_OFFSET,
          y: Math.sin(angle) * MAX_EYE_OFFSET
        });
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hoverHover, prefersReduced]);

  const handleClick = () => {
    setBurstNonce(n => n + 1);
    setShowBurst(true);
  };

  return (
    <div
      ref={ref}
      // Height scales with the viewport on short landscape screens (clamped 240..480),
      // so the hero + character fit comfortably on an iPhone in landscape.
      className="relative flex w-full items-center justify-center"
      // Character scales between 200 (iPhone landscape, ~280h after browser chrome)
      // and 480 (desktop), defaulting to 50% of viewport height in between.
      style={{ height: 'clamp(200px, 50dvh, 480px)' }}
    >
      {/* Decorative rings + glow are sized in % of the wrapper, so they shrink with it. */}
      <div
        className="absolute aspect-square h-[92%] rounded-full border-2 border-dashed opacity-35 motion-safe:animate-spin-slow"
        style={{ borderColor: 'var(--accent)' }}
        aria-hidden
      />
      <div
        className="absolute aspect-square h-[112%] rounded-full border-2 border-dashed opacity-20 motion-safe:animate-spin-slow"
        style={{ borderColor: 'var(--accent-3)', animationDirection: 'reverse', animationDuration: '30s' }}
        aria-hidden
      />
      <div
        className="absolute aspect-square h-[78%] rounded-full motion-safe:animate-pulse"
        style={{
          background: 'radial-gradient(circle, var(--accent-2) 0%, transparent 65%)',
          opacity: 0.35,
          filter: 'blur(40px)'
        }}
        aria-hidden
      />

      {/* Character SVG — the SVG inherits the wrapper's height via the button's style. */}
      <button
        type="button"
        onClick={handleClick}
        aria-label="Wave at Khalil"
        className="character relative z-10 cursor-pointer motion-safe:animate-idle focus-visible:outline-none"
        style={{ height: '88%' }}
      >
        <svg
          viewBox="0 0 300 400"
          height="100%"
          width="auto"
          className="drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
          style={{ transformOrigin: '150px 200px' }}
        >
          {/* Head group — rotates toward cursor */}
          <g
            style={{
              transform: `rotate(${headRotate}deg)`,
              transformOrigin: '150px 130px',
              transition: 'transform 0.25s ease-out'
            }}
          >
            {/* Head */}
            <ellipse cx="150" cy="105" rx="48" ry="55" fill="#f4c8a0" />
            {/* Hair */}
            <path d="M102 95 Q105 50 150 48 Q195 50 198 95 Q198 75 175 70 Q150 60 125 70 Q102 75 102 95" fill="#2a1a08" />
            {/* Ears */}
            <ellipse cx="100" cy="110" rx="9" ry="14" fill="#f4c8a0" />
            <ellipse cx="200" cy="110" rx="9" ry="14" fill="#f4c8a0" />
            {/* Eyes (whites) */}
            <ellipse cx="132" cy="108" rx="6" ry="7" fill="#1a1a1a" />
            <ellipse cx="168" cy="108" rx="6" ry="7" fill="#1a1a1a" />
            {/* Pupils (offset toward cursor) */}
            <circle cx={134 + eyeShift.x} cy={106 + eyeShift.y} r="2" fill="white" />
            <circle cx={170 + eyeShift.x} cy={106 + eyeShift.y} r="2" fill="white" />
            {/* Smile */}
            <path d="M132 130 Q150 145 168 130" stroke="#5a2a10" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Headset (gaming) */}
            <g className="headset">
              <path d="M95 90 Q95 55 150 55 Q205 55 205 90" stroke="#1a1a2e" strokeWidth="8" fill="none" />
              <rect x="86" y="88" width="18" height="32" rx="6" fill="#1a1a2e" />
              <rect x="196" y="88" width="18" height="32" rx="6" fill="#1a1a2e" />
              <rect x="86" y="95" width="18" height="6" fill="#00b8ff" />
              <rect x="196" y="95" width="18" height="6" fill="#00b8ff" />
              <path d="M100 118 Q110 145 135 152" stroke="#1a1a2e" strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle cx="138" cy="153" r="6" fill="#b026ff" />
            </g>
          </g>

          {/* Body / Jersey */}
          <path className="jersey" d="M85 175 Q150 160 215 175 L235 320 Q150 340 65 320 Z" fill="#00b8ff" />
          <path className="jersey" d="M65 175 L40 280 L72 295 L92 195 Z" fill="#00b8ff" />
          <path className="jersey" d="M235 175 L260 280 L228 295 L208 195 Z" fill="#00b8ff" />
          <path className="jersey-accent" d="M110 175 Q150 168 190 175 L195 195 Q150 188 105 195 Z" fill="#b026ff" />

          {/* Crest (football) */}
          <g className="crest">
            <circle cx="110" cy="220" r="16" fill="#ffd700" />
            <text x="110" y="227" textAnchor="middle" fontSize="18" fontWeight="800" fill="#001233" fontFamily="Russo One, sans-serif">RM</text>
          </g>

          {/* Jersey number (football) */}
          <g className="jersey-number">
            <text x="150" y="280" textAnchor="middle" fontSize="80" fontWeight="900" fill="#ffd700" fontFamily="Russo One, sans-serif">7</text>
          </g>

          {/* Hoodie strings (gaming) */}
          <g className="hoodie-strings">
            <path d="M140 170 L138 215" stroke="#b026ff" strokeWidth="4" strokeLinecap="round" />
            <path d="M160 170 L162 215" stroke="#b026ff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="138" cy="218" r="4" fill="#b026ff" />
            <circle cx="162" cy="218" r="4" fill="#b026ff" />
          </g>

          {/* Neck */}
          <rect x="135" y="155" width="30" height="22" fill="#e0b48c" />

          {/* Arms */}
          <ellipse cx="55" cy="285" rx="14" ry="20" fill="#f4c8a0" />
          <ellipse cx="245" cy="285" rx="14" ry="20" fill="#f4c8a0" />
        </svg>
      </button>

      {/* Click sparkle reaction */}
      {showBurst && (
        <div key={burstNonce} className="pointer-events-none absolute inset-0">
          <ParticleBurst
            kind="gold-confetti"
            originX={0.5}
            originY={0.45}
            durationMs={700}
            particleCount={40}
            onDone={() => setShowBurst(false)}
          />
        </div>
      )}
    </div>
  );
};
