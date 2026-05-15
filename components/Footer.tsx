'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { SiteContent } from '@/lib/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ParticleBurst } from './ModeToggleBanner/ParticleBurst';
import { SectionAmbient } from './SectionAmbient';

interface Props {
  content: SiteContent;
}

interface SocialIconProps {
  href: string;
  label: string;
  glyph: string;
  tint: string;
}

const SocialIcon = ({ href, label, glyph, tint }: SocialIconProps) => {
  const reduced = useReducedMotion();
  const [burstNonce, setBurstNonce] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  const fire = () => {
    if (reduced) return;
    setBurstNonce(n => n + 1);
    setShowBurst(true);
  };

  if (!href) {
    return (
      <span
        className="relative flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border border-card-border bg-white/5 text-sm font-extrabold text-text-dim/70"
        title={`${label} link coming soon`}
        aria-label={`${label} link not set yet`}
      >
        {glyph}
      </span>
    );
  }

  return (
    <div className="relative">
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={fire}
        className="relative flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-text"
        style={{
          background: `linear-gradient(145deg, ${tint}33, rgba(255,255,255,0.04))`,
          boxShadow:
            '0 8px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -3px 8px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.12)'
        }}
        whileHover={
          reduced
            ? undefined
            : {
                y: -4,
                scale: 1.08,
                boxShadow:
                  '0 14px 26px rgba(0,0,0,0.4), 0 0 24px ' + tint + ', inset 0 1px 0 rgba(255,255,255,0.25)'
              }
        }
        whileTap={reduced ? undefined : { scale: 0.95, y: -1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      >
        {glyph}
      </motion.a>
      {showBurst && (
        <div key={burstNonce} className="pointer-events-none absolute -inset-8">
          <ParticleBurst
            kind="neon-shards"
            originX={0.5}
            originY={0.5}
            durationMs={700}
            particleCount={22}
            onDone={() => setShowBurst(false)}
          />
        </div>
      )}
    </div>
  );
};

export const Footer = ({ content }: Props) => {
  const reduced = useReducedMotion();
  return (
    <footer className="relative z-10 mt-10 overflow-hidden border-t border-card-border px-5 py-12 text-center text-xs text-text-dim">
      <SectionAmbient density={0.55} />
      <div className="relative z-10">
        <div className="mb-4 flex justify-center gap-4">
          <SocialIcon href="https://www.youtube.com/@khalilgaming2020" label="YouTube" glyph="YT" tint="#ff2d2d" />
          <SocialIcon href={content.socials.tiktok} label="TikTok" glyph="TT" tint="#00f2ea" />
          <SocialIcon href={content.socials.instagram} label="Instagram" glyph="IG" tint="#e1306c" />
        </div>
        <span className="inline-flex items-center gap-1">
          Made with
          <motion.span
            aria-hidden
            className="inline-block"
            animate={reduced ? {} : { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            💙
          </motion.span>
          for Khalil
        </span>
      </div>
    </footer>
  );
};
