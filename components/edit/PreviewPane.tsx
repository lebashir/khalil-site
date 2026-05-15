'use client';

import { useState } from 'react';
import type { Mode, SiteContent } from '@/lib/content';
import { renderBold } from '@/lib/bold';

interface Props {
  content: SiteContent;
}

// Self-contained mini-site preview. Renders inside a .preview-scope wrapper so
// CSS variables resolve from the chosen mode without affecting the rest of /edit.
export const PreviewPane = ({ content }: Props) => {
  const [mode, setMode] = useState<Mode>(content.defaultMode);
  const hero = content.hero[mode];

  return (
    <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs uppercase tracking-widest text-white/60">Live preview</span>
        <div className="flex gap-1 rounded-full border border-white/10 bg-black/40 p-1 text-xs">
          {(['gaming', 'football'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1 capitalize transition-colors ${
                mode === m
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className={`preview-scope ${mode} p-4`}>
        {/* Hero */}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-text-dim">
            {hero.tagline || <span className="italic opacity-60">(no tagline yet)</span>}
          </div>
          <div className="mb-2 font-display text-2xl leading-tight text-white" style={{ textShadow: 'var(--glow)' }}>
            KHALIL
            <span className="block text-[var(--accent-2)]">THE GOAT</span>
          </div>
          <p className="text-sm leading-relaxed text-text-dim">
            {hero.bio || <span className="italic opacity-60">(no bio yet)</span>}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--accent-2)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--bg-1)' }}>
              ▶ Subscribe
            </span>
            <span className="rounded-full border-2 border-[var(--accent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Watch latest
            </span>
          </div>
        </div>

        {/* About */}
        <div className="mt-4 rounded-xl border border-card-border bg-card p-5">
          <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-text-dim">About me</div>
          <p className="mb-2 text-xs leading-relaxed text-text">
            {content.about.paragraph1 ? renderBold(content.about.paragraph1) : <span className="italic opacity-60">(empty)</span>}
          </p>
          <p className="text-xs leading-relaxed text-text">
            {content.about.paragraph2 ? renderBold(content.about.paragraph2) : <span className="italic opacity-60">(empty)</span>}
          </p>
        </div>

        {/* Book */}
        {content.book.visible && (
          <div className="mt-4 rounded-xl border border-card-border bg-card p-5">
            <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-text-dim">My book</div>
            <div className="font-display text-lg">{content.book.title || <span className="italic opacity-60">(no title)</span>}</div>
            <p className="my-2 text-xs leading-relaxed text-text-dim">
              {content.book.description || <span className="italic opacity-60">(no description)</span>}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-2)] px-3 py-1 text-[10px] font-bold tracking-wide" style={{ color: 'var(--bg-1)' }}>
              <span aria-hidden>📖</span>
              <span>{content.book.status || '...'}</span>
            </span>
          </div>
        )}

        {/* Socials */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-center text-[10px] text-text-dim">
          Socials:{' '}
          <span className="text-text">YT</span>
          {' · '}
          <span className={content.socials.tiktok ? 'text-text' : 'opacity-50 line-through'}>TT</span>
          {' · '}
          <span className={content.socials.instagram ? 'text-text' : 'opacity-50 line-through'}>IG</span>
        </div>
      </div>
    </div>
  );
};
