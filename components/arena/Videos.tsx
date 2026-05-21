'use client';

import type { Mode, SiteContent, VideoTier } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { Reveal } from './Reveal';
import { VideoCard } from './VideoCard';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  videos: VideoItem[];
  editorial: SiteContent['videos'];
  /** Slot-id → URL map. Per-video override is keyed `replay-${video.id}`. */
  images: SiteContent['images'];
  error: string | null;
}

const channelUrl = 'https://www.youtube.com/@khalilgaming2020';
const DEFAULT_TIERS: VideoTier[] = ['LEGENDARY', 'EPIC', 'RARE', 'EPIC', 'COMMON'];

// Orders the YouTube video list with an optional pinned ID floating to
// the top. Caps to 5 since the grid layout only renders 5 slots.
const orderVideos = (videos: VideoItem[], pinnedId: string | null): VideoItem[] => {
  const cap = videos.slice(0, 8);
  if (!pinnedId) return cap.slice(0, 5);
  const pinned = cap.find((v) => v.id === pinnedId);
  if (!pinned) return cap.slice(0, 5);
  return [pinned, ...cap.filter((v) => v.id !== pinnedId)].slice(0, 5);
};

const EmptyState = ({ theme }: { theme: ArenaTheme }) => (
  <div
    style={{
      borderRadius: 12,
      border: `1px solid ${theme.cardBorder}`,
      background: theme.card,
      padding: '40px 24px',
      textAlign: 'center',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}
  >
    <p
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 16,
        color: theme.fg,
        marginBottom: 16
      }}
    >
      check back soon — khalil's cooking up new videos.
    </p>
    <a
      href={channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        fontFamily: "'Anton', sans-serif",
        fontSize: 14,
        letterSpacing: 1,
        color: '#0a0420',
        background: `linear-gradient(180deg, ${theme.ctaA} 0%, ${theme.ctaB} 100%)`,
        padding: '10px 18px',
        clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
        textDecoration: 'none'
      }}
    >
      ▶ SUBSCRIBE ON YOUTUBE
    </a>
  </div>
);

export const Videos = ({ mode, theme, size, videos, editorial, images, error }: Props) => {
  const isDesktop = size === 'desktop';
  const isTablet = size === 'tablet';
  const ordered = orderVideos(videos, editorial.pinnedId);
  const tiers = editorial.tiers.length === 5 ? editorial.tiers : DEFAULT_TIERS;

  // Per-slot tier + per-slot design thumb (designThumbs[i], wrapping around if fewer).
  const slot = (i: number) => ({
    tier: tiers[i] ?? 'COMMON',
    designThumb:
      editorial.designThumbs.length > 0
        ? editorial.designThumbs[i % editorial.designThumbs.length] ?? null
        : null
  });

  // Custom thumbnail uploaded for this specific video id (slot:
  // `replay-${id}`). When present it wins over both the YouTube
  // thumbnail and the design-thumb fallback. */
  const customThumbFor = (id: string): string | null => images[`replay-${id}`] ?? null;

  const headerRow = (
    <Reveal>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: isDesktop ? 18 : 10
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: isDesktop ? 64 : 32,
            color: theme.fg,
            letterSpacing: 0.5,
            lineHeight: 1
          }}
        >
          REPLAYS
          <span style={{ color: theme.accent, transition: 'color .6s ease' }}>.</span>
        </h2>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: isDesktop ? 12 : 10,
            color: theme.accent,
            letterSpacing: 2,
            textDecoration: 'none',
            transition: 'color .6s ease'
          }}
        >
          SEE ALL →
        </a>
      </div>
    </Reveal>
  );

  if (error || ordered.length === 0) {
    return (
      <section id="replays" style={{ padding: isDesktop ? '32px 64px 0' : '4px 14px 14px' }}>
        {headerRow}
        <Reveal>
          <EmptyState theme={theme} />
        </Reveal>
      </section>
    );
  }

  const featured = ordered[0];
  if (!featured) {
    return (
      <section id="replays" style={{ padding: isDesktop ? '32px 64px 0' : '4px 14px 14px' }}>
        {headerRow}
        <Reveal>
          <EmptyState theme={theme} />
        </Reveal>
      </section>
    );
  }
  const rest = ordered.slice(1);

  const featuredSlot = slot(0);
  return (
    <section id="replays" style={{ padding: isDesktop ? '32px 64px 0' : '4px 14px 14px' }}>
      {headerRow}
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <Reveal>
            <VideoCard
              video={featured}
              customThumbUrl={customThumbFor(featured.id)}
              theme={theme}
              tier={featuredSlot.tier}
              big
              useDesignThumb={editorial.useDesignThumbForFeatured}
              designThumb={featuredSlot.designThumb}
              mode={mode}
            />
          </Reveal>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 14 }}>
            {rest.slice(0, 2).map((v, i) => {
              const s = slot(i + 1);
              return (
                <Reveal key={v.id} delay={(i + 1) * 60}>
                  <VideoCard
                    video={v}
                    customThumbUrl={customThumbFor(v.id)}
                    theme={theme}
                    tier={s.tier}
                    useDesignThumb={editorial.useDesignThumbsForRest}
                    designThumb={s.designThumb}
                    mode={mode}
                  />
                </Reveal>
              );
            })}
          </div>
          {rest.length > 2 && (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14
              }}
            >
              {rest.slice(2).map((v, i) => {
                const s = slot(i + 3);
                return (
                  <Reveal key={v.id} delay={(i + 3) * 60}>
                    <VideoCard
                      video={v}
                      customThumbUrl={customThumbFor(v.id)}
                      theme={theme}
                      tier={s.tier}
                      useDesignThumb={editorial.useDesignThumbsForRest}
                      designThumb={s.designThumb}
                      mode={mode}
                    />
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      ) : isTablet ? (
        <>
          <Reveal>
            <div style={{ marginBottom: 10 }}>
              <VideoCard
                video={featured}
                customThumbUrl={customThumbFor(featured.id)}
                theme={theme}
                tier={featuredSlot.tier}
                big
                useDesignThumb={editorial.useDesignThumbForFeatured}
                designThumb={featuredSlot.designThumb}
                mode={mode}
              />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {rest.map((v, i) => {
              const s = slot(i + 1);
              return (
                <Reveal key={v.id} delay={(i + 1) * 60}>
                  <VideoCard
                    video={v}
                    customThumbUrl={customThumbFor(v.id)}
                    theme={theme}
                    tier={s.tier}
                    useDesignThumb={editorial.useDesignThumbsForRest}
                    designThumb={s.designThumb}
                    mode={mode}
                  />
                </Reveal>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <Reveal delay={80}>
            <div style={{ marginBottom: 8 }}>
              <VideoCard
                video={featured}
                customThumbUrl={customThumbFor(featured.id)}
                theme={theme}
                tier={featuredSlot.tier}
                big
                useDesignThumb={editorial.useDesignThumbForFeatured}
                designThumb={featuredSlot.designThumb}
                mode={mode}
              />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {rest.map((v, i) => {
              const s = slot(i + 1);
              return (
                <Reveal key={v.id} delay={(i + 1) * 60}>
                  <VideoCard
                    video={v}
                    customThumbUrl={customThumbFor(v.id)}
                    theme={theme}
                    tier={s.tier}
                    useDesignThumb={editorial.useDesignThumbsForRest}
                    designThumb={s.designThumb}
                    mode={mode}
                  />
                </Reveal>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
