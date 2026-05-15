'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  children: React.ReactNode;
}

// Section heading with a recurring shimmer that travels across the title every
// ~6 seconds — rare enough to feel like a flourish, not constant noise.
export const SectionTitle = ({ children }: Props) => {
  const reduced = useReducedMotion();
  return (
    <h2 className="relative mb-7 flex items-center gap-3 font-display text-3xl tracking-wide text-text sm:text-4xl">
      <motion.span
        className="inline-block h-3 w-3 rounded-full bg-[var(--accent-2)]"
        style={{ boxShadow: 'var(--glow)' }}
        animate={reduced ? {} : { scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
        aria-hidden
      />
      <span className="relative overflow-hidden">
        <span className="relative z-10">{children}</span>
        {!reduced && (
          <motion.span
            className="pointer-events-none absolute inset-y-0 left-0 z-20"
            style={{
              width: '40%',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
              mixBlendMode: 'overlay'
            }}
            animate={{ x: ['-120%', '320%'] }}
            transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5 }}
            aria-hidden
          />
        )}
      </span>
    </h2>
  );
};
