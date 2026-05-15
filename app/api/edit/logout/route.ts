import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/edit-session';

export const POST = async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
};
