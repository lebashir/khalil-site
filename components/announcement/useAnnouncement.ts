'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Announcement } from '@/lib/announcement';

const POLL_MS = 15000;
const SEEN_COOKIE_PREFIX = 'khalil_ann_';
const SEEN_COOKIE_MAX_AGE_S = 7 * 24 * 60 * 60; // 7 days

const hasSeen = (id: string): boolean => {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split('; ')
    .some((c) => c.startsWith(`${SEEN_COOKIE_PREFIX}${id}=`));
};

const markSeen = (id: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${SEEN_COOKIE_PREFIX}${id}=1; max-age=${SEEN_COOKIE_MAX_AGE_S}; path=/; SameSite=Lax`;
};

interface UseAnnouncementResult {
  announcement: Announcement | null;
  dismiss: () => void;
}

// Polls /api/announcement every POLL_MS. Filters by the per-id seen cookie
// (except for the 'refresh' fuse, which always shows during its window).
export const useAnnouncement = (): UseAnnouncementResult => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    let alive = true;
    let controller: AbortController | null = null;

    const poll = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch('/api/announcement', {
          cache: 'no-store',
          signal: controller.signal
        });
        if (!res.ok || !alive) return;
        const data = (await res.json()) as { announcement: Announcement | null };
        if (!alive) return;

        const next = data.announcement;
        if (!next) {
          setAnnouncement(null);
          return;
        }
        // refresh fuse re-shows on every reload — don't filter by seen cookie
        if (next.fuse !== 'refresh' && hasSeen(next.id)) {
          setAnnouncement(null);
          return;
        }
        setAnnouncement((prev) => (prev?.id === next.id ? prev : next));
      } catch {
        // network errors are silent — try next tick
      }
    };

    poll();
    const interval = window.setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, []);

  const dismiss = useCallback(() => {
    setAnnouncement((current) => {
      if (current) markSeen(current.id);
      return null;
    });
  }, []);

  return { announcement, dismiss };
};
