'use client';

import type { Song } from '@/lib/content';
import type { ArenaTheme } from './theme';
import { useBangersPlayer } from './BangersPlayer';

interface Props {
  song: Song;
  theme: ArenaTheme;
  themedGradient: { from: string; to: string };
}

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const SongCard = ({ song, theme, themedGradient }: Props) => {
  const { playingId, progress, togglePlay } = useBangersPlayer();
  const isPlaying = playingId === song.id;
  const duration = formatDuration(song.durationSeconds);

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        borderRadius: 6,
        overflow: 'hidden',
        background: song.coverUrl
          ? `url(${song.coverUrl}) center/cover`
          : `linear-gradient(135deg, ${themedGradient.from}, ${themedGradient.to})`,
        boxShadow: `0 12px 24px rgba(0,0,0,0.55), 0 0 0 1px ${theme.accent}55`,
        cursor: 'pointer'
      }}
      onClick={() => togglePlay(song)}
      role="button"
      aria-label={isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePlay(song);
        }
      }}
    >
      {/* Fallback note emoji when no cover */}
      {!song.coverUrl && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            opacity: 0.4
          }}
        >
          ♪
        </div>
      )}
      {/* Dim overlay */}
      <span
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }}
      />
      {/* Play/pause button */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, #fff 0%, ${theme.accent} 40%, ${theme.accent2} 100%)`,
          boxShadow: `0 0 24px ${theme.accent}aa, 0 4px 12px rgba(0,0,0,0.6)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0a0420',
          fontSize: 24,
          fontWeight: 900,
          zIndex: 3
        }}
      >
        {isPlaying ? '❚❚' : '▶'}
      </span>
      {/* Title overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 12px 14px',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.92))',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 8
        }}
      >
        <span
          style={{
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: 16,
            letterSpacing: 0.5,
            color: '#fff',
            lineHeight: 1.1,
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {song.title}
        </span>
        {duration && (
          <span
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              color: theme.accent,
              letterSpacing: 0.5,
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            {duration}
          </span>
        )}
      </div>
      {/* "on suno" link */}
      {song.sunoUrl && (
        <a
          href={song.sunoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 4,
            padding: '3px 8px',
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${theme.accent}`,
            color: theme.accent,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 9,
            letterSpacing: 1,
            textDecoration: 'none'
          }}
        >
          ▶ on suno
        </a>
      )}
      {/* Progress bar (only while playing) */}
      {isPlaying && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 5
          }}
        >
          <div
            style={{
              width: `${Math.min(100, progress * 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
              transition: 'width 0.2s linear'
            }}
          />
        </div>
      )}
    </div>
  );
};
