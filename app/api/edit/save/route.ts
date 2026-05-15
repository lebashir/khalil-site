import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifyToken } from '@/lib/edit-session';
import { validateContent } from '@/lib/content';
import { commitContent } from '@/lib/github';

export const POST = async (req: Request) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ ok: false, errors: ['Your session expired. Log in again.'] }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['Bad payload.'] }, { status: 400 });
  }

  const result = validateContent(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }

  const commit = await commitContent(result.content, 'edit: update site content via /edit');
  if (!commit.ok) {
    return NextResponse.json({ ok: false, errors: [commit.error ?? 'Save failed.'] }, { status: 502 });
  }

  return NextResponse.json({ ok: true, commitSha: commit.commitSha });
};
