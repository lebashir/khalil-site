'use client';

import { motion, type MotionStyle } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useParallaxTransform } from '@/hooks/useParallaxTransform';
import { Character } from '../Character';

// Places the existing SVG Character in the hero's foreground layer with the same
// parallax behavior as the foreground environmental objects. The character is
// rendered once on the page and its outfit swap is handled by CSS class on <html>.
export const HeroCharacter = () => {
  const reduced = useReducedMotion();
  const fgX = useParallaxTransform('x', 28);
  const fgY = useParallaxTransform('y', 18);

  const style: MotionStyle = reduced
    ? { transform: 'translateZ(60px)' }
    : { x: fgX, y: fgY, translateZ: 60 };

  return (
    <motion.div
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex justify-center"
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        // Slightly above the turf/desk surface so the character "stands on" the foreground.
        paddingBottom: 'clamp(40px, 8dvh, 90px)'
      }}
    >
      <div className="w-[260px] sm:w-[320px] md:w-[360px] lg:w-[400px]">
        <Character />
      </div>
    </motion.div>
  );
};
