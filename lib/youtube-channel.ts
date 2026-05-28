// YouTube Data API v3 — channel-level statistics + bio. Cached at the
// fetch level (10 min) so all callers (the public hero render, the /edit
// intel panel, the /api/channel-stats route) share one round-trip per
// window.
//
// Reuses the channel-id resolution from lib/youtube.ts's environment
// variable / cached lookup pattern.

const REVALIDATE_S = 600;
const CHANNEL_HANDLE = 'khalilgaming2020';

export interface ChannelStats {
  /** null when YouTube hides the count (channel owner toggled it off). */
  subscriberCount: number | null;
  viewCount: number | null;
  videoCount: number | null;
  description: string;
  title: string;
  thumbnailUrl: string | null;
  hidden: boolean;
  /** ISO timestamp of when this snapshot was produced. */
  fetchedAt: string;
}

const apiKey = (): string | null => process.env.YOUTUBE_API_KEY?.trim() || null;

// Module-scoped channel-id cache. We re-resolve only once per cold start.
let cachedChannelId: string | null = null;

const resolveChannelId = async (): Promise<string | null> => {
  const envId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (envId) return envId;
  if (cachedChannelId) return cachedChannelId;
  const key = apiKey();
  if (!key) return null;

  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'id');
  url.searchParams.set('forHandle', `@${CHANNEL_HANDLE}`);
  url.searchParams.set('key', key);

  const res = await fetch(url.toString(), { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: Array<{ id: string }> };
  const id = data.items?.[0]?.id ?? null;
  if (id) cachedChannelId = id;
  return id;
};

interface ChannelDetailResponse {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
    statistics?: {
      viewCount?: string;
      subscriberCount?: string;
      hiddenSubscriberCount?: boolean;
      videoCount?: string;
    };
  }>;
}

/** Returns null on any failure (no key, no channel, network error).
 *  Callers must handle null by falling back to manualValue. */
export const getChannelStats = async (
  options?: { bustCache?: boolean }
): Promise<ChannelStats | null> => {
  const key = apiKey();
  if (!key) return null;

  try {
    const channelId = await resolveChannelId();
    if (!channelId) return null;

    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.set('part', 'snippet,statistics');
    url.searchParams.set('id', channelId);
    url.searchParams.set('key', key);

    const res = await fetch(url.toString(), {
      next: options?.bustCache ? { revalidate: 0 } : { revalidate: REVALIDATE_S }
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ChannelDetailResponse;
    const item = data.items?.[0];
    if (!item) return null;

    const stats = item.statistics ?? {};
    const snippet = item.snippet ?? {};
    const hidden = stats.hiddenSubscriberCount === true;
    const thumbs = snippet.thumbnails ?? {};
    const thumbnailUrl =
      thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || null;

    return {
      subscriberCount: hidden
        ? null
        : stats.subscriberCount
          ? parseInt(stats.subscriberCount, 10)
          : null,
      viewCount: stats.viewCount ? parseInt(stats.viewCount, 10) : null,
      videoCount: stats.videoCount ? parseInt(stats.videoCount, 10) : null,
      description: snippet.description ?? '',
      title: snippet.title ?? '',
      thumbnailUrl,
      hidden,
      fetchedAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
};
