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

// IMAGES section in the on-site editor. Every editable image slot in
// one uniform auto-fit grid so book-cover, portraits and replay thumbs
// all read at the same compact size instead of the book cover hogging
// the full row.
//
// Uploads happen immediately via /api/edit/image/upload; the slot-id →
// URL mapping flows through setImage into content.images and is
// persisted on the next /api/edit/save commit.
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
        gap: 12
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap'
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
          // photos that replace placeholder art · click any slot to upload
        </div>
      </div>

      {/* Hero shots — portraits + book cover share one compact 3-up grid.
          auto-fit/minmax keeps slots at ~160-220px so the book cover never
          dominates the page like it did before. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10
        }}
      >
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
        <ImageDropzone
          slotId="book-cover"
          label="BOOK COVER"
          currentUrl={get('book-cover')}
          onUploaded={handleUpload('book-cover')}
          onRemoved={handleRemove('book-cover')}
          aspect="3 / 4"
        />
      </div>

      {/* Replay thumbnails — auto-pulled from YouTube (10-min cache). The
          list refreshes whenever Khalil uploads new videos — no manual
          step needed here. */}
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
            // replay thumbnails · auto-synced with youtube
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 10
            }}
          >
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
                  aspect="16 / 9"
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
