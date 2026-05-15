import { NextResponse } from 'next/server';
import { issueToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/edit-session';

export const POST = async (req: Request) => {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request.' }, { status: 400 });
  }
  const expected = process.env.EDIT_PASSWORD?.trim();
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'Editing is not set up yet (no EDIT_PASSWORD).' }, { status: 500 });
  }
  if (!body.password || body.password !== expected) {
    return NextResponse.json({ ok: false, error: 'Wrong password.' }, { status: 401 });
  }
  const token = issueToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });
  return res;
};
