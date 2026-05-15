// YouTube Data API v3 helper. Cached at the fetch level so all callers
// (the API route, the server-rendered Videos section) share one round-trip
// per 10-minute window.

const REVALIDATE_S = 600;
const CHANNEL_HANDLE = 'khalilgaming2020';
const MAX_VIDEOS = 6;

// YouTube serves a fixed set of thumbnail resolutions per video. We expose the
// most useful ones so the UI can pick the right size per slot — pulling maxres
// for a 200px side card wastes ~10x the bytes.
export interface VideoThumbnails {
  /** 320×180 — for the small side cards. */
  medium: string;
  /** 480×360 — for the featured card on phones. */
  high: string;
  /** 1280×720 or best available — for the featured card on wide screens. */
  large: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnails: VideoThumbnails;
  viewCount: number | null;
  publishedAt: string;
  durationSeconds: number | null;
  isLive: boolean;
}

export interface VideosResult {
  videos: VideoItem[];
  /** Set when we couldn't fetch (no key, quota, network); render the fallback UI. */
  error: 'no_api_key' | 'fetch_failed' | 'channel_not_found' | null;
}

let cachedChannelId: string | null = null;

const apiKey = (): string | null => process.env.YOUTUBE_API_KEY?.trim() || null;

const resolveChannelId = async (): Promise<string | null> => {
  const envId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (envId) return envId;
  if (cachedChannelId) return cachedChannelId;
  const key = apiKey();
  if (!key) return null;

  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'contentDetails');
  url.searchParams.set('forHandle', `@${CHANNEL_HANDLE}`);
  url.searchParams.set('key', key);

  const res = await fetch(url.toString(), { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) return null;
  const data = await res.json() as { items?: Array<{ id: string }> };
  const id = data.items?.[0]?.id ?? null;
  if (id) cachedChannelId = id;
  return id;
};

const parseIsoDuration = (iso: string): number | null => {
  // PT#H#M#S
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return null;
  const h = parseInt(m[1] ?? '0', 10);
  const min = parseInt(m[2] ?? '0', 10);
  const s = parseInt(m[3] ?? '0', 10);
  return h * 3600 + min * 60 + s;
};

interface PlaylistItemsResponse {
  items?: Array<{
    contentDetails?: { videoId?: string };
  }>;
}

interface VideosResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: Record<string, { url?: string }>;
      liveBroadcastContent?: string; // 'live' | 'upcoming' | 'none'
    };
    statistics?: { viewCount?: string };
    contentDetails?: { duration?: string };
    liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string };
  }>;
}

export const getRecentVideos = async (): Promise<VideosResult> => {
  const key = apiKey();
  if (!key) return { videos: [], error: 'no_api_key' };

  try {
    const channelId = await resolveChannelId();
    if (!channelId) return { videos: [], error: 'channel_not_found' };

    // Uploads playlist is the channel ID with 'UC' → 'UU'.
    const uploadsPlaylistId = channelId.startsWith('UC')
      ? `UU${channelId.slice(2)}`
      : channelId;

    const itemsUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    itemsUrl.searchParams.set('part', 'contentDetails');
    itemsUrl.searchParams.set('playlistId', uploadsPlaylistId);
    itemsUrl.searchParams.set('maxResults', String(MAX_VIDEOS));
    itemsUrl.searchParams.set('key', key);

    const itemsRes = await fetch(itemsUrl.toString(), { next: { revalidate: REVALIDATE_S } });
    if (!itemsRes.ok) return { videos: [], error: 'fetch_failed' };
    const itemsData = await itemsRes.json() as PlaylistItemsResponse;
    const ids = (itemsData.items ?? [])
      .map(i => i.contentDetails?.videoId)
      .filter((id): id is string => !!id);
    if (ids.length === 0) return { videos: [], error: null };

    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'snippet,statistics,contentDetails,liveStreamingDetails');
    videosUrl.searchParams.set('id', ids.join(','));
    videosUrl.searchParams.set('key', key);

    const videosRes = await fetch(videosUrl.toString(), { next: { revalidate: REVALIDATE_S } });
    if (!videosRes.ok) return { videos: [], error: 'fetch_failed' };
    const videosData = await videosRes.json() as VideosResponse;

    const videos: VideoItem[] = (videosData.items ?? []).map(v => {
      const t = v.snippet?.thumbnails ?? {};
      const medium = t.medium?.url || t.default?.url || '';
      const high = t.high?.url || medium;
      const large = t.maxres?.url || t.standard?.url || high;
      const isLive = v.snippet?.liveBroadcastContent === 'live'
        || (Boolean(v.liveStreamingDetails?.actualStartTime) && !v.liveStreamingDetails?.actualEndTime);
      return {
        id: v.id,
        title: v.snippet?.title ?? 'Untitled',
        thumbnails: { medium, high, large },
        viewCount: v.statistics?.viewCount ? parseInt(v.statistics.viewCount, 10) : null,
        publishedAt: v.snippet?.publishedAt ?? '',
        durationSeconds: v.contentDetails?.duration ? parseIsoDuration(v.contentDetails.duration) : null,
        isLive
      };
    });

    // Live first, then most recent.
    videos.sort((a, b) => {
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      return b.publishedAt.localeCompare(a.publishedAt);
    });

    return { videos, error: null };
  } catch {
    return { videos: [], error: 'fetch_failed' };
  }
};

export const formatViews = (n: number | null): string => {
  if (n === null) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K views`;
  return `${n} views`;
};

export const formatRelative = (iso: string): string => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = (Date.now() - then) / 1000;
  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const buckets: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'],
    [3600, 'minute'],
    [86_400, 'hour'],
    [604_800, 'day'],
    [2_592_000, 'week'],
    [31_536_000, 'month']
  ];
  for (let i = 0; i < buckets.length; i++) {
    const [divisor, unit] = buckets[i]!;
    if (diffSec < divisor) {
      const prev = i === 0 ? 1 : buckets[i - 1]![0];
      return fmt.format(-Math.round(diffSec / prev), unit);
    }
  }
  return fmt.format(-Math.round(diffSec / 31_536_000), 'year');
};
