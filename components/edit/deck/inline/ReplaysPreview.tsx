'use client';

import type { SiteContent } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import { ED, FONT } from '../constants';
import { EditPin } from './EditPin';

interface ReplaysPreviewProps {
  videos: VideoItem[];
  pinnedId: string | null;
  /** Slot-id → URL map. Looked up per video as `replay-${video.id}`. */
  images: SiteContent['images'];
  onEdit: (key: 'pinned-video' | 'thumb-style') => void;
}

// Returns the upload URL when the editor has set a custom thumb for this
// video, otherwise the YouTube thumbnail. Mirrors VideoCard's priority
// order so the inline preview matches what the homepage actually shows.
const thumbSrcFor = (video: VideoItem, images: SiteContent['images']): string => {
  const custom = images[`replay-${video.id}`];
  if (custom) return custom;
  return video.thumbnails.medium;
};

const PREVIEW_BG = 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))';

// Mini-mockup of the replays/videos section.
// Shows pinned video first (larger), then a strip of the rest.
export const ReplaysPreview = ({ videos, pinnedId, images, onEdit }: ReplaysPreviewProps) => {
  const pinned = pinnedId ? videos.find((v) => v.id === pinnedId) : null;
  const rest = videos.filter((v) => v.id !== pinnedId).slice(0, 4);

  return (
    <div
      style={{
        position: 'relative',
        padding: 18,
        backgroundImage: PREVIEW_BG,
        border: `1px solid ${ED.line}`,
        borderRadius: 5
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingRight: 110
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: ED.amber,
            letterSpacing: 2,
            textTransform: 'uppercase'
          }}
        >
          replays
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.inkDim,
            letterSpacing: 1.4
          }}
        >
          {videos.length} clips
        </div>
      </div>

      {videos.length === 0 ? (
        <div
          style={{
            padding: 20,
            fontFamily: FONT.mono,
            fontSize: 10,
            color: ED.inkDim,
            letterSpacing: 1.5,
            textAlign: 'center',
            background: 'rgba(0,0,0,0.4)',
            border: `1px dashed ${ED.line}`,
            borderRadius: 3
          }}
        >
          no videos yet — set YOUTUBE_API_KEY to pull live feed
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 10
          }}
        >
          {/* Pinned thumb (or first video if none pinned). videos[0] is safe
              here — we already short-circuited the videos.length === 0 case. */}
          <ThumbCard
            video={pinned ?? videos[0]!}
            tag={pinned ? 'PINNED' : 'LATEST'}
            tagColor={pinned ? ED.amber : ED.blue}
            images={images}
          />
          {/* Mini list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rest.map((v) => (
              <MiniRow key={v.id} video={v} images={images} />
            ))}
          </div>
        </div>
      )}

      <EditPin
        label="PINNED"
        accent={ED.amber}
        onClick={() => onEdit('pinned-video')}
        style={{ top: 10, right: 10 }}
      />
      <EditPin
        label="STYLE"
        accent={ED.pink}
        onClick={() => onEdit('thumb-style')}
        style={{ top: 10, right: 130 }}
      />
    </div>
  );
};

const ThumbCard = ({
  video,
  tag,
  tagColor,
  images
}: {
  video: VideoItem;
  tag: string;
  tagColor: string;
  images: SiteContent['images'];
}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 4,
      overflow: 'hidden',
      border: `1px solid ${tagColor}`,
      background: 'rgba(0,0,0,0.4)',
      aspectRatio: '16 / 9'
    }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={thumbSrcFor(video, images)}
      alt=""
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
    <div
      style={{
        position: 'absolute',
        top: 6,
        left: 6,
        padding: '2px 6px',
        background: `${tagColor}22`,
        border: `1px solid ${tagColor}`,
        borderRadius: 2,
        fontFamily: FONT.mono,
        fontSize: 8,
        color: tagColor,
        letterSpacing: 1.4,
        fontWeight: 700
      }}
    >
      {tag}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '6px 8px',
        backgroundImage: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))',
        fontFamily: FONT.body,
        fontSize: 10,
        color: ED.ink,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {video.title}
    </div>
  </div>
);

const MiniRow = ({ video, images }: { video: VideoItem; images: SiteContent['images'] }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: 4,
      background: 'rgba(0,0,0,0.4)',
      border: `1px solid ${ED.line}`,
      borderRadius: 3
    }}
  >
    <div
      style={{
        width: 36,
        height: 22,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbSrcFor(video, images)}
        alt=""
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
    <div
      style={{
        fontFamily: FONT.body,
        fontSize: 9,
        color: ED.inkDim,
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
        flex: 1
      }}
    >
      {video.title}
    </div>
  </div>
);
