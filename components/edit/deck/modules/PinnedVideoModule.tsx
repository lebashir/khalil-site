'use client';

import type { VideoItem } from '@/lib/youtube';
import { ED, FONT } from '../constants';
import { Panel } from '../primitives';

interface Props {
  videos: VideoItem[];
  pinnedId: string | null;
  setPinnedId: (id: string | null) => void;
  hideHeader?: boolean;
}

const Body = ({ videos, pinnedId, setPinnedId }: Pick<Props, 'videos' | 'pinnedId' | 'setPinnedId'>) => {
  if (videos.length === 0) {
    return (
      <div
        style={{
          padding: 10,
          fontFamily: FONT.mono,
          fontSize: 10,
          color: ED.inkDim,
          letterSpacing: 1.5,
          textAlign: 'center'
        }}
      >
        no videos yet — set YOUTUBE_API_KEY to pull live feed
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {videos.map((v) => {
        const sel = pinnedId === v.id;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => setPinnedId(sel ? null : v.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              background: sel ? `${ED.amber}15` : 'rgba(0,0,0,0.4)',
              border: `1px solid ${sel ? ED.amber : ED.line}`,
              borderRadius: 3,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div
              style={{
                width: 40,
                height: 24,
                flexShrink: 0,
                borderRadius: 2,
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.5)'
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
                  fontFamily: FONT.body,
                  fontSize: 11,
                  color: sel ? ED.ink : ED.inkDim,
                  fontWeight: 600,
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
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  color: ED.amber,
                  letterSpacing: 0.5,
                  marginTop: 1
                }}
              >
                {v.viewCount !== null ? `${v.viewCount} views` : ''}
              </div>
            </div>
            {sel && (
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  color: ED.amber,
                  letterSpacing: 1,
                  padding: '1px 4px',
                  border: `1px solid ${ED.amber}`,
                  borderRadius: 2
                }}
              >
                PIN
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const PinnedVideoModule = ({ videos, pinnedId, setPinnedId, hideHeader }: Props) => {
  if (hideHeader) return <Body videos={videos} pinnedId={pinnedId} setPinnedId={setPinnedId} />;
  return (
    <Panel title="PINNED REPLAY" kicker="// shows first in REPLAYS." accent={ED.amber}>
      <Body videos={videos} pinnedId={pinnedId} setPinnedId={setPinnedId} />
    </Panel>
  );
};
