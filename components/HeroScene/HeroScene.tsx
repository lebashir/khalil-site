'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMode } from '@/components/ModeProvider';
import type { Mode, SiteContent } from '@/lib/content';
import { usePrefersReducedMotion } from '@/components/ModeToggleBanner/usePrefersReducedMotion';
import { ParticleBurst } from '@/components/ModeToggleBanner/ParticleBurst';
import { SwipeHint, dismissSwipeHint } from './SwipeHint';

// R3F doesn't render server-side; lazy-load the Canvas.
const Scene = dynamic(() => import('./Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => null
});

interface Props {
  content: SiteContent;
}

const useIsNarrow = (): boolean => {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 880px)');
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return narrow;
};

const useInView = (ref: React.RefObject<HTMLElement | null>): boolean => {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
};

const useScrollProgress = (ref: React.RefObject<HTMLElement | null>): number => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const h = node.offsetHeight || 1;
      // 0 at top of hero in view, 1 when hero is scrolled completely up.
      const p = Math.max(0, Math.min(1, -rect.top / h));
      setProgress(p);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return progress;
};

const SWIPE_THRESHOLD = 60;

export const HeroScene = ({ content }: Props) => {
  const { mode, setMode } = useMode();
  const reducedMotion = usePrefersReducedMotion();
  const narrow = useIsNarrow();
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef);
  const scrollProgress = useScrollProgress(sectionRef);

  const copy = content.hero[mode];

  // Takeover state — direction of in-flight scene transition.
  const [takeover, setTakeover] = useState<'g2f' | 'f2g' | null>(null);
  const prevMode = useRef<Mode>(mode);

  // Confetti DOM overlay on f-finale.
  const [burstNonce, setBurstNonce] = useState(0);
  const [showCharacterBurst, setShowCharacterBurst] = useState(false);
  const [showFinaleBurst, setShowFinaleBurst] = useState(false);

  useEffect(() => {
    if (mode === prevMode.current) return;
    const dir = prevMode.current === 'gaming' ? 'g2f' : 'f2g';
    prevMode.current = mode;
    setTakeover(dir);
    // Schedule confetti finale ~70% through f-direction takeover.
    if (dir === 'g2f') {
      const totalMs = reducedMotion ? 250 : narrow ? 1000 : 1500;
      window.setTimeout(() => {
        setBurstNonce((n) => n + 1);
        setShowFinaleBurst(true);
      }, totalMs * 0.72);
    }
  }, [mode, reducedMotion, narrow]);

  const onTakeoverDone = useCallback(() => {
    setTakeover(null);
  }, []);

  const onCharacterClick = useCallback(() => {
    setBurstNonce((n) => n + 1);
    setShowCharacterBurst(true);
  }, []);

  // Swipe handler — horizontal swipe toggles mode.
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touch.current = { x: t.clientX, y: t.clientY, t: performance.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (takeover !== null) return;
    const target: Mode = dx < 0 ? 'football' : 'gaming';
    if (target !== mode) {
      dismissSwipeHint();
      setMode(target);
    }
  };

  // Resolve hero height — taller on viewports that can take it.
  const heroHeight = useMemo(
    () => 'clamp(560px, 86dvh, 820px)',
    []
  );

  return (
    <section
      ref={sectionRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative isolate overflow-hidden"
      style={{ height: heroHeight }}
      aria-label="Hero — meet Khalil"
    >
      {/* The R3F canvas fills the section behind the copy. */}
      <div className="absolute inset-0" aria-hidden>
        {inView && (
          <Scene
            mode={mode}
            reducedMotion={reducedMotion}
            narrow={narrow}
            onCharacterClick={onCharacterClick}
            takeover={takeover}
            onTakeoverDone={onTakeoverDone}
            scrollProgress={scrollProgress}
          />
        )}
      </div>

      {/* Mode-tinted vignette gradient to keep copy readable over the scene. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            mode === 'football'
              ? 'linear-gradient(180deg, rgba(0,10,40,0.55) 0%, rgba(0,10,40,0.0) 35%, rgba(0,10,40,0.55) 100%), linear-gradient(90deg, rgba(0,10,40,0.65) 0%, rgba(0,10,40,0.0) 50%)'
              : 'linear-gradient(180deg, rgba(10,4,32,0.55) 0%, rgba(10,4,32,0.0) 35%, rgba(10,4,32,0.55) 100%), linear-gradient(90deg, rgba(10,4,32,0.65) 0%, rgba(10,4,32,0.0) 50%)'
        }}
        aria-hidden
      />

      {/* Copy overlay — left-aligned, pointer-events propagate to the CTAs only. */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col justify-center px-4 sm:px-8">
        <div className="max-w-xl">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-text-dim sm:text-sm">
            {copy.tagline}
          </div>
          <h1
            className="mb-4 font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl lg:text-7xl xl:text-8xl"
            style={{ textShadow: 'var(--glow), 0 4px 24px rgba(0,0,0,0.6)' }}
          >
            KHALIL
            <span className="block text-[var(--accent-2)]">THE GOAT</span>
          </h1>
          <p
            className="mb-7 max-w-md text-base leading-relaxed text-white/90 sm:text-lg"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
          >
            {copy.bio}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.youtube.com/@khalilgaming2020"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent-2)] px-6 py-3 font-display text-sm tracking-wide text-[#0a0420] shadow-glow transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03]"
              style={{ color: mode === 'football' ? '#001233' : '#0a0420' }}
            >
              ▶ Subscribe
            </a>
            <a
              href="#videos"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[var(--accent)] bg-transparent px-6 py-3 font-display text-sm tracking-wide text-white transition-colors duration-300 hover:bg-white/10"
            >
              Watch latest
            </a>
          </div>
        </div>
      </div>

      {/* Click-on-character confetti */}
      {showCharacterBurst && (
        <div key={`char-${burstNonce}`} className="pointer-events-none absolute inset-0 z-20">
          <ParticleBurst
            kind="gold-confetti"
            originX={0.5}
            originY={0.45}
            durationMs={700}
            particleCount={40}
            onDone={() => setShowCharacterBurst(false)}
          />
        </div>
      )}

      {/* G→F takeover finale confetti */}
      {showFinaleBurst && (
        <div key={`fin-${burstNonce}`} className="pointer-events-none absolute inset-0 z-20">
          <ParticleBurst
            kind="gold-confetti"
            originX={0.5}
            originY={0.5}
            durationMs={900}
            particleCount={narrow ? 50 : 90}
            onDone={() => setShowFinaleBurst(false)}
          />
        </div>
      )}

      {/* Mobile swipe hint */}
      <SwipeHint visible={inView} onDismiss={() => { /* persisted in localStorage */ }} />
    </section>
  );
};
