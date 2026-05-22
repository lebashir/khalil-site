'use client';

import { useRef, useState, type DragEvent } from 'react';
import { ED, FONT } from '../constants';
import { resizeImageFile } from './imageResize';

interface Props {
  /** Image slot id (e.g. `portrait-gaming`, `book-cover`, `replay-{id}`). */
  slotId: string;
  /** Human-readable label rendered above the drop area. */
  label: string;
  /** Optional kicker (e.g. video title) shown next to the label. */
  kicker?: string;
  /** Current URL for this slot, or null when unset. */
  currentUrl: string | null;
  /** Called with the new Blob URL after a successful upload. */
  onUploaded: (url: string) => void;
  /** Called when the user removes the current image. */
  onRemoved: () => void;
  /** Aspect-ratio hint for the preview thumbnail. Default 16/9. */
  aspect?: string;
}

// Reusable upload UI used by both ImagesPreview and the BOOK pin's
// cover field. Self-contained: handles file picker, drag/drop, resize,
// upload to /api/edit/image/upload, error display, and remove.
//
// Both call sites edit the SAME slot id, so updates are visible to
// each other through the parent's content state.
//
// Layout: header row → preview/dropzone surface → status row. When an
// image is loaded, two overlay buttons appear on the preview itself
// (REPLACE bottom-left, × bottom-right) so the most useful actions are
// thumb-reachable on touch devices. Tap targets are ≥36px tall.
export const ImageDropzone = ({
  slotId,
  label,
  kicker,
  currentUrl,
  onUploaded,
  onRemoved,
  aspect = '16 / 9'
}: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const blob = await resizeImageFile(file);
      const fd = new FormData();
      fd.append('slotId', slotId);
      fd.append('file', blob, `${slotId}.jpg`);
      const res = await fetch('/api/edit/image/upload', {
        method: 'POST',
        body: fd,
        cache: 'no-store'
      });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !json.ok || !json.url) {
        throw new Error(json.error ?? `Upload failed (${res.status}).`);
      }
      onUploaded(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const onPick = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setIsDragging(true);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;
    void acceptFile(e.dataTransfer.files?.[0]);
  };

  const borderColor = isDragging ? ED.amber : currentUrl ? ED.green : ED.line;

  return (
    <div
      style={{
        padding: 8,
        background: 'rgba(0,0,0,0.4)',
        border: `1px dashed ${borderColor}`,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'border-color .15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, minHeight: 14 }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.amber,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {label}
        </div>
        {kicker && (
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 8,
              color: ED.inkDim,
              letterSpacing: 0.8,
              maxWidth: '55%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {kicker}
          </div>
        )}
      </div>

      {/* The drop / preview surface */}
      <div
        onClick={onPick}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label={`Upload image for ${label}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPick();
          }
        }}
        style={{
          position: 'relative',
          aspectRatio: aspect,
          background: currentUrl
            ? `url(${currentUrl}) center/cover`
            : isDragging
              ? `${ED.amber}11`
              : 'rgba(0,0,0,0.4)',
          border: `1px solid ${borderColor}`,
          borderRadius: 3,
          cursor: isUploading ? 'progress' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'background .15s ease, border-color .15s ease'
        }}
      >
        {!currentUrl && !isUploading && (
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: isDragging ? ED.amber : ED.inkDim,
              letterSpacing: 1.3,
              textTransform: 'uppercase',
              textAlign: 'center',
              padding: 8,
              lineHeight: 1.4,
              pointerEvents: 'none'
            }}
          >
            {isDragging ? '◇ DROP IT' : '+ TAP TO UPLOAD'}
          </div>
        )}
        {isUploading && (
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.amber,
              letterSpacing: 1.3,
              textTransform: 'uppercase',
              background: 'rgba(0,0,0,0.7)',
              padding: '5px 10px',
              border: `1px solid ${ED.amber}`,
              borderRadius: 3
            }}
          >
            ◐ UPLOADING…
          </div>
        )}

        {/* "LIVE" badge — corner ribbon, doesn't compete with action buttons */}
        {currentUrl && !isUploading && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 5,
              left: 5,
              padding: '2px 6px',
              fontFamily: FONT.mono,
              fontSize: 7,
              color: ED.green,
              background: 'rgba(0,0,0,0.75)',
              border: `1px solid ${ED.green}`,
              borderRadius: 2,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            ✓ LIVE
          </div>
        )}

        {/* Action overlays appear once an image is loaded. REPLACE on the
            bottom-left, REMOVE on the bottom-right — both ≥36px tall so
            they're easy to hit on phone. Background gradient ensures the
            buttons stay legible even on light/busy photos. */}
        {currentUrl && !isUploading && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 6,
              padding: 6,
              backgroundImage: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.65))',
              pointerEvents: 'none'
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPick();
              }}
              aria-label={`Replace ${label} image`}
              style={{
                pointerEvents: 'auto',
                minHeight: 36,
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.7)',
                border: `1px solid ${ED.amber}`,
                borderRadius: 3,
                fontFamily: FONT.mono,
                fontSize: 10,
                color: ED.amber,
                letterSpacing: 1.4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 700,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}
            >
              ↻ REPLACE
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoved();
              }}
              aria-label={`Remove ${label} image`}
              style={{
                pointerEvents: 'auto',
                minHeight: 36,
                minWidth: 36,
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.7)',
                border: `1px solid ${ED.red}`,
                borderRadius: 3,
                fontFamily: FONT.mono,
                fontSize: 10,
                color: ED.red,
                letterSpacing: 1.4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 700,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}
            >
              ✕ REMOVE
            </button>
          </div>
        )}
      </div>

      {/* Hidden file picker — re-keyed on currentUrl so re-selecting the
          same file after a remove works (browsers suppress duplicate
          input.change events otherwise). */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Clear the input value so the same file can be picked again.
          e.target.value = '';
          void acceptFile(file);
        }}
        style={{ display: 'none' }}
      />

      {/* Status line — only renders something when there's actually an
          error to surface or an upload in flight. Empty when idle so it
          doesn't add visual noise to every slot. */}
      {(error || isUploading) && (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: error ? ED.pink : ED.inkDim,
            letterSpacing: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {error ? `! ${error}` : 'uploading…'}
        </div>
      )}
    </div>
  );
};
