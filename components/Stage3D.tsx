'use client';

import { motion, type MotionStyle } from 'framer-motion';
import { type ReactNode } from 'react';
import { MouseParallaxProvider } from '@/hooks/useMouseParallax';
import { useParallaxTransform } from '@/hooks/useParallaxTransform';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Outer perspective root: defines the camera. Has to wrap everything that should
// share the same vanishing point so all transforms compose to a single 3D space.
//
// We also apply a very subtle whole-page rotateY/rotateX (±2deg max) that follows
// the cursor — a touch of "the camera is in your hand" feel. Disabled on touch
// and when prefers-reduced-motion is on (the parallax provider returns 0 in those cases).
interface StageProps {
  children: ReactNode;
}

const StageTilt = ({ children }: StageProps) => {
  const reduced = useReducedMotion();
  const rotY = useParallaxTransform('x', 2);
  const rotX = useParallaxTransform('y', -1.2);

  const style: MotionStyle = reduced
    ? { transformStyle: 'preserve-3d' }
    : {
        transformStyle: 'preserve-3d',
        rotateY: rotY,
        rotateX: rotX,
        willChange: 'transform'
      };

  return (
    <motion.div className="stage3d-inner" style={style}>
      {children}
    </motion.div>
  );
};

export const Stage3D = ({ children }: StageProps) => (
  <MouseParallaxProvider>
    <div
      className="stage3d-root"
      style={{
        perspective: '1500px',
        perspectiveOrigin: '50% 35%',
        transformStyle: 'preserve-3d'
      }}
    >
      <StageTilt>{children}</StageTilt>
    </div>
  </MouseParallaxProvider>
);
