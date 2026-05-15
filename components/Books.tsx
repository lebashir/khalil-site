'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@/lib/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsHoverDevice } from '@/hooks/useIsHoverDevice';
import { useIsNarrow } from '@/hooks/useIsNarrow';
import { ParticleBurst } from './ModeToggleBanner/ParticleBurst';
import { SectionTitle } from './SectionTitle';
import { SectionAmbient } from './SectionAmbient';

interface Props {
  content: SiteContent;
}

// GSAP + ScrollTrigger is loaded dynamically because it touches `window`. We
// pin the section briefly while scrolling and scrub the cover-flap rotation to
// scroll progress so the user feels they are physically opening the book.

export const Books = ({ content }: Props) => {
  const reduced = useReducedMotion();
  const hover = useIsHoverDevice();
  const narrow = useIsNarrow();

  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [sparkleNonce, setSparkleNonce] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);

  // Cursor tilt for the book card on hover (overrides the idle sway while hovering).
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const scx = useSpring(cx, { stiffness: 130, damping: 16 });
  const scy = useSpring(cy, { stiffness: 130, damping: 16 });
  const rX = useTransform(scy, [-1, 1], [10, -10]);
  const rY = useTransform(scx, [-1, 1], [-22, -2]);

  const onMove = (e: React.MouseEvent) => {
    if (!hover || reduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    cx.set(Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1)));
    cy.set(Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1)));
  };
  const onLeave = () => {
    cx.set(0);
    cy.set(0);
  };
  const onEnter = () => {
    if (reduced) return;
    setSparkleNonce(n => n + 1);
    setShowSparkle(true);
  };

  // GSAP scroll-pinned book opening. Only on non-narrow, non-reduced.
  useEffect(() => {
    if (reduced || narrow) return;
    if (!sectionRef.current || !pinRef.current || !coverRef.current) return;

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'center 60%',
        end: '+=60%',
        pin: pinRef.current,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: self => {
          const t = self.progress; // 0..1 — closed → open → closed
          // Triangle wave: 0 → 1 → 0 across the pin range, so the book opens
          // and closes again as the user scrolls past.
          const wave = t < 0.5 ? t * 2 : (1 - t) * 2;
          const cover = coverRef.current;
          if (cover) {
            cover.style.transform = `perspective(1200px) rotateY(${wave * -160}deg)`;
          }
        }
      });

      cleanup = () => {
        trigger.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced, narrow]);

  if (!content.book.visible) return null;

  const tiltEnabled = hover && !reduced;

  return (
    <section ref={sectionRef} className="relative z-10 py-14">
      <SectionAmbient density={0.65} />
      <div className="relative z-10">
        <SectionTitle>My book</SectionTitle>
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-card-border bg-card p-8 backdrop-blur-md sm:grid-cols-[1fr_1.5fr] sm:p-10">
          {/* Pin target — the book stays put while the inner cover scrubs open. */}
          <div ref={pinRef} className="flex items-center justify-center">
            <motion.div
              ref={cardRef}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              onMouseEnter={onEnter}
              className="book-3d relative"
              style={{
                width: 'min(220px, 70vw)',
                aspectRatio: '2 / 3',
                perspective: '1200px',
                transformStyle: 'preserve-3d',
                ...(tiltEnabled ? { rotateX: rX, rotateY: rY } : null)
              }}
              initial={reduced ? false : { rotateX: -25, y: 40, opacity: 0 }}
              whileInView={reduced ? undefined : { rotateX: 0, y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 110, damping: 14, mass: 0.7 }}
              animate={
                tiltEnabled || reduced
                  ? undefined
                  : { rotateY: [-15, -10, -15], transition: { duration: 5, ease: 'easeInOut', repeat: Infinity } }
              }
            >
              {/* Inner pages — visible when the cover swings away. */}
              <div
                className="absolute inset-0 overflow-hidden rounded-r-xl rounded-l-sm bg-[#fff7e6] p-3 text-[10px] leading-tight text-[#2a1a08] shadow-[inset_-12px_0_20px_rgba(0,0,0,0.15)]"
                style={{
                  fontFamily: '"Comic Sans MS", "Marker Felt", cursive',
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent 0 18px, rgba(120,80,40,0.18) 18px 19px)'
                }}
                aria-hidden
              >
                <div className="mb-1 text-center text-[8px] font-bold uppercase tracking-widest text-[#8a4a10]">Ch. 1</div>
                <div className="space-y-1">
                  <div>One time at recess I scored a hat-trick and the goalie cried.</div>
                  <div>Then Grandma said "write it down!" and that's how this book started.</div>
                  <div className="text-[8px] italic">P.S. mom thinks it's cute.</div>
                </div>
                <svg className="absolute bottom-1 right-1 h-6 w-6" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ffd700" stroke="#8a4a10" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Front cover — pivots on its left edge to swing open. */}
              <div
                ref={coverRef}
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent-3)] p-5 text-center shadow-[-10px_20px_40px_rgba(0,0,0,0.4)]"
                style={{
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                <h3
                  className="font-display text-2xl leading-tight tracking-wide"
                  style={{ color: 'var(--bg-1)' }}
                >
                  {content.book.title}
                </h3>
                {/* Spine accent */}
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-xl bg-black/30"
                  aria-hidden
                />
              </div>

              {/* Hover sparkle burst around the book */}
              {showSparkle && (
                <div key={sparkleNonce} className="pointer-events-none absolute -inset-6">
                  <ParticleBurst
                    kind="gold-confetti"
                    originX={0.5}
                    originY={0.5}
                    durationMs={700}
                    particleCount={18}
                    onDone={() => setShowSparkle(false)}
                  />
                </div>
              )}
            </motion.div>
          </div>

          <BookInfo content={content} />
        </div>
      </div>
    </section>
  );
};

const BookInfo = ({ content }: Props) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3 className="mb-3 font-display text-2xl sm:text-3xl">{content.book.title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-text-dim sm:text-base">
        {content.book.description}
      </p>
      <span
        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-2)] px-5 py-2.5 font-display text-sm tracking-wide"
        style={{ color: 'var(--bg-1)' }}
      >
        <span aria-hidden>📖</span>
        <span>{content.book.status}</span>
      </span>
    </motion.div>
  );
};
