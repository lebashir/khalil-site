'use client';

import Image from 'next/image';
import type { DesignThumb, Mode, VideoTier } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import { formatViews, formatRelative } from '@/lib/youtube';
import type { ArenaTheme } from './theme';
import { Pressable } from '@/components/fx';

interface Props {
  video: VideoItem;
  theme: ArenaTheme;
  tier: VideoTier;
  big?: boolean;
  useDesignThumb: boolean;
  designThumb: DesignThumb | null;
  mode: Mode;
  /** Custom uploaded thumbnail for this video (slot: `replay-${video.id}`).
   *  When present it wins over both the YouTube thumbnail and the design
   *  thumb fallback. */
  customThumbUrl?: string | null;
}

const TIER_COLORS: Record<VideoTier, [string, string]> = {
  LEGENDARY: ['#ffd700', '#ff8a00'],
  EPIC: ['#ff2bd6', '#7a26ff'],
  RARE: ['#00f0ff', '#4d8fff'],
  COMMON: ['#9ab1bd', '#5a6a78']
};

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds < 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const youTubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

// Trading-card video tile. Die-cut polygon, tier frame, holographic
// sheen, info plate. Background is either:
//   1) the live YouTube thumbnail (default)
//   2) the design's gradient + emoji (when useDesignThumb)
export const VideoCard = ({ video, theme, tier, big = false, useDesignThumb, designThumb, mode, customThumbUrl }: Props) => {
  const tc = TIER_COLORS[tier];
  const duration = formatDuration(video.durationSeconds);
  const views = video.isLive ? 'LIVE NOW' : formatViews(video.viewCount);
  const ago = video.publishedAt ? formatRelative(video.publishedAt) : '';
  const tagText = (mode === 'gaming' ? 'GAMING' : 'FOOTBALL');

  // Priority order:
  //   1. Custom uploaded thumbnail (always wins, even over editor's
  //      "use design thumb" toggle)
  //   2. Design thumb (when the editor toggled it on)
  //   3. YouTube thumbnail (default)
  const hasCustomThumb = Boolean(customThumbUrl);
  const showDesignArt = !hasCustomThumb && useDesignThumb && designThumb !== null;
  const thumb = showDesignArt ? designThumb : null;
  const showYoutubeThumb = !hasCustomThumb && !showDesignArt;

  const ytThumbSrc = video.thumbnails.large || video.thumbnails.high || video.thumbnails.medium;
  const ytThumbSrcSet = `${video.thumbnails.medium} 320w, ${video.thumbnails.high} 480w, ${video.thumbnails.large} 1280w`;
  const ytThumbSizes = big ? '(max-width: 880px) 100vw, 720px' : '(max-width: 880px) 50vw, 360px';

  return (
    <Pressable
      tag="a"
      href={youTubeUrl(video.id)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={video.title}
      rippleColor={`${tc[0]}aa`}
      ringColor={tc[0]}
      style={{
        display: 'block',
        borderRadius: 4,
        aspectRatio: big ? '16/10' : '16/12',
        clipPath:
          'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
        // Layer priority (computed above): custom upload → design thumb → fallback
        background: hasCustomThumb
          ? `url(${customThumbUrl}) center/cover`
          : showDesignArt && thumb
            ? `linear-gradient(135deg, ${thumb.from}, ${thumb.to})`
            : `linear-gradient(135deg, ${theme.bgB}, ${theme.bgA})`,
        boxShadow: `0 12px 24px rgba(0,0,0,0.55), 0 0 0 1px ${tc[0]}55, 0 0 24px ${tc[0]}33`,
        textDecoration: 'none'
      }}
    >
      {/* YouTube thumbnail (only when neither design art nor a custom
          upload has been chosen). */}
      {showYoutubeThumb && ytThumbSrc && (
        <Image
          src={ytThumbSrc}
          alt={video.title}
          fill
          sizes={ytThumbSizes}
          loading={big ? 'eager' : 'lazy'}
          decoding="async"
          // eslint-disable-next-line @next/next/no-img-element
          {...{ srcSet: ytThumbSrcSet }}
          unoptimized
          style={{ objectFit: 'cover' }}
        />
      )}

      {/* Tier frame inset */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 4,
          border: `1.5px solid ${tc[0]}`,
          borderRadius: 2,
          boxShadow: `inset 0 0 12px ${tc[0]}44`,
          clipPath:
            'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
      {/* Holographic foil sheen */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(115deg, transparent 30%, ${tc[0]}33 45%, ${tc[1]}44 50%, ${tc[0]}33 55%, transparent 70%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          opacity: 0.7
        }}
      />
      {/* LEGENDARY tier — animated sheen sweep on top of the static
          foil. Other tiers don't get this so LEGENDARY remains the
          visually loudest. backgroundImage (not the shorthand) so the
          paired backgroundSize isn't reset by a late re-render. */}
      {tier === 'LEGENDARY' && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255,255,255,0.53) 47%, ${tc[0]}cc 50%, rgba(255,255,255,0.53) 53%, transparent 60%, transparent 100%)`,
            backgroundSize: '300% 100%',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            animation: 'k-legend-sweep 3.4s ease-in-out infinite'
          }}
        />
      )}
      {/* Emoji placeholder (when design art is selected) */}
      {showDesignArt && thumb && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: big ? 110 : 60,
            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))'
          }}
          aria-hidden
        >
          {thumb.emoji}
        </div>
      )}
      {/* Scanlines */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px)',
          pointerEvents: 'none'
        }}
      />
      {/* Dim overlay so the title plate stays legible over the photo
          background. Applied for both YouTube thumbs AND custom uploads
          (the design-thumb emoji path already has its own gradient). */}
      {!showDesignArt && (
        <span
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }}
        />
      )}
      {/* Tier banner */}
      <span
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 3,
          padding: '3px 8px',
          background: `linear-gradient(180deg, ${tc[0]} 0%, ${tc[1]} 100%)`,
          color: '#0a0420',
          fontFamily: "'Anton', 'Bungee', sans-serif",
          fontSize: 9,
          letterSpacing: 1.5,
          clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
          boxShadow: `0 2px 8px ${tc[0]}88`
        }}
      >
        {tier}
      </span>
      {/* Duration pill */}
      {duration && (
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            padding: '3px 8px',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 0.5
          }}
        >
          {duration}
        </span>
      )}
      {/* Tag badge */}
      <span
        style={{
          position: 'absolute',
          top: big ? 38 : 30,
          right: 10,
          zIndex: 3,
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.65)',
          border: `1px solid ${tc[0]}`,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 8,
          letterSpacing: 1,
          color: tc[0]
        }}
      >
        {tagText}
      </span>
      {/* Play button */}
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: big ? 64 : 36,
          height: big ? 64 : 36,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, #fff 0%, ${tc[0]} 30%, ${tc[1]} 100%)`,
          boxShadow: `0 0 22px ${tc[0]}, 0 4px 10px rgba(0,0,0,0.5)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0a0420',
          fontSize: big ? 22 : 13,
          fontWeight: 900,
          zIndex: 3
        }}
        aria-hidden
      >
        ▶
      </span>
      {/* Bottom info plate */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 12px 12px',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.9))',
          zIndex: 3
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: big ? 15 : 11,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {video.title}
        </div>
        <div
          style={{
            marginTop: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              color: tc[0],
              letterSpacing: 0.5,
              fontWeight: 700
            }}
          >
            ▸ {views}
          </span>
          {ago && (
            <span
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 8,
                color: 'rgba(255,255,255,0.5)'
              }}
            >
              {ago}
            </span>
          )}
        </div>
      </div>
    </Pressable>
  );
};
