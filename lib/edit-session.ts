// Tiny HMAC-signed session token for the /edit gate. Avoids pulling in a JWT lib.
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'khalil-edit-session';
const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

const secret = (): string => {
  const s = process.env.EDIT_SESSION_SECRET?.trim();
  if (!s) throw new Error('EDIT_SESSION_SECRET not configured');
  return s;
};

const sign = (payload: string): string => createHmac('sha256', secret()).update(payload).digest('base64url');

export const issueToken = (): string => {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
};

export const verifyToken = (token: string | undefined | null): boolean => {
  if (!token) return false;
  const idx = token.indexOf('.');
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  const expiresAt = parseInt(payload, 10);
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return false;
  return true;
};

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
