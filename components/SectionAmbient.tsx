'use client';

import { useMode } from '@/components/ModeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsNarrow } from '@/hooks/useIsNarrow';

// Lightweight DOM-based ambient drift for non-hero sections.
// One SVG per slot, slowly translating and rotating via CSS keyframes — much
// cheaper than a canvas particle system and produces the same "the section is
// alive" feel behind the content cards. Auto-quantity drops on narrow viewports.

const FOOTBALL_GLYPHS = [
  <svg key="ball" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="#fff" />
    <path d="M12 4l3 3-3 3-3-3z M4 14l3 3-2 3-3-3z M21 14l-3 3 2 3 3-3z" fill="#001233" opacity="0.85" />
  </svg>,
  <svg key="star" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ffd700" />
  </svg>,
  <svg key="diamond" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2l8 10-8 10-8-10z" fill="#ffffff" opacity="0.85" />
  </svg>
];

const GAMING_GLYPHS = [
  <svg key="ctrl" viewBox="0 0 24 24" aria-hidden>
    <path d="M6 9h2v2H6v2H4v-2H2V9h2V7h2v2zm14 5a2 2 0 100-4 2 2 0 000 4zm-3-3a2 2 0 11-4 0 2 2 0 014 0zm-7 9h12a4 4 0 004-4v-4a8 8 0 00-8-8H4a4 4 0 00-4 4v4a4 4 0 004 4h6z" fill="#00b8ff" />
  </svg>,
  <svg key="cube" viewBox="0 0 24 24" aria-hidden>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" fill="#b026ff" />
  </svg>,
  <svg key="star" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ff2bd6" />
  </svg>
];

interface Slot {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

const SLOTS: Slot[] = [
  { top: '10%', left: '4%',  size: 26, delay: 0.0, duration: 14, opacity: 0.45 },
  { top: '70%', left: '92%', size: 22, delay: 2.2, duration: 17, opacity: 0.4 },
  { top: '40%', left: '88%', size: 30, delay: 4.0, duration: 16, opacity: 0.3 },
  { top: '82%', left: '6%',  size: 24, delay: 1.5, duration: 19, opacity: 0.4 },
  { top: '22%', left: '78%', size: 18, delay: 3.1, duration: 13, opacity: 0.35 },
  { top: '55%', left: '14%', size: 28, delay: 0.8, duration: 22, opacity: 0.3 }
];

interface Props {
  /** density: 0..1 — multiplier on slot count for narrow / lower-end sections. */
  density?: number;
}

export const SectionAmbient = ({ density = 1 }: Props) => {
  const { mode } = useMode();
  const reduced = useReducedMotion();
  const narrow = useIsNarrow();

  if (reduced) return null;

  const glyphs = mode === 'football' ? FOOTBALL_GLYPHS : GAMING_GLYPHS;
  const slotsScaled = SLOTS.slice(0, Math.max(2, Math.floor(SLOTS.length * density * (narrow ? 0.6 : 1))));

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {slotsScaled.map((s, i) => {
        const glyphIdx = i % glyphs.length;
        const glyph = glyphs[glyphIdx];
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              filter: 'blur(0.5px)',
              animation: `section-drift ${s.duration}s ease-in-out ${s.delay}s infinite`
            }}
          >
            {glyph}
          </div>
        );
      })}
    </div>
  );
};
