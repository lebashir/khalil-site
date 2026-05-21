'use client';

import type { SiteContent } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import { ED, FONT } from '../constants';
import { ImageDropzone } from './ImageDropzone';

interface Props {
  images: SiteContent['images'];
  videos: VideoItem[];
  /** Update the images map immutably. Pass null to remove a slot. */
  setImage: (slotId: string, url: string | null) => void;
}

// IMAGES section in the inline editor. Lists all of Khalil's editable
// image slots as drop-zones, grouped by surface. Uploads happen
// immediately via /api/edit/image/upload; the slot-id → URL mapping
// flows through setImage into content.images and is persisted on the
// next /api/edit/save commit.
//
// Each slot here writes to the SAME content.images map that the BOOK
// pin's cover field also writes to — uploads done from either place
// stay in sync.
export const ImagesPreview = ({ images, videos, setImage }: Props) => {
  // Cap to the same 5 visible video slots the homepage renders.
  const visibleVideos = videos.slice(0, 5);

  const get = (slotId: string): string | null => images[slotId] ?? null;
  const handleUpload = (slotId: string) => (url: string) => setImage(slotId, url);
  const handleRemove = (slotId: string) => () => setImage(slotId, null);

  return (
    <section
      style={{
        padding: 12,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${ED.line}`,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: ED.amber,
            letterSpacing: 1.4,
            textTransform: 'uppercase'
          }}
        >
          ◇ IMAGES
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.inkDim,
            letterSpacing: 1
          }}
        >
          // photos that replace placeholder art
        </div>
      </div>

      {/* Portraits — two per-mode slots side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ImageDropzone
          slotId="portrait-gaming"
          label="PORTRAIT · GAMING"
          currentUrl={get('portrait-gaming')}
          onUploaded={handleUpload('portrait-gaming')}
          onRemoved={handleRemove('portrait-gaming')}
          aspect="4 / 5"
        />
        <ImageDropzone
          slotId="portrait-football"
          label="PORTRAIT · FOOTBALL"
          currentUrl={get('portrait-football')}
          onUploaded={handleUpload('portrait-football')}
          onRemoved={handleRemove('portrait-football')}
          aspect="4 / 5"
        />
      </div>

      {/* Book cover — shares the same slot as the BOOK pin's cover field */}
      <ImageDropzone
        slotId="book-cover"
        label="BOOK COVER"
        currentUrl={get('book-cover')}
        onUploaded={handleUpload('book-cover')}
        onRemoved={handleRemove('book-cover')}
        aspect="3 / 4"
      />

      {/* Replay thumbnails — one slot per visible video */}
      {visibleVideos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.inkDim,
              letterSpacing: 1.4,
              textTransform: 'uppercase'
            }}
          >
            // replay thumbnails
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {visibleVideos.map((video, i) => {
              const slot = `replay-${video.id}`;
              return (
                <ImageDropzone
                  key={video.id}
                  slotId={slot}
                  label={`REPLAY ${i + 1}`}
                  kicker={video.title}
                  currentUrl={get(slot)}
                  onUploaded={handleUpload(slot)}
                  onRemoved={handleRemove(slot)}
                  aspect="16 / 12"
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
