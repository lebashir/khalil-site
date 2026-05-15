'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useMemo } from 'react';
import type { SiteContent } from '@/lib/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsHoverDevice } from '@/hooks/useIsHoverDevice';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';

interface Props {
  content: SiteContent;
}

// Splits a paragraph into rendered word spans with the same *bold* shorthand
// support as the v1 renderBold helper. Each word gets its own span so we can
// stagger them in on scroll.
interface WordToken {
  text: string;
  bold: boolean;
}

const tokenize = (raw: string): WordToken[] => {
  // *bold* segments: split on asterisks, alternating non-bold/bold.
  const segments = raw.split(/(\*[^*]+\*)/g).filter(Boolean);
  const out: WordToken[] = [];
  for (const seg of segments) {
    const bold = seg.startsWith('*') && seg.endsWith('*');
    const text = bold ? seg.slice(1, -1) : seg;
    const words = text.split(/(\s+)/);
    for (const w of words) {
      if (w.length === 0) continue;
      out.push({ text: w, bold });
    }
  }
  return out;
};

interface RevealParagraphProps {
  text: string;
  baseDelay: number;
}

const RevealParagraph = ({ text, baseDelay }: RevealParagraphProps) => {
  const reduced = useReducedMotion();
  const tokens = useMemo(() => tokenize(text), [text]);

  if (reduced) {
    return (
      <p className="text-base leading-[1.8] text-text sm:text-lg">
        {tokens.map((t, i) =>
          t.bold ? <strong key={i}>{t.text}</strong> : <span key={i}>{t.text}</span>
        )}
      </p>
    );
  }

  return (
    <p className="text-base leading-[1.8] text-text sm:text-lg">
      {tokens.map((t, i) => {
        if (/^\s+$/.test(t.text)) return <span key={i}>{t.text}</span>;
        const inner = t.bold ? <strong>{t.text}</strong> : t.text;
        return (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: baseDelay + i * 0.018, ease: [0.22, 1, 0.36, 1] }}
          >
            {inner}
          </motion.span>
        );
      })}
    </p>
  );
};

export const About = ({ content }: Props) => {
  const reduced = useReducedMotion();
  const hover = useIsHoverDevice();
  const ref = useRef<HTMLDivElement | null>(null);

  // Cursor tilt for the card on hover-pointer devices.
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const scx = useSpring(cx, { stiffness: 120, damping: 16 });
  const scy = useSpring(cy, { stiffness: 120, damping: 16 });
  const rX = useTransform(scy, [-1, 1], [5, -5]);
  const rY = useTransform(scx, [-1, 1], [-5, 5]);

  const onMove = (e: React.MouseEvent) => {
    if (!hover || reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    cx.set(Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1)));
    cy.set(Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1)));
  };
  const onLeave = () => {
    cx.set(0);
    cy.set(0);
  };

  const tiltEnabled = hover && !reduced;

  return (
    <section className="relative z-10 py-14">
      <SectionAmbient density={0.7} />
      <div className="relative z-10">
        <SectionTitle>About me</SectionTitle>
        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="card-3d relative overflow-hidden rounded-3xl border border-card-border bg-card p-8 backdrop-blur-md sm:p-10"
          style={
            tiltEnabled
              ? { rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d', transformPerspective: 900 }
              : undefined
          }
          initial={reduced ? false : { opacity: 0, rotateY: -12, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, rotateY: 0, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 100, damping: 16 }}
        >
          {/* Ambient glow pulse behind the card content. */}
          {!reduced && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, var(--accent-2) 0%, transparent 55%)',
                mixBlendMode: 'screen'
              }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
              aria-hidden
            />
          )}
          <div className="relative">
            <div className="mb-4">
              <RevealParagraph text={content.about.paragraph1} baseDelay={0.1} />
            </div>
            <RevealParagraph text={content.about.paragraph2} baseDelay={0.4} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
