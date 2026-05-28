'use client';

import type { Song } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { BangersPlayerProvider } from './BangersPlayer';
import { SongCard } from './SongCard';
import { Reveal } from './Reveal';

interface Props {
  songs: Song[];
  theme: ArenaTheme;
  size: ArenaSize;
}

// Two themed gradients we rotate through when a song has no cover art.
// Keeps the no-cover grid visually varied without giving every song the
// same fallback.
const GRADIENT_POOL = [
  { from: '#b8527a', to: '#3a0a1f' },
  { from: '#5b3aa6', to: '#1a0a3a' },
  { from: '#2a7d4f', to: '#0e3a1f' },
  { from: '#1a3a8a', to: '#000d33' }
];

export const Bangers = ({ songs, theme, size }: Props) => {
  const visible = songs.filter(s => s.visible);
  if (visible.length === 0) return null;
  const isDesktop = size === 'desktop';
  const isTablet = size === 'tablet';
  const cols = isDesktop ? 3 : isTablet ? 2 : 1;

  return (
    <BangersPlayerProvider>
      <section
        id="bangers"
        style={{
          padding: isDesktop ? '40px 64px' : isTablet ? '24px 32px' : '24px 14px'
        }}
      >
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Anton', 'Bungee', sans-serif",
                color: theme.fg,
                fontSize: isDesktop ? 64 : isTablet ? 44 : 32,
                letterSpacing: -0.5,
                lineHeight: 1
              }}
            >
              BANGERS
            </h2>
            <span
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10,
                color: theme.accent,
                letterSpacing: 1.6
              }}
            >
              // dropped from the studio
            </span>
          </div>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 14
          }}
        >
          {visible.map((song, i) => (
            <Reveal key={song.id} delay={i * 70}>
              <SongCard
                song={song}
                theme={theme}
                themedGradient={GRADIENT_POOL[i % GRADIENT_POOL.length]!}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </BangersPlayerProvider>
  );
};
