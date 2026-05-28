'use client';

import { useCallback, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Song } from '@/lib/content';
import { FIELD_LIMITS } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Field, editInput } from '../primitives';
import { ImageDropzone } from './ImageDropzone';

interface Props {
  songs: Song[];
  onChange: (next: Song[]) => void;
}

const SONG_UPLOAD_URL = '/api/edit/song/upload';

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface UploadResult {
  audioUrl: string;
  durationSeconds: number | null;
  contentHash: string;
}

const uploadSong = async (file: File): Promise<UploadResult> => {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(SONG_UPLOAD_URL, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error ?? 'Upload failed.');
  }
  return {
    audioUrl: data.audioUrl,
    durationSeconds: data.durationSeconds,
    contentHash: data.contentHash
  };
};

// One-row editor for an individual song. Supports edit-in-place, reorder,
// delete, and visibility toggle.
const SongRow = ({
  song,
  index,
  total,
  onChange,
  onDelete,
  onMove
}: {
  song: Song;
  index: number;
  total: number;
  onChange: (next: Song) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) => {
  const update = <K extends keyof Song>(key: K, value: Song[K]) =>
    onChange({ ...song, [key]: value });

  return (
    <div
      style={{
        padding: 10,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${song.visible ? ED.line : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: song.visible ? 1 : 0.6
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            flexShrink: 0,
            background: song.coverUrl ? `url(${song.coverUrl}) center/cover` : 'rgba(0,0,0,0.6)',
            border: `1px solid ${ED.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: ED.inkDim
          }}
        >
          {!song.coverUrl && '♪'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={song.title}
            maxLength={FIELD_LIMITS.songTitle}
            onChange={(e) => update('title', e.target.value)}
            placeholder="title"
            style={{ ...editInput, fontFamily: FONT.stencil, fontSize: 14 }}
          />
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.inkDim,
              letterSpacing: 1,
              marginTop: 4
            }}
          >
            {formatDuration(song.durationSeconds) || 'unknown'} · {song.id}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          type="button"
          onClick={() => update('visible', !song.visible)}
          style={chipStyle(song.visible ? ED.green : ED.line)}
        >
          {song.visible ? '● VISIBLE' : '○ HIDDEN'}
        </button>
        <button
          type="button"
          aria-label="Move up"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          style={chipStyle(ED.line)}
        >
          ▲
        </button>
        <button
          type="button"
          aria-label="Move down"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          style={chipStyle(ED.line)}
        >
          ▼
        </button>
        <button type="button" onClick={onDelete} style={chipStyle(ED.red)}>
          ✕ DELETE
        </button>
      </div>
      <ImageDropzone
        slotId={`song-cover-${song.id}`}
        label="COVER"
        currentUrl={song.coverUrl}
        onUploaded={(url) => update('coverUrl', url)}
        onRemoved={() => update('coverUrl', null)}
        aspect="1 / 1"
      />
      <Field label={`suno url (optional · max ${FIELD_LIMITS.songSunoUrl})`}>
        <input
          value={song.sunoUrl ?? ''}
          maxLength={FIELD_LIMITS.songSunoUrl}
          onChange={(e) => update('sunoUrl', e.target.value || undefined)}
          placeholder="https://suno.com/song/..."
          style={editInput}
        />
      </Field>
    </div>
  );
};

const chipStyle = (color: string): CSSProperties => ({
  cursor: 'pointer',
  background: 'rgba(0,0,0,0.5)',
  border: `1px solid ${color}`,
  color,
  fontFamily: FONT.mono,
  fontSize: 9,
  letterSpacing: 1.4,
  padding: '4px 10px',
  textTransform: 'uppercase',
  borderRadius: 999
});

export const BangersEditor = ({ songs, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onAdd = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const { audioUrl, durationSeconds, contentHash } = await uploadSong(file);
      const newSong: Song = {
        id: contentHash,
        title: file.name.replace(/\.[^.]+$/, '').slice(0, FIELD_LIMITS.songTitle) || 'untitled',
        audioUrl,
        coverUrl: null,
        durationSeconds,
        visible: true
      };
      onChange([...songs, newSong]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [songs, onChange]);

  const onUpdate = (i: number, next: Song) => {
    const arr = [...songs];
    arr[i] = next;
    onChange(arr);
  };
  const onDelete = (i: number) => {
    const arr = songs.filter((_, idx) => idx !== i);
    onChange(arr);
  };
  const onMove = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= songs.length) return;
    const arr = [...songs];
    const [moved] = arr.splice(i, 1);
    if (moved) arr.splice(j, 0, moved);
    onChange(arr);
  };

  const atLimit = songs.length >= 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: ED.inkDim,
          letterSpacing: 1.4,
          textTransform: 'uppercase'
        }}
      >
        {songs.length} / 12 songs
      </div>
      {songs.map((song, i) => (
        <SongRow
          key={song.id}
          song={song}
          index={i}
          total={songs.length}
          onChange={(next) => onUpdate(i, next)}
          onDelete={() => onDelete(i)}
          onMove={(dir) => onMove(i, dir)}
        />
      ))}
      {atLimit ? (
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: ED.red }}>
          max 12 songs — delete one to add another
        </div>
      ) : (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 14,
            border: `1px dashed ${ED.amber}`,
            borderRadius: 3,
            cursor: uploading ? 'wait' : 'pointer',
            opacity: uploading ? 0.6 : 1
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              letterSpacing: 1.4,
              color: ED.amber,
              textTransform: 'uppercase'
            }}
          >
            {uploading ? 'uploading…' : '+ ADD SONG'}
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 9, color: ED.inkDim }}>
            drop an mp3/m4a/wav (max 15 MB · 10 min)
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onAdd(f);
            }}
            style={{ marginTop: 4 }}
          />
        </label>
      )}
      {error && (
        <div style={{ color: ED.red, fontFamily: FONT.mono, fontSize: 10 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
};
