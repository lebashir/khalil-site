// Site-wide announcements. The MessageLauncher plunger in /edit commits a
// new entry into announcements.json; the homepage polls /api/announcement
// and renders <AnnouncementOverlay> when one is active.

export type AnnouncementFuse = 'now' | 'visit' | 'refresh' | '1h';
export type AnnouncementPayload = 'confetti' | 'gold' | 'neon' | 'fire' | 'goal' | 'cake';

export interface Announcement {
  id: string;
  message: string;
  payload: AnnouncementPayload;
  fuse: AnnouncementFuse;
  /** ms since epoch when the plunger was pressed. */
  firedAt: number;
}

export interface AnnouncementsFile {
  /** Rolling history — newest first. Cap kept short so the file stays small. */
  items: Announcement[];
}

export const MAX_MESSAGE_LEN = 120;
export const MAX_HISTORY = 12;

const VALID_PAYLOADS: AnnouncementPayload[] = [
  'confetti',
  'gold',
  'neon',
  'fire',
  'goal',
  'cake'
];

const VALID_FUSES: AnnouncementFuse[] = ['now', 'visit', 'refresh', '1h'];

// Per-fuse TTL — how long after triggerAt the announcement stays "active".
// Tight on NOW (5min) so it doesn't ghost; longer on visit so first-visit
// guests in different timezones still catch it.
const TTL_MS: Record<AnnouncementFuse, number> = {
  now: 5 * 60 * 1000,
  visit: 24 * 60 * 60 * 1000,
  refresh: 60 * 60 * 1000,
  '1h': 5 * 60 * 1000
};

const ONE_HOUR_MS = 60 * 60 * 1000;

// When the announcement begins broadcasting. For '1h' fuse, it's an hour
// after firedAt; for all others, it's firedAt itself.
export const triggerAt = (a: Announcement): number =>
  a.fuse === '1h' ? a.firedAt + ONE_HOUR_MS : a.firedAt;

export const expiresAt = (a: Announcement): number => triggerAt(a) + TTL_MS[a.fuse];

export const isActive = (a: Announcement, now: number = Date.now()): boolean => {
  const start = triggerAt(a);
  return now >= start && now < expiresAt(a);
};

// Latest active announcement (highest firedAt). Returns null when nothing
// is currently broadcasting.
export const pickActive = (
  items: ReadonlyArray<Announcement>,
  now: number = Date.now()
): Announcement | null => {
  let best: Announcement | null = null;
  for (const item of items) {
    if (!isActive(item, now)) continue;
    if (!best || item.firedAt > best.firedAt) best = item;
  }
  return best;
};

// Drops items more than 7 days past their expiry — keeps the file small.
export const pruneHistory = (
  items: ReadonlyArray<Announcement>,
  now: number = Date.now()
): Announcement[] => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  return items.filter((item) => expiresAt(item) + SEVEN_DAYS > now).slice(0, MAX_HISTORY);
};

export type AnnouncementInput = Omit<Announcement, 'id' | 'firedAt'>;

export type AnnouncementValidation =
  | { ok: true; value: AnnouncementInput }
  | { ok: false; error: string };

// Validates a POST body from /api/edit/announcement. Doesn't assign id or
// firedAt — the server does that so clients can't backdate or replay.
export const validateAnnouncement = (raw: unknown): AnnouncementValidation => {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Bad payload.' };
  const c = raw as Record<string, unknown>;

  const messageRaw = typeof c.message === 'string' ? c.message.trim() : '';
  if (!messageRaw) return { ok: false, error: 'Message is empty.' };
  if (messageRaw.length > MAX_MESSAGE_LEN) {
    return { ok: false, error: `Message is too long (max ${MAX_MESSAGE_LEN}).` };
  }

  if (typeof c.payload !== 'string' || !(VALID_PAYLOADS as string[]).includes(c.payload)) {
    return { ok: false, error: 'Unknown payload.' };
  }
  if (typeof c.fuse !== 'string' || !(VALID_FUSES as string[]).includes(c.fuse)) {
    return { ok: false, error: 'Unknown fuse.' };
  }

  return {
    ok: true,
    value: {
      message: messageRaw,
      payload: c.payload as AnnouncementPayload,
      fuse: c.fuse as AnnouncementFuse
    }
  };
};

// id generator — uses crypto.randomUUID when available, falls back to a
// timestamped string. Server-only, so the fallback is only here for
// older Node runtimes the editor host might still use.
export const newAnnouncementId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `ann_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};
