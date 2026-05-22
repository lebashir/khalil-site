import type { VideoItem } from '@/lib/youtube';
import { formatViews, formatRelative } from '@/lib/youtube';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import type { TunnelTheme } from '../theme';
import { SceneTag } from './SceneTag';

interface Props {
  theme: TunnelTheme;
  lockT: number;
  size: ArenaSize;
  videos: VideoItem[];
}

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds < 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

// Empty-state video card when the YouTube fetch didn't return anything.
const PLACEHOLDER_FEATURED = {
  title: 'fresh clips loading…',
  views: '—',
  ago: '',
  duration: ''
};

export const ReplaysRoom = ({ theme, lockT, size, videos }: Props) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 880 : size === 'tablet' ? 700 : 380;
  const featured = videos[0];
  const sides = videos.slice(1, 5);

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        padding: isDesktop ? 28 : 16,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 16,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: `0 0 60px ${theme.accent}33, inset 0 0 30px rgba(0,0,0,0.4)`
      }}
    >
      <SceneTag label="02 · REPLAYS" theme={theme} />
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: isDesktop ? 56 : 32,
            color: theme.fg,
            letterSpacing: 0.5,
            lineHeight: 1
          }}
        >
          REPLAYS<span style={{ color: theme.accent }}>.</span>
        </h2>
        <span
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: isDesktop ? 12 : 10,
            color: theme.accent,
            letterSpacing: 2
          }}
        >
          {videos.length} CLIPS · LIVE FEED
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr',
          gap: 10
        }}
      >
        {/* Featured */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            background: featured
              ? `linear-gradient(135deg, ${theme.bgFar}, ${theme.bgDeep})`
              : `linear-gradient(135deg, ${theme.bgMid}, ${theme.bgFar})`,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 8,
            overflow: 'hidden',
            transform: `scale(${0.92 + lockT * 0.08}) translateY(${(1 - lockT) * 12}px)`,
            opacity: lockT
          }}
        >
          {featured && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featured.thumbnails.large || featured.thumbnails.high || featured.thumbnails.medium}
              alt={featured.title}
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.25)'
            }}
            aria-hidden
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isDesktop ? 70 : 44,
              height: isDesktop ? 70 : 44,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              boxShadow: `0 0 22px ${theme.accent}, 0 4px 10px rgba(0,0,0,0.5)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.bgA,
              fontSize: isDesktop ? 26 : 16,
              fontWeight: 900
            }}
            aria-hidden
          >
            ▶
          </div>
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              padding: '3px 8px',
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${theme.accent}`,
              color: theme.accent,
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: 1,
              fontWeight: 700
            }}
          >
            FEATURED
          </div>
          {featured && formatDuration(featured.durationSeconds) && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                padding: '3px 8px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10,
                fontWeight: 600
              }}
            >
              {formatDuration(featured.durationSeconds)}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '14px 16px',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))'
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: isDesktop ? 18 : 13,
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.2
              }}
            >
              {featured?.title ?? PLACEHOLDER_FEATURED.title}
            </div>
            <div
              style={{
                marginTop: 3,
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10,
                color: theme.accent
              }}
            >
              {featured
                ? `${formatViews(featured.viewCount)}${featured.publishedAt ? ` · ${formatRelative(featured.publishedAt)}` : ''}`
                : PLACEHOLDER_FEATURED.views}
            </div>
          </div>
        </div>

        {/* Side stack */}
        <div
          style={{
            display: 'grid',
            gridAutoRows: 'auto',
            gap: 6
          }}
        >
          {sides.length === 0 ? (
            <div
              style={{
                padding: 12,
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10,
                color: theme.accent,
                letterSpacing: 1.5,
                textAlign: 'center',
                opacity: 0.7
              }}
            >
              more clips up next →
            </div>
          ) : (
            sides.map((v, i) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 6,
                  background: 'rgba(0,0,0,0.45)',
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: 6,
                  transform: `translateX(${(1 - lockT) * (i + 1) * 16}px)`,
                  opacity: lockT
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 36,
                    flexShrink: 0,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.thumbnails.medium}
                    alt=""
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {v.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      fontSize: 9,
                      color: theme.accent,
                      marginTop: 1,
                      letterSpacing: 0.5
                    }}
                  >
                    {formatViews(v.viewCount)}
                    {formatDuration(v.durationSeconds)
                      ? ` · ${formatDuration(v.durationSeconds)}`
                      : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
