'use client';

import Link from 'next/link';
import { useMode } from '@/components/ModeProvider';
import type { SiteContent } from '@/lib/content';
import { Character } from './Character';

interface Props {
  content: SiteContent;
}

export const Hero = ({ content }: Props) => {
  const { mode } = useMode();
  const copy = content.hero[mode];

  return (
    // Short landscape viewports (iPhone in landscape ≈ 375h) cut py-* and the headline
    // size so the hero + character fit above the fold.
    <section className="grid grid-cols-1 items-center gap-6 py-8 md:grid-cols-2 md:gap-8 md:py-20 [@media(max-height:600px)]:py-4 [@media(max-height:600px)]:gap-4">
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-text-dim sm:text-sm">
          {copy.tagline}
        </div>
        <h1
          // text-7xl (72px) overflows the half-width hero column at iPad portrait (768w → ~340px column).
          // Keep 6xl through md, only jump up at lg+ where the column is wider.
          className="mb-4 font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl lg:text-7xl xl:text-8xl [@media(max-height:600px)]:text-4xl"
          style={{ textShadow: 'var(--glow)' }}
        >
          KHALIL
          <span className="block text-[var(--accent-2)]">THE GOAT</span>
        </h1>
        <p className="mb-7 max-w-md text-base leading-relaxed text-text-dim sm:text-lg [@media(max-height:600px)]:mb-4 [@media(max-height:600px)]:text-sm">
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
          <Link
            href="#videos"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[var(--accent)] bg-transparent px-6 py-3 font-display text-sm tracking-wide text-white transition-colors duration-300 hover:bg-white/10"
          >
            Watch latest
          </Link>
        </div>
      </div>

      <div className="flex justify-center md:justify-end">
        <Character />
      </div>
    </section>
  );
};
