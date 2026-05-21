import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { SESSION_COOKIE, verifyToken } from '@/lib/edit-session';
import { isValidImageSlotId } from '@/lib/content';

// Hard cap so a stuck PUT can't blow up the function memory. Editor-side
// resizing keeps real uploads well under 1 MB; this is just the safety net.
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

// Maps a Content-Type onto the file extension we store in Blob.
const extForType = (type: string): string => {
  switch (type) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
};

// POST /api/edit/image/upload
//
// FormData fields:
//   slotId  — e.g. "portrait-gaming", "book-cover", "replay-v1"
//   file    — the image binary (browser-resized to ~1024px before upload)
//
// Returns: { ok: true, url, slotId }
//
// The URL is then persisted into content.json's `images` map via the
// standard POST /api/edit/save flow. Old URLs aren't deleted from Blob —
// they orphan harmlessly until a future cleanup job. (Cheaper than
// trying to atomically delete + write, and Khalil isn't going to fill
// the free 5 GB on a hobby site.)
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
      {
        ok: false,
        error:
          'Blob storage is not configured. Provision a Vercel Blob store and link it to this project.'
      },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad multipart payload.' }, { status: 400 });
  }

  const slotId = (form.get('slotId') as string | null)?.trim();
  const file = form.get('file');

  if (!slotId) {
    return NextResponse.json({ ok: false, error: 'Missing slotId.' }, { status: 400 });
  }
  if (!isValidImageSlotId(slotId)) {
    return NextResponse.json({ ok: false, error: `Unknown image slot: ${slotId}` }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Missing file.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Image too large (max ${Math.floor(MAX_BYTES / 1024 / 1024)} MB).` },
      { status: 413 }
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported type: ${file.type}` },
      { status: 415 }
    );
  }

  const ext = extForType(file.type);
  // Timestamped path so old uploads orphan rather than overwrite — that
  // way an editor mistake is one save away from being recoverable, and
  // the browser can't serve a stale cached URL after the swap.
  const path = `images/${slotId}-${Date.now()}.${ext}`;

  try {
    const blob = await put(path, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false
    });
    return NextResponse.json({ ok: true, url: blob.url, slotId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    return NextResponse.json(
      { ok: false, error: `Blob upload failed: ${message}` },
      { status: 502 }
    );
  }
};
