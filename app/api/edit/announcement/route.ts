import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifyToken } from '@/lib/edit-session';
import {
  newAnnouncementId,
  pruneHistory,
  validateAnnouncement,
  type Announcement
} from '@/lib/announcement';
import { commitAnnouncements, readAnnouncementsFresh } from '@/lib/announcement-store';

// Auth-gated POST. Validates the body, assigns server-side id + firedAt
// (so clients can't backdate), prepends to the history, and commits.
export const POST = async (req: Request) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!verifyToken(token)) {
    return NextResponse.json(
      { ok: false, error: 'Your session expired. Log in again.' },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad payload.' }, { status: 400 });
  }

  const result = validateAnnouncement(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const fresh = await readAnnouncementsFresh();
  const announcement: Announcement = {
    id: newAnnouncementId(),
    firedAt: Date.now(),
    ...result.value
  };
  // Newest first; prune anything past its TTL + 7d
  const items = pruneHistory([announcement, ...fresh.items]);

  const commit = await commitAnnouncements(
    { items },
    `edit: fire announcement (${result.value.payload}/${result.value.fuse})`
  );
  if (!commit.ok) {
    return NextResponse.json(
      { ok: false, error: commit.error ?? 'Launch failed.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, announcement });
};
