import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { parseBuffer } from 'music-metadata';
import { SESSION_COOKIE, verifyToken } from '@/lib/edit-session';

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_SECONDS = 600; // 10 minutes
const ALLOWED_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-m4a',
  'audio/wave'
]);

const extForType = (type: string): string => {
  switch (type) {
    case 'audio/mp4':
    case 'audio/x-m4a':
      return 'm4a';
    case 'audio/wav':
    case 'audio/wave':
      return 'wav';
    default:
      return 'mp3';
  }
};

// Generates a short, slug-safe content hash from the bytes. We use this
// as the public Blob path so duplicate uploads dedupe naturally and the
// id stays stable across re-saves.
const contentHash = async (ab: ArrayBuffer): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', ab);
  const hex = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 10);
};

// POST /api/edit/song/upload — multipart/form-data, field 'file'.
// Returns { ok, audioUrl, durationSeconds, contentHash } on success.
// The client uses contentHash to generate a unique song.id.
export const POST = async (req: Request) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!verifyToken(token)) {
    return NextResponse.json(
      { ok: false, error: 'Your session expired. Log in again.' },
      { status: 401 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'Blob storage is not configured.' },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad multipart payload.' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Missing file.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Audio too large (max ${Math.floor(MAX_BYTES / 1024 / 1024)} MB).` },
      { status: 413 }
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported audio type: ${file.type}` },
      { status: 415 }
    );
  }

  const ab = await file.arrayBuffer() as ArrayBuffer;
  const buf = new Uint8Array(ab);

  // Probe duration. If the file is malformed or music-metadata can't
  // determine duration, we keep going with null — the song still saves
  // and the card just shows no duration label.
  let durationSeconds: number | null = null;
  try {
    const meta = await parseBuffer(buf, file.type, { duration: true });
    if (meta.format.duration && meta.format.duration > 0) {
      durationSeconds = Math.round(meta.format.duration);
      if (durationSeconds > MAX_SECONDS) {
        return NextResponse.json(
          { ok: false, error: `Audio too long (max ${MAX_SECONDS / 60} min).` },
          { status: 400 }
        );
      }
    }
  } catch {
    // ignore — durationSeconds stays null
  }

  const hash = await contentHash(ab);
  const ext = extForType(file.type);
  const path = `songs/${hash}.${ext}`;

  try {
    const blob = await put(path, ab, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false
    });
    return NextResponse.json({
      ok: true,
      audioUrl: blob.url,
      durationSeconds,
      contentHash: hash
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    return NextResponse.json(
      { ok: false, error: `Blob upload failed: ${message}` },
      { status: 502 }
    );
  }
};
