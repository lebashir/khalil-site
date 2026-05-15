'use client';

import Link from 'next/link';
import { motion, type MotionStyle } from 'framer-motion';
import { useMode } from '@/components/ModeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useParallaxTransform } from '@/hooks/useParallaxTransform';
import type { SiteContent } from '@/lib/content';

interface Props {
  content: SiteContent;
}

// Headline + bio + CTAs on the near-camera layer (translateZ +120). Sits in
// front of the entire scene with a soft drop-shadow so it stays readable over
// the busiest part of either environment.
export const HeroCopy = ({ content }: Props) => {
  const { mode } = useMode();
  const reduced = useReducedMotion();
  const copy = content.hero[mode];

  // Near-camera layer gets the strongest parallax response — feels closest to the user.
  const px = useParallaxTransform('x', 25);
  const py = useParallaxTransform('y', 15);

  const wrapperStyle: MotionStyle = reduced
    ? { transform: 'translateZ(120px)' }
    : { x: px, y: py, translateZ: 120 };

  return (
    <motion.div
      className="hero-copy pointer-events-auto absolute inset-x-0 top-0 z-30 flex flex-col items-center px-5 pt-10 text-center sm:px-8 md:items-start md:pt-16 md:text-left"
      style={wrapperStyle}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[640px] md:max-w-[520px]"
      >
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.45em] text-text-dim sm:text-xs md:text-sm">
          {copy.tagline}
        </div>
        <h1
          className="mb-3 font-display text-5xl leading-[0.92] tracking-wide text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-[112px]"
          style={{
            textShadow:
              '0 4px 20px rgba(0,0,0,0.55), 0 0 32px rgba(0,0,0,0.4), var(--glow)'
          }}
        >
          KHALIL
          <span className="block text-[var(--accent-2)]">THE GOAT</span>
        </h1>
        <p
          className="mb-6 max-w-md text-sm leading-relaxed text-text sm:text-base md:text-lg"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
        >
          {copy.bio}
        </p>
        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
          <a
            href="https://www.youtube.com/@khalilgaming2020"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent-2)] px-6 py-3 font-display text-sm tracking-wide shadow-glow transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03]"
            style={{ color: mode === 'football' ? '#001233' : '#0a0420' }}
          >
            ▶ Subscribe
          </a>
          <Link
            href="#videos"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[var(--accent)] bg-black/20 px-6 py-3 font-display text-sm tracking-wide text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
          >
            Watch latest
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};
