'use client';

import { motion, useTransform, type MotionStyle } from 'framer-motion';
import { useRef } from 'react';
import { useMode } from '@/components/ModeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSectionScroll } from '@/hooks/useSectionScroll';
import type { SiteContent } from '@/lib/content';
import { FootballEnvironment } from './FootballEnvironment';
import { GamingEnvironment } from './GamingEnvironment';
import { HeroCharacter } from './HeroCharacter';
import { HeroCopy } from './HeroCopy';

interface Props {
  content: SiteContent;
}

// The hero scroll behavior is overridden from the section-stage default: as you
// scroll out of the hero we want a stronger "camera moving up and past" feel,
// not a simple recede. tilts back to 8deg and recedes ~150px.
export const Hero = ({ content }: Props) => {
  const ref = useRef<HTMLElement>(null);
  const { mode } = useMode();
  const reduced = useReducedMotion();

  const scroll = useSectionScroll(ref);
  const heroRotateX = useTransform(scroll.progress, [0.45, 1], [0, 8]);
  const heroTranslateZ = useTransform(scroll.progress, [0.45, 1], [0, -150]);
  const heroOpacity = useTransform(scroll.progress, [0.45, 0.9, 1], [1, 0.85, 0.7]);

  const style: MotionStyle = reduced
    ? { minHeight: 'calc(100dvh - 88px)' }
    : {
        transformStyle: 'preserve-3d',
        rotateX: heroRotateX,
        translateZ: heroTranslateZ,
        opacity: heroOpacity,
        minHeight: 'calc(100dvh - 88px)',
        willChange: 'transform, opacity'
      };

  return (
    <motion.section
      ref={ref}
      aria-label="Khalil the Goat hero"
      className="hero-scene relative w-full"
      style={style}
    >
      {/* Both environments mount so the takeover overlay can crossfade between them
          and the character / copy don't unmount during a mode switch. Opacity is
          driven by `active`; the inactive one is invisible but stays composited. */}
      <FootballEnvironment active={mode === 'football'} />
      <GamingEnvironment active={mode === 'gaming'} />

      <HeroCharacter />
      <HeroCopy content={content} />
    </motion.section>
  );
};
