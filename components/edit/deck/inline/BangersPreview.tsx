'use client';

import type { Song } from '@/lib/content';
import { ED, FONT } from '../constants';
import { EditPin } from './EditPin';

interface Props {
  songs: Song[];
  onEdit: (pin: 'bangers') => void;
}

export const BangersPreview = ({ songs, onEdit }: Props) => {
  const visible = songs.filter(s => s.visible);
  return (
    <div
      style={{
        position: 'relative',
        padding: 14,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${ED.line}`,
        borderRadius: 4
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          letterSpacing: 1.4,
          color: ED.amber,
          marginBottom: 10,
          textTransform: 'uppercase'
        }}
      >
        BANGERS · {visible.length} / {songs.length} visible
      </div>
      {songs.length === 0 ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            color: ED.inkDim,
            padding: 16,
            textAlign: 'center',
            border: `1px dashed ${ED.line}`,
            borderRadius: 3
          }}
        >
          no songs yet — click EDIT to add one
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 6
          }}
        >
          {songs.map(song => (
            <div
              key={song.id}
              style={{
                aspectRatio: '1 / 1',
                background: song.coverUrl
                  ? `url(${song.coverUrl}) center/cover`
                  : 'rgba(0,0,0,0.5)',
                border: `1px solid ${song.visible ? ED.green : 'rgba(255,255,255,0.1)'}`,
                opacity: song.visible ? 1 : 0.4,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: 4
              }}
              title={song.title}
            >
              {!song.coverUrl && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  opacity: 0.3
                }}>♪</div>
              )}
              <span
                style={{
                  position: 'relative',
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  color: '#fff',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '2px 4px',
                  letterSpacing: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  width: '100%'
                }}
              >
                {song.title}
              </span>
            </div>
          ))}
        </div>
      )}
      <EditPin label="BANGERS" onClick={() => onEdit('bangers')} />
    </div>
  );
};
