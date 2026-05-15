'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import type { SiteContent } from '@/lib/content';

interface Props {
  content: SiteContent;
}

export const Books = ({ content }: Props) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const pagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!content.book.visible) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const cover = coverRef.current;
    const section = sectionRef.current;
    if (!cover || !section) return;

    const ctx = gsap.context(() => {
      gsap.set(cover, { rotateY: -18, transformOrigin: 'left center' });
      gsap.set(pagesRef.current, { rotateY: -8, transformOrigin: 'left center' });

      gsap.to(cover, {
        rotateY: -135,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 30%',
          scrub: 0.6
        }
      });

      gsap.to(pagesRef.current, {
        rotateY: -3,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 30%',
          scrub: 0.6
        }
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [content.book.visible]);

  if (!content.book.visible) return null;

  return (
    <section ref={sectionRef} className="relative z-10 py-14">
      <h2 className="mb-7 flex items-center gap-3 font-display text-3xl tracking-wide text-text sm:text-4xl">
        <span
          className="inline-block h-3 w-3 rounded-full bg-[var(--accent-2)] motion-safe:animate-pulse"
          style={{ boxShadow: 'var(--glow)' }}
          aria-hidden
        />
        My book
      </h2>
      <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-card-border bg-card p-8 backdrop-blur-md sm:grid-cols-[1fr_1.5fr] sm:p-10">
        <div
          className="relative mx-auto aspect-[2/3] w-full max-w-[220px]"
          style={{ perspective: '1200px' }}
        >
          {/* Pages spread behind the cover */}
          <div
            ref={pagesRef}
            className="absolute inset-0 rounded-r-xl bg-gradient-to-br from-white to-[#f5f0e1] shadow-[10px_10px_30px_rgba(0,0,0,0.3)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-4 flex flex-col justify-end gap-1.5">
              <span className="h-1.5 w-3/4 rounded-full bg-[var(--bg-1)]/15" />
              <span className="h-1.5 w-5/6 rounded-full bg-[var(--bg-1)]/15" />
              <span className="h-1.5 w-2/3 rounded-full bg-[var(--bg-1)]/15" />
            </div>
          </div>

          {/* The cover itself */}
          <div
            ref={coverRef}
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent-3)] p-5 text-center shadow-[-10px_20px_40px_rgba(0,0,0,0.4)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h3
              className="font-display text-2xl leading-tight tracking-wide"
              style={{ color: 'var(--bg-1)' }}
            >
              {content.book.title}
            </h3>
          </div>
        </div>

        <div>
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
        </div>
      </div>
    </section>
  );
};
