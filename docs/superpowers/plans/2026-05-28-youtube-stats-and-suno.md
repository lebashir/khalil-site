# YouTube Stats Wiring + BANGERS Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire YouTube subscriber count, total channel views, total video count, channel description, and per-video like counts into the Khalil site (rendered as floating tags on the hero, with a manual/auto toggle per slot), and add a `BANGERS` section between REPLAYS and ABOUT for Khalil's Suno-generated AI songs (MP3 + cover uploaded to Vercel Blob, custom inline player).

**Architecture:** Extends the existing `content.json` → `/edit` → GitHub-commit → rebuild pipeline. A new server-side library (`lib/youtube-channel.ts`) fetches channel-level stats with 10-minute cache, mirroring the existing video-fetch pattern. The hero replaces its two hardcoded `FloatingTag` calls with a loop over a new `content.floatingTags[4]` array, each entry having `source: 'manual' | 'subs' | 'views' | 'videos' | 'pinnedLikes'` and a `manualValue` fallback. Songs go into a new `content.songs[]` array (max 12); the audio file uploads through a new `/api/edit/song/upload` route (with server-side duration probe via `music-metadata`); cover art reuses the existing image-upload route with a new slot pattern. Public site renders a custom inline `<audio>` player with single-track playback (one song at a time).

**Tech Stack:** Next.js 15 App Router · React 19 · TypeScript · Vercel Blob (already used) · YouTube Data API v3 (already used) · `music-metadata` npm package (NEW dependency). No test framework — verification is `pnpm typecheck` + runtime preview checks.

**Reference spec:** [docs/superpowers/specs/2026-05-28-youtube-stats-and-suno-design.md](../specs/2026-05-28-youtube-stats-and-suno-design.md)

---

## Verification commands used throughout

- **Typecheck:** `pnpm typecheck` — should print no errors
- **Build:** `pnpm build` — use sparingly, slow; run before deploying
- **Dev server:** `pnpm dev` — http://localhost:3000
- **API smoke test:** `curl -s http://localhost:3000/api/<route> | jq` (or `cat`)

---

## Task 1: Extend `lib/content.ts` schema with `floatingTags`, `songs`, and manual-override fields

**Files:**
- Modify: `lib/content.ts`
- Modify: `content.json`

- [ ] **Step 1: Add new types and FIELD_LIMITS entries to `lib/content.ts`**

Locate the existing exports near the top of `lib/content.ts` (around line 35 where `VideoTier` is defined). Add immediately after the `VideoTier` definition:

```ts
export type TagSource = 'manual' | 'subs' | 'views' | 'videos' | 'pinnedLikes';
export type TagPosition = 'tl' | 'tr' | 'bl' | 'br';

export interface FloatingTagConfig {
  enabled: boolean;
  source: TagSource;
  label: string;
  manualValue: string;
  position: TagPosition;
}

export interface Song {
  id: string;
  title: string;
  audioUrl: string;
  coverUrl: string | null;
  durationSeconds: number | null;
  visible: boolean;
  sunoUrl?: string;
}
```

Locate the `SiteContent` interface (around line 66). Add three new fields at the end of the interface, just before the closing brace:

```ts
  /** Exactly 4 entries — one per corner of the hero polaroid. Disabled
   *  slots leave that corner empty. */
  floatingTags: FloatingTagConfig[];
  /** Ordered Suno-style songs. Max 12 entries. Invisible entries excluded
   *  from public site. */
  songs: Song[];
  /** Manual fallback values for the VIEWS / VIDEOS floating tags when
   *  source is 'manual' or when the wired API returns null. */
  viewsManual: number;
  videosManual: number;
```

Locate `FIELD_LIMITS` (around line 109). Add these entries inside the object:

```ts
  tagLabel: 8,
  tagValue: 12,
  songTitle: 80,
  songSunoUrl: 200,
```

- [ ] **Step 2: Extend `isValidImageSlotId` to accept song-cover slots**

Locate the `REPLAY_SLOT_RE` constant and `isValidImageSlotId` function (around line 101). Add a new constant right after `REPLAY_SLOT_RE`:

```ts
const SONG_COVER_SLOT_RE = /^song-cover-[a-z0-9]{6,12}$/;
```

Modify `isValidImageSlotId` to check the new pattern:

```ts
export const isValidImageSlotId = (id: string): boolean => {
  if ((STATIC_IMAGE_SLOTS as readonly string[]).includes(id)) return true;
  if (REPLAY_SLOT_RE.test(id)) return true;
  if (SONG_COVER_SLOT_RE.test(id)) return true;
  return false;
};
```

- [ ] **Step 3: Add helpers for validating the new shapes**

Above the `validateContent` function (around line 219), add these helper functions:

```ts
const VALID_TAG_SOURCES: TagSource[] = ['manual', 'subs', 'views', 'videos', 'pinnedLikes'];
const VALID_TAG_POSITIONS: TagPosition[] = ['tl', 'tr', 'bl', 'br'];
const BLOB_HOST_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

const buildFloatingTags = (
  raw: unknown,
  fallback: FloatingTagConfig[]
): FloatingTagConfig[] => {
  // Force exactly-4 length so the corners-model invariant always holds.
  // Anything malformed silently coerces to the fallback at that position.
  const arr = Array.isArray(raw) ? raw : [];
  const positions: TagPosition[] = ['tl', 'tr', 'bl', 'br'];
  return positions.map((position, i) => {
    const src = (arr[i] ?? {}) as Partial<FloatingTagConfig>;
    const fb = fallback[i] ?? {
      enabled: false,
      source: 'manual',
      label: '',
      manualValue: '',
      position
    };
    const source: TagSource = VALID_TAG_SOURCES.includes(src.source as TagSource)
      ? (src.source as TagSource)
      : fb.source;
    const label = typeof src.label === 'string'
      ? src.label.slice(0, FIELD_LIMITS.tagLabel)
      : fb.label;
    const manualValue = typeof src.manualValue === 'string'
      ? src.manualValue.slice(0, FIELD_LIMITS.tagValue)
      : fb.manualValue;
    const enabled = typeof src.enabled === 'boolean' ? src.enabled : fb.enabled;
    return { enabled, source, label, manualValue, position };
  });
};

const SONG_ID_RE = /^[a-z0-9]{6,12}$/;

const buildSong = (raw: unknown, errors: string[]): Song | null => {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<Song>;
  const id = typeof s.id === 'string' && SONG_ID_RE.test(s.id) ? s.id : null;
  if (!id) { errors.push('Song id is missing or malformed.'); return null; }
  const title = typeof s.title === 'string' ? s.title.trim().slice(0, FIELD_LIMITS.songTitle) : '';
  if (!title) { errors.push(`Song ${id}: title is required.`); return null; }
  const audioUrl = typeof s.audioUrl === 'string' ? s.audioUrl.trim() : '';
  if (!BLOB_HOST_RE.test(audioUrl)) {
    errors.push(`Song ${id}: audioUrl must be a Vercel Blob URL.`);
    return null;
  }
  const coverUrl = typeof s.coverUrl === 'string'
    ? (BLOB_HOST_RE.test(s.coverUrl.trim()) ? s.coverUrl.trim() : null)
    : null;
  const durationSeconds = typeof s.durationSeconds === 'number' && s.durationSeconds > 0 && s.durationSeconds <= 600
    ? Math.floor(s.durationSeconds)
    : null;
  const visible = typeof s.visible === 'boolean' ? s.visible : true;
  let sunoUrl: string | undefined;
  if (typeof s.sunoUrl === 'string' && s.sunoUrl.trim()) {
    const trimmed = s.sunoUrl.trim().slice(0, FIELD_LIMITS.songSunoUrl);
    if (isHttpUrl(trimmed)) sunoUrl = trimmed;
    else errors.push(`Song ${id}: sunoUrl must be a valid https URL.`);
  }
  return { id, title, audioUrl, coverUrl, durationSeconds, visible, sunoUrl };
};
```

- [ ] **Step 4: Wire validation into `validateContent`**

Inside `validateContent`, locate where `images` is validated (around line 404). Just before the final `const content: SiteContent = {...}` assembly, add:

```ts
  // Floating tags — exactly 4 (one per corner). Falls back to current
  // tags when raw is missing/malformed so partial save payloads round-trip.
  const floatingTags = buildFloatingTags(c.floatingTags, current.floatingTags);

  // Songs — max 12 visible+invisible. Each invalid entry silently dropped
  // with an error so the rest still saves.
  const songsRaw = Array.isArray(c.songs) ? c.songs : current.songs;
  const songs: Song[] = [];
  for (const raw of songsRaw) {
    const song = buildSong(raw, errors);
    if (song) songs.push(song);
    if (songs.length >= 12) break;
  }
  if (Array.isArray(c.songs) && c.songs.length > 12) {
    errors.push('Too many songs (max 12). Remove some before saving.');
  }

  // Manual fallback values for views/videos floating tags.
  const viewsManual = typeof c.viewsManual === 'number' && c.viewsManual >= 0
    ? Math.floor(c.viewsManual)
    : current.viewsManual ?? 0;
  const videosManual = typeof c.videosManual === 'number' && c.videosManual >= 0
    ? Math.floor(c.videosManual)
    : current.videosManual ?? 0;
```

Then add the new keys to the final `content` object literal:

```ts
    images,
    theme: themeSettings,
    floatingTags,
    songs,
    viewsManual,
    videosManual
```

- [ ] **Step 5: Add defaults to `content.json`**

Open `content.json`. After the existing `"theme": { ... }` block, add (matching the indentation):

```json
  "floatingTags": [
    { "enabled": true, "source": "views",  "label": "VIEWS",  "manualValue": "0",    "position": "tl" },
    { "enabled": true, "source": "subs",   "label": "SUBS",   "manualValue": "744",  "position": "tr" },
    { "enabled": true, "source": "manual", "label": "RANK",   "manualValue": "GOAT", "position": "bl" },
    { "enabled": true, "source": "videos", "label": "VIDEOS", "manualValue": "0",    "position": "br" }
  ],
  "songs": [],
  "viewsManual": 0,
  "videosManual": 0
```

(Add a comma after the previous `theme` object's closing brace.)

- [ ] **Step 6: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: Exits 0 with no output. If errors mention missing fields on `current` (such as `current.floatingTags`), revisit Step 1 — the `SiteContent` interface needs those fields declared.

- [ ] **Step 7: Verify dev server boots and the homepage renders**

Run: `pnpm dev` in one terminal, then in another:
```
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/intro
```
Expected: `200`. Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add lib/content.ts content.json
git commit -m "feat(content): add floatingTags + songs schema with validation"
```

---

## Task 2: Add `likeCount` to `VideoItem` and a `formatCount` helper

**Files:**
- Modify: `lib/youtube.ts`

- [ ] **Step 1: Add `likeCount` field to `VideoItem` interface**

Open `lib/youtube.ts`. Locate the `VideoItem` interface (around line 21). Add `likeCount` to the interface:

```ts
export interface VideoItem {
  id: string;
  title: string;
  thumbnails: VideoThumbnails;
  viewCount: number | null;
  likeCount: number | null;
  publishedAt: string;
  durationSeconds: number | null;
  isLive: boolean;
}
```

- [ ] **Step 2: Add `likeCount` to the parsed VideosResponse statistics shape**

In the `VideosResponse` interface (around line 77), update the `statistics` shape:

```ts
    statistics?: { viewCount?: string; likeCount?: string };
```

- [ ] **Step 3: Parse likeCount in the video mapper**

In `getRecentVideos`, locate the `videos.map(v => {...})` block (around line 128). Inside the returned object, add `likeCount` after `viewCount`:

```ts
        viewCount: v.statistics?.viewCount ? parseInt(v.statistics.viewCount, 10) : null,
        likeCount: v.statistics?.likeCount ? parseInt(v.statistics.likeCount, 10) : null,
```

- [ ] **Step 4: Add a `formatCount` helper**

After the existing `formatViews` function (around line 158), add:

```ts
/** Compact-formats any count: 421 → '421', 12_300 → '12K', 1_234_567 → '1.2M'.
 *  Returns '' for null. Used by the video card's like badge and by the
 *  floating-tag value resolver for VIEWS / VIDEOS / SUBS. */
export const formatCount = (n: number | null): string => {
  if (n === null) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};
```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0 with no output.

- [ ] **Step 6: Commit**

```bash
git add lib/youtube.ts
git commit -m "feat(youtube): add likeCount on VideoItem + formatCount helper"
```

---

## Task 3: Display likes on the public `VideoCard`

**Files:**
- Modify: `components/arena/VideoCard.tsx`

- [ ] **Step 1: Import `formatCount` alongside the existing imports**

At the top of `components/arena/VideoCard.tsx`, update the import line (line 6):

```ts
import { formatViews, formatRelative, formatCount } from '@/lib/youtube';
```

- [ ] **Step 2: Render likes inline next to views**

Locate the bottom info plate `▸ {views}` span (around line 317). Replace this block:

```tsx
          <span
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              color: tc[0],
              letterSpacing: 0.5,
              fontWeight: 700
            }}
          >
            ▸ {views}
          </span>
```

with:

```tsx
          <span
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              color: tc[0],
              letterSpacing: 0.5,
              fontWeight: 700
            }}
          >
            ▸ {views}
            {video.likeCount !== null && video.likeCount > 0 && !video.isLive && (
              <> · ♥ {formatCount(video.likeCount)}</>
            )}
          </span>
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 4: Visually verify likes appear on the cards**

Start the dev server: `pnpm dev` (background).
Use `preview_start` if not already running, then load `http://localhost:3000`.
Take a snapshot of the REPLAYS section. Each card with a non-zero like count should show `▸ 12K views · ♥ 421`. Cards from a live video should still show just `LIVE NOW`.

If the layout overflows on narrow viewports, accept it for now — the badge is small. The card content uses `WebkitLineClamp` so title overflow is handled.

- [ ] **Step 5: Commit**

```bash
git add components/arena/VideoCard.tsx
git commit -m "feat(arena): show like count inline on video cards"
```

---

## Task 4: Create `lib/youtube-channel.ts` — channel stats library

**Files:**
- Create: `lib/youtube-channel.ts`

- [ ] **Step 1: Create the file with the full implementation**

Create `lib/youtube-channel.ts`:

```ts
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
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 3: Commit**

```bash
git add lib/youtube-channel.ts
git commit -m "feat(youtube): add lib/youtube-channel for channel-level stats"
```

---

## Task 5: Add `GET /api/channel-stats` route

**Files:**
- Create: `app/api/channel-stats/route.ts`

- [ ] **Step 1: Create the route file**

Create `app/api/channel-stats/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { getChannelStats } from '@/lib/youtube-channel';

export const revalidate = 600;

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const bust = url.searchParams.get('bust') === '1';
  const stats = await getChannelStats({ bustCache: bust });
  if (!stats) {
    return NextResponse.json(
      { error: 'channel_stats_unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60' }
      }
    );
  }
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=1800'
    }
  });
};
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 3: Smoke-test the endpoint**

Start dev server (`pnpm dev`). In another terminal:

```bash
curl -s http://localhost:3000/api/channel-stats | head -c 400
```

Expected: JSON containing `subscriberCount`, `viewCount`, `videoCount`, `description`, etc. If `YOUTUBE_API_KEY` is missing, expect `{"error":"channel_stats_unavailable"}` with HTTP 503 — that's the documented fallback path; not a failure.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/api/channel-stats/route.ts
git commit -m "feat(api): GET /api/channel-stats with 10-min cache + bust query"
```

---

## Task 6: Render floating tags from `content.floatingTags` in the Hero

**Files:**
- Modify: `components/arena/Hero.tsx`
- Modify: `app/page.tsx`
- Modify: `components/arena/ArenaShell.tsx`

- [ ] **Step 1: Pass `channelStats` through from `app/page.tsx`**

Open `app/page.tsx`. Update the imports:

```ts
import { getChannelStats } from '@/lib/youtube-channel';
```

Then update the body of `HomePage` to fetch in parallel and pass through:

```ts
const HomePage = async () => {
  const cookieStore = await cookies();
  if (!cookieStore.get(INTRO_COOKIE_NAME)) {
    redirect('/intro');
  }

  const content = getContent();
  const [videoResult, channelStats] = await Promise.all([
    getRecentVideos(),
    getChannelStats()
  ]);
  return (
    <ArenaShell
      content={content}
      videos={videoResult.videos}
      videoError={videoResult.error}
      channelStats={channelStats}
    />
  );
};
```

- [ ] **Step 2: Accept `channelStats` in `ArenaShell` and forward to `Hero`**

Open `components/arena/ArenaShell.tsx`. Add an import:

```ts
import type { ChannelStats } from '@/lib/youtube-channel';
```

Update the `Props` interface:

```ts
interface Props {
  content: SiteContent;
  videos: VideoItem[];
  videoError: string | null;
  channelStats: ChannelStats | null;
}
```

Destructure `channelStats` in the component signature:

```ts
export const ArenaShell = ({ content, videos, videoError, channelStats }: Props) => {
```

Forward it to `Hero`:

```tsx
        <Hero mode={mode} theme={theme} size={size} content={content} videos={videos} channelStats={channelStats} />
```

(We pass `videos` because resolving `pinnedLikes` requires looking up the pinned video by id.)

- [ ] **Step 3: Add a value-resolver helper to `Hero.tsx`**

Open `components/arena/Hero.tsx`. Add imports at the top:

```ts
import type { FloatingTagConfig, TagPosition } from '@/lib/content';
import type { ChannelStats } from '@/lib/youtube-channel';
import type { VideoItem } from '@/lib/youtube';
import { formatCount } from '@/lib/youtube';
```

Update the `Props` interface to receive the new data:

```ts
interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  content: SiteContent;
  videos: VideoItem[];
  channelStats: ChannelStats | null;
}
```

Update the function signature destructuring accordingly:

```ts
export const Hero = ({ mode, theme, size, content, videos, channelStats }: Props) => {
```

Above the `Hero` component (or below `Props`), add resolver helpers:

```ts
// Resolves a floating tag's displayed value. Order of preference:
// 1. Live wired source (when channelStats / video data is present)
// 2. Manual override value (tag.manualValue)
// 3. Empty string → caller hides the slot
const resolveTagValue = (
  tag: FloatingTagConfig,
  channelStats: ChannelStats | null,
  content: SiteContent,
  videos: VideoItem[]
): string => {
  switch (tag.source) {
    case 'manual':
      return tag.manualValue;
    case 'subs': {
      const live = channelStats?.subscriberCount;
      if (typeof live === 'number') return formatCount(live);
      // Fall back to content.subs.current (the existing manual value) so
      // existing sites without an API key keep rendering 744.
      if (content.subs.current > 0) return String(content.subs.current);
      return tag.manualValue;
    }
    case 'views': {
      const live = channelStats?.viewCount;
      if (typeof live === 'number') return formatCount(live);
      if (content.viewsManual > 0) return formatCount(content.viewsManual);
      return tag.manualValue;
    }
    case 'videos': {
      const live = channelStats?.videoCount;
      if (typeof live === 'number') return String(live);
      if (content.videosManual > 0) return String(content.videosManual);
      return tag.manualValue;
    }
    case 'pinnedLikes': {
      const pinned = videos.find(v => v.id === content.videos.pinnedId);
      const live = pinned?.likeCount;
      if (typeof live === 'number' && live > 0) return formatCount(live);
      return tag.manualValue;
    }
  }
};

// Maps a tag's logical position (corner) to the responsive style object
// FloatingTag expects. Mirrors the offsets used by the previous
// hardcoded SUBS and RANK tags so layouts don't shift.
const positionFor = (
  pos: TagPosition,
  isDesktop: boolean,
  isTablet: boolean
): { top?: number; right?: number; bottom?: number; left?: number } => {
  switch (pos) {
    case 'tr':
      return {
        right: isDesktop ? -16 : isTablet ? 24 : 8,
        top: isDesktop ? 28 : isTablet ? 16 : 4
      };
    case 'tl':
      return {
        left: isDesktop ? -16 : isTablet ? 24 : 8,
        top: isDesktop ? 28 : isTablet ? 16 : 4
      };
    case 'br':
      return {
        right: isDesktop ? -16 : isTablet ? 24 : 8,
        bottom: isDesktop ? 70 : isTablet ? 30 : 14
      };
    case 'bl':
      return {
        left: isDesktop ? -16 : isTablet ? 24 : 8,
        bottom: isDesktop ? 70 : isTablet ? 30 : 14
      };
  }
};

const delayFor = (pos: TagPosition): string => {
  switch (pos) {
    case 'tr': return '0s';
    case 'tl': return '.4s';
    case 'br': return '.6s';
    case 'bl': return '.8s';
  }
};
```

- [ ] **Step 4: Replace the hardcoded `FloatingTag` block with a loop**

In `Hero.tsx`, find the existing block:

```tsx
      <FloatingTag
        label="SUBS"
        value={content.subs.current}
        theme={theme}
        position={{
          right: isDesktop ? -16 : isTablet ? 24 : 8,
          top: isDesktop ? 28 : isTablet ? 16 : 4
        }}
        delay="0s"
      />
      <FloatingTag
        label="RANK"
        value="GOAT"
        theme={theme}
        position={{
          left: isDesktop ? -16 : isTablet ? 24 : 8,
          bottom: isDesktop ? 70 : isTablet ? 30 : 14
        }}
        delay=".8s"
      />
```

Replace both with:

```tsx
      {content.floatingTags
        .filter(tag => tag.enabled)
        .map(tag => {
          const value = resolveTagValue(tag, channelStats, content, videos);
          if (!value) return null;
          return (
            <FloatingTag
              key={tag.position}
              label={tag.label}
              value={value}
              theme={theme}
              position={positionFor(tag.position, isDesktop, isTablet)}
              delay={delayFor(tag.position)}
            />
          );
        })}
```

- [ ] **Step 5: Verify typecheck**

`components/arena/FloatingTag.tsx` already declares `value: string | number`, so the string returned by `resolveTagValue` is accepted without changes.

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 6: Visually verify the hero**

Run `pnpm dev`. Load `http://localhost:3000` (clearing the intro cookie via DevTools if needed). The polaroid should show four floating tags (SUBS, VIEWS, RANK, VIDEOS) at the four corners. With a real `YOUTUBE_API_KEY` configured, SUBS/VIEWS/VIDEOS should pull live values; otherwise they fall back to the manual values from content.json.

Snapshot the hero. Confirm no console errors.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/arena/ArenaShell.tsx components/arena/Hero.tsx
git commit -m "feat(arena): render floating tags from content.floatingTags with live YouTube data"
```

---

## Task 7: `HeroTagsModule` in Mission Control (replaces `SubsModule` in LIVE STATUS)

**Files:**
- Create: `components/edit/deck/modules/HeroTagsModule.tsx`
- Modify: `components/edit/deck/ControlDeck.tsx`

- [ ] **Step 1: Create `HeroTagsModule.tsx`**

Create `components/edit/deck/modules/HeroTagsModule.tsx`:

```tsx
'use client';

import type {
  FloatingTagConfig,
  SiteContent,
  TagPosition,
  TagSource
} from '@/lib/content';
import { FIELD_LIMITS } from '@/lib/content';
import type { ChannelStats } from '@/lib/youtube-channel';
import type { VideoItem } from '@/lib/youtube';
import { formatCount } from '@/lib/youtube';
import { ED, FONT } from '../constants';
import { Panel, ToggleChip } from '../primitives';

interface Props {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  channelStats: ChannelStats | null;
  videos: VideoItem[];
  hideHeader?: boolean;
}

const SOURCE_LABELS: Record<TagSource, string> = {
  manual: '✎ MANUAL',
  subs: '⚡ SUBS',
  views: '⚡ VIEWS',
  videos: '⚡ VIDEOS',
  pinnedLikes: '⚡ PINNED ♥'
};

const SOURCES: TagSource[] = ['manual', 'subs', 'views', 'videos', 'pinnedLikes'];

const POSITION_LABEL: Record<TagPosition, string> = {
  tl: 'TOP-LEFT',
  tr: 'TOP-RIGHT',
  bl: 'BOTTOM-LEFT',
  br: 'BOTTOM-RIGHT'
};

// Resolves what the wired source would currently render — mirrors the
// public site's resolveTagValue but only the LIVE part (no fallback).
// We show this as a preview row so the editor knows what's on the site.
const livePreview = (
  source: TagSource,
  channelStats: ChannelStats | null,
  content: SiteContent,
  videos: VideoItem[]
): { value: string; available: boolean } => {
  switch (source) {
    case 'manual':
      return { value: '—', available: true };
    case 'subs': {
      const n = channelStats?.subscriberCount;
      return { value: typeof n === 'number' ? formatCount(n) : '—', available: typeof n === 'number' };
    }
    case 'views': {
      const n = channelStats?.viewCount;
      return { value: typeof n === 'number' ? formatCount(n) : '—', available: typeof n === 'number' };
    }
    case 'videos': {
      const n = channelStats?.videoCount;
      return { value: typeof n === 'number' ? String(n) : '—', available: typeof n === 'number' };
    }
    case 'pinnedLikes': {
      const pinned = videos.find(v => v.id === content.videos.pinnedId);
      const n = pinned?.likeCount;
      return { value: typeof n === 'number' ? formatCount(n) : '—', available: typeof n === 'number' };
    }
  }
};

const Slot = ({
  tag,
  index,
  content,
  setContent,
  channelStats,
  videos
}: {
  tag: FloatingTagConfig;
  index: number;
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  channelStats: ChannelStats | null;
  videos: VideoItem[];
}) => {
  const update = (patch: Partial<FloatingTagConfig>) => {
    const next = [...content.floatingTags];
    next[index] = { ...tag, ...patch };
    setContent({ ...content, floatingTags: next });
  };
  const preview = livePreview(tag.source, channelStats, content, videos);
  const wired = tag.source !== 'manual';

  return (
    <div
      style={{
        padding: 10,
        border: `1px solid ${tag.enabled ? ED.line : 'rgba(255,255,255,0.1)'}`,
        background: tag.enabled ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)',
        borderRadius: 3,
        opacity: tag.enabled ? 1 : 0.55,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: FONT.mono,
          fontSize: 9,
          letterSpacing: 1.4,
          color: ED.amber,
          textTransform: 'uppercase'
        }}
      >
        <span>{POSITION_LABEL[tag.position]}</span>
        <button
          type="button"
          onClick={() => update({ enabled: !tag.enabled })}
          style={{
            cursor: 'pointer',
            background: tag.enabled ? `${ED.green}22` : 'transparent',
            border: `1px solid ${tag.enabled ? ED.green : ED.line}`,
            color: tag.enabled ? ED.green : ED.inkDim,
            fontFamily: FONT.mono,
            fontSize: 8,
            padding: '2px 8px',
            letterSpacing: 1.4,
            borderRadius: 999,
            textTransform: 'uppercase'
          }}
        >
          {tag.enabled ? 'on' : 'off'}
        </button>
      </div>
      <input
        value={tag.label}
        maxLength={FIELD_LIMITS.tagLabel}
        onChange={(e) => update({ label: e.target.value.toUpperCase() })}
        placeholder="LABEL"
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${ED.line}`,
          color: ED.ink,
          fontFamily: FONT.stencil,
          fontSize: 13,
          padding: '6px 8px',
          letterSpacing: 1
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {SOURCES.map(s => (
          <ToggleChip
            key={s}
            active={tag.source === s}
            color={s === 'manual' ? ED.amber : ED.pink}
            onClick={() => update({ source: s })}
          >
            {SOURCE_LABELS[s]}
          </ToggleChip>
        ))}
      </div>
      {wired ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: 6,
            background: 'rgba(0,0,0,0.3)',
            border: `1px dashed ${preview.available ? ED.green : ED.line}`,
            borderRadius: 2
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 8,
              color: ED.inkDim,
              letterSpacing: 1.4,
              textTransform: 'uppercase'
            }}
          >
            live → <span style={{ color: preview.available ? ED.green : ED.red }}>{preview.value}</span>
          </span>
          <input
            value={tag.manualValue}
            maxLength={FIELD_LIMITS.tagValue}
            onChange={(e) => update({ manualValue: e.target.value })}
            placeholder="fallback (used when API down)"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${ED.line}`,
              color: ED.inkDim,
              fontFamily: FONT.mono,
              fontSize: 10,
              padding: '4px 6px'
            }}
          />
        </div>
      ) : (
        <input
          value={tag.manualValue}
          maxLength={FIELD_LIMITS.tagValue}
          onChange={(e) => update({ manualValue: e.target.value })}
          placeholder="value"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${ED.line}`,
            color: ED.ink,
            fontFamily: FONT.stencil,
            fontSize: 16,
            padding: '6px 8px',
            letterSpacing: 1
          }}
        />
      )}
    </div>
  );
};

export const HeroTagsModule = ({ content, setContent, channelStats, videos, hideHeader }: Props) => {
  const Body = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }}
    >
      {content.floatingTags.map((tag, i) => (
        <Slot
          key={tag.position}
          tag={tag}
          index={i}
          content={content}
          setContent={setContent}
          channelStats={channelStats}
          videos={videos}
        />
      ))}
    </div>
  );
  if (hideHeader) return Body;
  return (
    <Panel title="HERO TAGS" kicker="// 4 floating slots on the polaroid" accent={ED.amber}>
      {Body}
    </Panel>
  );
};
```

- [ ] **Step 2: Wire `HeroTagsModule` into the launch tab in `ControlDeck.tsx`**

Open `components/edit/deck/ControlDeck.tsx`. Add the import (after `SubsModule`):

```ts
import { HeroTagsModule } from './modules/HeroTagsModule';
```

Add `channelStats` to `ControlDeckProps`:

```ts
import type { ChannelStats } from '@/lib/youtube-channel';

interface ControlDeckProps {
  initialContent: SiteContent;
  videos: VideoItem[];
  channelStats: ChannelStats | null;
}
```

Update the component signature to destructure it:

```ts
export const ControlDeck = ({ initialContent, videos, channelStats }: ControlDeckProps) => {
```

Inside `LaunchTab`, add `channelStats` and `setContent` to `LaunchTabProps`:

```ts
interface LaunchTabProps {
  // ... existing ...
  channelStats: ChannelStats | null;
  setContent: (next: SiteContent) => void;
}
```

Then in the parent `ControlDeck`, pass them in:

```tsx
<LaunchTab
  // ... existing props ...
  channelStats={channelStats}
  setContent={setContent}
/>
```

Inside `LaunchTab`, replace the existing `liveStatusPanel` definition. Find:

```tsx
  const liveStatusPanel = (
    <Panel title="LIVE STATUS" kicker="// goes out next save" accent={ED.green}>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr'
        }}
      >
        <StatusModule hideHeader mood={content.mood} setMood={setMood} />
        <SubsModule hideHeader subs={content.subs} setSubs={setSubs} />
      </div>
    </Panel>
  );
```

Replace with:

```tsx
  const liveStatusPanel = (
    <Panel title="LIVE STATUS" kicker="// goes out next save" accent={ED.green}>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr'
        }}
      >
        <StatusModule hideHeader mood={content.mood} setMood={setMood} />
        <SubsModule hideHeader subs={content.subs} setSubs={setSubs} />
      </div>
    </Panel>
  );
  const heroTagsPanel = (
    <HeroTagsModule
      content={content}
      setContent={setContent}
      channelStats={channelStats}
      videos={videos}
    />
  );
```

In the mobile and desktop layouts further down, insert `{heroTagsPanel}` immediately after `{liveStatusPanel}`:

```tsx
  // mobile
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {launchWindow}
      {messageLauncher}
      {liveStatusPanel}
      {heroTagsPanel}
      {nowPlaying}
      {pinnedVideo}
      {themePicker}
    </div>
  );
```

```tsx
  // desktop
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1.15fr 1fr' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        {launchWindow}
        {liveStatusPanel}
        {heroTagsPanel}
        {nowPlaying}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        {messageLauncher}
        {pinnedVideo}
        {themePicker}
      </div>
    </div>
  );
```

- [ ] **Step 3: Update `app/edit/page.tsx` to fetch channel stats and forward**

Open `app/edit/page.tsx`. Add the import:

```ts
import { getChannelStats } from '@/lib/youtube-channel';
```

Inside `EditPage`, fetch channel stats in parallel with videos and pass to `ControlDeck`:

```ts
const [{ videos }, channelStats] = await Promise.all([
  getRecentVideos(),
  getChannelStats()
]);
return <ControlDeck initialContent={content} videos={videos} channelStats={channelStats} />;
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 5: Visually verify in /edit**

Run `pnpm dev`. Log in to `/edit`. The Mission Control tab should show a new `HERO TAGS` panel below `LIVE STATUS`, with 4 slots arranged in a 2×2 grid, each having a label input, source chips (MANUAL / SUBS / VIEWS / VIDEOS / PINNED ♥), the live preview row, and a manual-value input.

Toggle one slot off → the corner should disappear from the public hero on save+rebuild (deferred to Task 12 verification).

- [ ] **Step 6: Commit**

```bash
git add components/edit/deck/modules/HeroTagsModule.tsx components/edit/deck/ControlDeck.tsx app/edit/page.tsx
git commit -m "feat(edit): HeroTagsModule in Mission Control for floating tag wiring"
```

---

## Task 8: `YouTubeIntelModule` — read-only intel panel

**Files:**
- Create: `components/edit/deck/modules/YouTubeIntelModule.tsx`
- Modify: `components/edit/deck/ControlDeck.tsx`

- [ ] **Step 1: Create `YouTubeIntelModule.tsx`**

Create `components/edit/deck/modules/YouTubeIntelModule.tsx`:

```tsx
'use client';

import { useCallback, useState } from 'react';
import type { ChannelStats } from '@/lib/youtube-channel';
import { ED, FONT } from '../constants';
import { Panel } from '../primitives';

interface Props {
  initial: ChannelStats | null;
}

const relTime = (iso: string): string => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const sec = Math.round((Date.now() - t) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  return `${Math.round(sec / 3600)}h ago`;
};

export const YouTubeIntelModule = ({ initial }: Props) => {
  const [stats, setStats] = useState<ChannelStats | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initial ? null : 'no_stats');
  const [bioExpanded, setBioExpanded] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/channel-stats?bust=1', { cache: 'no-store' });
      if (!res.ok) {
        setError('fetch_failed');
        return;
      }
      const data = (await res.json()) as ChannelStats;
      setStats(data);
    } catch {
      setError('fetch_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const synced = stats ? relTime(stats.fetchedAt) : '';
  const bio = stats?.description ?? '';
  const showBio = bioExpanded || bio.length <= 200;
  const bioPreview = showBio ? bio : `${bio.slice(0, 200)}…`;

  return (
    <Panel
      title="YOUTUBE INTEL"
      kicker={synced ? `// synced ${synced}` : '// unavailable'}
      accent={ED.pink}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              color: ED.inkDim,
              letterSpacing: 1.4,
              textTransform: 'uppercase'
            }}
          >
            {stats?.title || '— channel —'}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{
              cursor: loading ? 'wait' : 'pointer',
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${ED.pink}`,
              color: ED.pink,
              fontFamily: FONT.mono,
              fontSize: 9,
              letterSpacing: 1.4,
              padding: '4px 10px',
              textTransform: 'uppercase'
            }}
          >
            {loading ? '…' : 'refresh'}
          </button>
        </div>
        {error === 'no_stats' && (
          <div style={{ color: ED.red, fontFamily: FONT.mono, fontSize: 10 }}>
            ⚠ no YOUTUBE_API_KEY set — add it to .env.local
          </div>
        )}
        {error === 'fetch_failed' && (
          <div style={{ color: ED.red, fontFamily: FONT.mono, fontSize: 10 }}>
            ⚠ couldn't reach YouTube — try refresh
          </div>
        )}
        {stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <Stat label="SUBS" value={stats.hidden ? '—' : (stats.subscriberCount ?? '—')} note={stats.hidden ? 'hidden' : undefined} />
              <Stat label="VIEWS" value={stats.viewCount ?? '—'} />
              <Stat label="VIDEOS" value={stats.videoCount ?? '—'} />
            </div>
            {bio && (
              <div
                style={{
                  padding: 8,
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${ED.line}`,
                  borderRadius: 2,
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  color: ED.inkDim,
                  letterSpacing: 0.2,
                  whiteSpace: 'pre-wrap'
                }}
              >
                <div style={{ color: ED.amber, marginBottom: 4 }}>// channel bio</div>
                {bioPreview}
                {bio.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded(v => !v)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: ED.pink,
                      cursor: 'pointer',
                      marginLeft: 6,
                      fontFamily: FONT.mono,
                      fontSize: 10
                    }}
                  >
                    [{bioExpanded ? 'collapse' : 'show more'}]
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
};

const Stat = ({ label, value, note }: { label: string; value: number | string; note?: string }) => (
  <div
    style={{
      padding: 8,
      background: 'rgba(0,0,0,0.4)',
      border: `1px solid ${ED.line}`,
      borderRadius: 2,
      textAlign: 'center'
    }}
  >
    <div style={{ fontFamily: FONT.mono, fontSize: 8, color: ED.amber, letterSpacing: 1.4 }}>
      {label}
    </div>
    <div style={{ fontFamily: FONT.stencil, fontSize: 18, color: ED.ink, marginTop: 2 }}>
      {value}
    </div>
    {note && (
      <div style={{ fontFamily: FONT.mono, fontSize: 7, color: ED.inkDim, marginTop: 2 }}>
        ({note})
      </div>
    )}
  </div>
);
```

- [ ] **Step 2: Add it to `LaunchTab` in `ControlDeck.tsx`**

Add the import in `ControlDeck.tsx`:

```ts
import { YouTubeIntelModule } from './modules/YouTubeIntelModule';
```

Inside `LaunchTab`, define:

```tsx
  const youTubeIntel = (
    <YouTubeIntelModule initial={channelStats} />
  );
```

Insert `{youTubeIntel}` below the message launcher in both mobile and desktop layouts:

```tsx
  // mobile — after messageLauncher
  {messageLauncher}
  {youTubeIntel}
  {liveStatusPanel}
  // ...
```

```tsx
  // desktop — in the right column, after messageLauncher
  <div ...>
    {messageLauncher}
    {youTubeIntel}
    {pinnedVideo}
    {themePicker}
  </div>
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 4: Visually verify**

Reload `/edit`. The `YOUTUBE INTEL` panel should appear below the message launcher. With a real `YOUTUBE_API_KEY` it shows live numbers + the channel bio (collapsible if over 200 chars). Without a key, it shows the error banner.

Click `refresh` → the panel should reflect a fresh fetch (the "synced Xs ago" updates).

- [ ] **Step 5: Commit**

```bash
git add components/edit/deck/modules/YouTubeIntelModule.tsx components/edit/deck/ControlDeck.tsx
git commit -m "feat(edit): YouTubeIntelModule with read-only channel bio + stats"
```

---

## Task 9: Install `music-metadata` and add the audio upload endpoint

**Files:**
- Modify: `package.json` (via pnpm)
- Create: `app/api/edit/song/upload/route.ts`

- [ ] **Step 1: Install `music-metadata`**

Run: `pnpm add music-metadata`

Expected: `package.json` and `pnpm-lock.yaml` update with the new dependency.

- [ ] **Step 2: Create the upload route**

Create `app/api/edit/song/upload/route.ts`:

```ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { parseBuffer } from 'music-metadata';
import { SESSION_COOKIE, verifyToken } from '@/lib/edit-session';

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_SECONDS = 600; // 10 minutes
const ALLOWED_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-m4a',
  'audio/wave'
]);

const extForType = (type: string): string => {
  switch (type) {
    case 'audio/mp4':
    case 'audio/x-m4a':
      return 'm4a';
    case 'audio/wav':
    case 'audio/wave':
      return 'wav';
    default:
      return 'mp3';
  }
};

// Generates a short, slug-safe content hash from the bytes. We use this
// as the public Blob path so duplicate uploads dedupe naturally and the
// id stays stable across re-saves.
const contentHash = async (buf: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const hex = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 10);
};

// POST /api/edit/song/upload — multipart/form-data, field 'file'.
// Returns { ok, audioUrl, durationSeconds, contentHash } on success.
// The client uses contentHash to generate a unique song.id.
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
      { ok: false, error: 'Blob storage is not configured.' },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad multipart payload.' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Missing file.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Audio too large (max ${Math.floor(MAX_BYTES / 1024 / 1024)} MB).` },
      { status: 413 }
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported audio type: ${file.type}` },
      { status: 415 }
    );
  }

  const ab = await file.arrayBuffer();
  const buf = new Uint8Array(ab);

  // Probe duration. If the file is malformed or music-metadata can't
  // determine duration, we keep going with null — the song still saves
  // and the card just shows no duration label.
  let durationSeconds: number | null = null;
  try {
    const meta = await parseBuffer(buf, file.type, { duration: true });
    if (meta.format.duration && meta.format.duration > 0) {
      durationSeconds = Math.round(meta.format.duration);
      if (durationSeconds > MAX_SECONDS) {
        return NextResponse.json(
          { ok: false, error: `Audio too long (max ${MAX_SECONDS / 60} min).` },
          { status: 400 }
        );
      }
    }
  } catch {
    // ignore — durationSeconds stays null
  }

  const hash = await contentHash(buf);
  const ext = extForType(file.type);
  const path = `songs/${hash}.${ext}`;

  try {
    const blob = await put(path, buf, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false
    });
    return NextResponse.json({
      ok: true,
      audioUrl: blob.url,
      durationSeconds,
      contentHash: hash
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    return NextResponse.json(
      { ok: false, error: `Blob upload failed: ${message}` },
      { status: 502 }
    );
  }
};
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0. If TypeScript complains about `music-metadata` types, ensure `@types/node` is up to date (already in devDependencies).

- [ ] **Step 4: Smoke-test the endpoint structure (auth gate only)**

Start dev server. Without a valid session cookie:

```bash
curl -s -X POST http://localhost:3000/api/edit/song/upload -F "file=@/dev/null;type=audio/mpeg" | head -c 200
```

Expected: `{"ok":false,"error":"Your session expired. Log in again."}` with HTTP 401.

Full audio-upload verification happens in Task 11 once the BangersEditor is wired up.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml app/api/edit/song/upload/route.ts
git commit -m "feat(api): POST /api/edit/song/upload with music-metadata duration probe"
```

---

## Task 10: BANGERS — public components (`Bangers`, `SongCard`, `BangersPlayer`)

**Files:**
- Create: `components/arena/Bangers.tsx`
- Create: `components/arena/SongCard.tsx`
- Create: `components/arena/BangersPlayer.tsx`

- [ ] **Step 1: Create the `BangersPlayer` context + provider**

Create `components/arena/BangersPlayer.tsx`:

```tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type { Song } from '@/lib/content';

interface PlayerState {
  playingId: string | null;
  progress: number; // 0–1
  togglePlay: (song: Song) => void;
  stop: () => void;
}

const Ctx = createContext<PlayerState | null>(null);

export const useBangersPlayer = (): PlayerState => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBangersPlayer outside provider');
  return ctx;
};

// Single shared <audio> element. Switching songs pauses the current one,
// loads the new src, then plays. No autoplay on initial mount.
export const BangersPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lazy-create the audio element on the client. Avoids SSR mismatch.
  useEffect(() => {
    const a = new Audio();
    a.preload = 'none';
    audioRef.current = a;
    const onTime = () => {
      if (a.duration > 0) setProgress(a.currentTime / a.duration);
    };
    const onEnd = () => {
      setPlayingId(null);
      setProgress(0);
    };
    const onError = () => {
      setPlayingId(null);
      setProgress(0);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onError);
    return () => {
      a.pause();
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, []);

  const togglePlay = useCallback((song: Song) => {
    const a = audioRef.current;
    if (!a) return;
    if (playingId === song.id) {
      a.pause();
      setPlayingId(null);
      return;
    }
    a.pause();
    a.src = song.audioUrl;
    a.currentTime = 0;
    setProgress(0);
    setPlayingId(song.id);
    void a.play().catch(() => {
      // Most likely: blocked autoplay or invalid blob URL. Reset state.
      setPlayingId(null);
    });
  }, [playingId]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    setPlayingId(null);
    setProgress(0);
  }, []);

  const value = useMemo(
    () => ({ playingId, progress, togglePlay, stop }),
    [playingId, progress, togglePlay, stop]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
```

- [ ] **Step 2: Create `SongCard.tsx`**

Create `components/arena/SongCard.tsx`:

```tsx
'use client';

import type { Song } from '@/lib/content';
import type { ArenaTheme } from './theme';
import { useBangersPlayer } from './BangersPlayer';

interface Props {
  song: Song;
  theme: ArenaTheme;
  themedGradient: { from: string; to: string };
}

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const SongCard = ({ song, theme, themedGradient }: Props) => {
  const { playingId, progress, togglePlay } = useBangersPlayer();
  const isPlaying = playingId === song.id;
  const duration = formatDuration(song.durationSeconds);

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        borderRadius: 6,
        overflow: 'hidden',
        background: song.coverUrl
          ? `url(${song.coverUrl}) center/cover`
          : `linear-gradient(135deg, ${themedGradient.from}, ${themedGradient.to})`,
        boxShadow: `0 12px 24px rgba(0,0,0,0.55), 0 0 0 1px ${theme.accent}55`,
        cursor: 'pointer'
      }}
      onClick={() => togglePlay(song)}
      role="button"
      aria-label={isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePlay(song);
        }
      }}
    >
      {/* Fallback note emoji when no cover */}
      {!song.coverUrl && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            opacity: 0.4
          }}
        >
          ♪
        </div>
      )}
      {/* Dim overlay */}
      <span
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }}
      />
      {/* Play/pause button */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, #fff 0%, ${theme.accent} 40%, ${theme.accent2} 100%)`,
          boxShadow: `0 0 24px ${theme.accent}aa, 0 4px 12px rgba(0,0,0,0.6)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0a0420',
          fontSize: 24,
          fontWeight: 900,
          zIndex: 3
        }}
      >
        {isPlaying ? '❚❚' : '▶'}
      </span>
      {/* Title overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 12px 14px',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.92))',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 8
        }}
      >
        <span
          style={{
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: 16,
            letterSpacing: 0.5,
            color: '#fff',
            lineHeight: 1.1,
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {song.title}
        </span>
        {duration && (
          <span
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              color: theme.accent,
              letterSpacing: 0.5,
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            {duration}
          </span>
        )}
      </div>
      {/* "on suno" link */}
      {song.sunoUrl && (
        <a
          href={song.sunoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 4,
            padding: '3px 8px',
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${theme.accent}`,
            color: theme.accent,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 9,
            letterSpacing: 1,
            textDecoration: 'none'
          }}
        >
          ▶ on suno
        </a>
      )}
      {/* Progress bar (only while playing) */}
      {isPlaying && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 5
          }}
        >
          <div
            style={{
              width: `${Math.min(100, progress * 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
              transition: 'width 0.2s linear'
            }}
          />
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Create `Bangers.tsx`**

Create `components/arena/Bangers.tsx`:

```tsx
'use client';

import type { Song } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { BangersPlayerProvider } from './BangersPlayer';
import { SongCard } from './SongCard';
import { Reveal } from './Reveal';

interface Props {
  songs: Song[];
  theme: ArenaTheme;
  size: ArenaSize;
}

// Two themed gradients we rotate through when a song has no cover art.
// Keeps the no-cover grid visually varied without giving every song the
// same fallback.
const GRADIENT_POOL = [
  { from: '#b8527a', to: '#3a0a1f' },
  { from: '#5b3aa6', to: '#1a0a3a' },
  { from: '#2a7d4f', to: '#0e3a1f' },
  { from: '#1a3a8a', to: '#000d33' }
];

export const Bangers = ({ songs, theme, size }: Props) => {
  const visible = songs.filter(s => s.visible);
  if (visible.length === 0) return null;
  const isDesktop = size === 'desktop';
  const isTablet = size === 'tablet';
  const cols = isDesktop ? 3 : isTablet ? 2 : 1;

  return (
    <BangersPlayerProvider>
      <section
        id="bangers"
        style={{
          padding: isDesktop ? '40px 64px' : isTablet ? '24px 32px' : '24px 14px'
        }}
      >
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Anton', 'Bungee', sans-serif",
                color: theme.fg,
                fontSize: isDesktop ? 64 : isTablet ? 44 : 32,
                letterSpacing: -0.5,
                lineHeight: 1
              }}
            >
              BANGERS
            </h2>
            <span
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10,
                color: theme.accent,
                letterSpacing: 1.6
              }}
            >
              // dropped from the studio
            </span>
          </div>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 14
          }}
        >
          {visible.map((song, i) => (
            <Reveal key={song.id} delay={i * 70}>
              <SongCard
                song={song}
                theme={theme}
                themedGradient={GRADIENT_POOL[i % GRADIENT_POOL.length]!}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </BangersPlayerProvider>
  );
};
```

- [ ] **Step 4: Wire `Bangers` into `ArenaShell.tsx`**

Open `components/arena/ArenaShell.tsx`. Add the import:

```ts
import { Bangers } from './Bangers';
```

Insert the section between `<Videos />` and `<About />`:

```tsx
        <Videos
          mode={mode}
          theme={theme}
          size={size}
          videos={videos}
          editorial={content.videos}
          images={content.images}
          error={videoError}
        />
        <Bangers songs={content.songs} theme={theme} size={size} />
        <About paragraphs={content.about} theme={theme} size={size} />
```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 6: Smoke-test with no songs**

Start dev server. Load `http://localhost:3000`. Since `content.songs` is empty, `Bangers` returns null and nothing renders between REPLAYS and ABOUT.

Snapshot confirms no visual change vs. the existing site.

- [ ] **Step 7: Commit**

```bash
git add components/arena/BangersPlayer.tsx components/arena/SongCard.tsx components/arena/Bangers.tsx components/arena/ArenaShell.tsx
git commit -m "feat(arena): BANGERS section with inline audio player (one song at a time)"
```

---

## Task 11: `BangersPreview` + `BangersEditor` in the edit area

**Files:**
- Create: `components/edit/deck/inline/BangersPreview.tsx`
- Create: `components/edit/deck/inline/BangersEditor.tsx`
- Modify: `components/edit/deck/inline/InlineEditView.tsx`

- [ ] **Step 1: Create `BangersPreview.tsx`**

Create `components/edit/deck/inline/BangersPreview.tsx`:

```tsx
'use client';

import type { Song } from '@/lib/content';
import { ED, FONT } from '../constants';
import { EditPin } from './EditPin';

interface Props {
  songs: Song[];
  onEdit: (pin: 'bangers') => void;
}

export const BangersPreview = ({ songs, onEdit }: Props) => {
  const visible = songs.filter(s => s.visible);
  return (
    <div
      style={{
        position: 'relative',
        padding: 14,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${ED.line}`,
        borderRadius: 4
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          letterSpacing: 1.4,
          color: ED.amber,
          marginBottom: 10,
          textTransform: 'uppercase'
        }}
      >
        BANGERS · {visible.length} / {songs.length} visible
      </div>
      {songs.length === 0 ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            color: ED.inkDim,
            padding: 16,
            textAlign: 'center',
            border: `1px dashed ${ED.line}`,
            borderRadius: 3
          }}
        >
          no songs yet — click EDIT to add one
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 6
          }}
        >
          {songs.map(song => (
            <div
              key={song.id}
              style={{
                aspectRatio: '1 / 1',
                background: song.coverUrl
                  ? `url(${song.coverUrl}) center/cover`
                  : 'rgba(0,0,0,0.5)',
                border: `1px solid ${song.visible ? ED.green : 'rgba(255,255,255,0.1)'}`,
                opacity: song.visible ? 1 : 0.4,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: 4
              }}
              title={song.title}
            >
              {!song.coverUrl && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  opacity: 0.3
                }}>♪</div>
              )}
              <span
                style={{
                  position: 'relative',
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  color: '#fff',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '2px 4px',
                  letterSpacing: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  width: '100%'
                }}
              >
                {song.title}
              </span>
            </div>
          ))}
        </div>
      )}
      <EditPin label="BANGERS" onClick={() => onEdit('bangers')} />
    </div>
  );
};
```

- [ ] **Step 2: Create `BangersEditor.tsx`**

Create `components/edit/deck/inline/BangersEditor.tsx`:

```tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import type { Song } from '@/lib/content';
import { FIELD_LIMITS } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Field, editInput } from '../primitives';
import { ImageDropzone } from './ImageDropzone';

interface Props {
  songs: Song[];
  onChange: (next: Song[]) => void;
}

const SONG_UPLOAD_URL = '/api/edit/song/upload';

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface UploadResult {
  audioUrl: string;
  durationSeconds: number | null;
  contentHash: string;
}

const uploadSong = async (file: File): Promise<UploadResult> => {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(SONG_UPLOAD_URL, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error ?? 'Upload failed.');
  }
  return {
    audioUrl: data.audioUrl,
    durationSeconds: data.durationSeconds,
    contentHash: data.contentHash
  };
};

// One-row editor for an individual song. Supports edit-in-place, reorder,
// delete, and visibility toggle.
const SongRow = ({
  song,
  index,
  total,
  onChange,
  onDelete,
  onMove
}: {
  song: Song;
  index: number;
  total: number;
  onChange: (next: Song) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) => {
  const update = <K extends keyof Song>(key: K, value: Song[K]) =>
    onChange({ ...song, [key]: value });

  return (
    <div
      style={{
        padding: 10,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${song.visible ? ED.line : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: song.visible ? 1 : 0.6
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            flexShrink: 0,
            background: song.coverUrl ? `url(${song.coverUrl}) center/cover` : 'rgba(0,0,0,0.6)',
            border: `1px solid ${ED.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: ED.inkDim
          }}
        >
          {!song.coverUrl && '♪'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={song.title}
            maxLength={FIELD_LIMITS.songTitle}
            onChange={(e) => update('title', e.target.value)}
            placeholder="title"
            style={{ ...editInput, fontFamily: FONT.stencil, fontSize: 14 }}
          />
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.inkDim,
              letterSpacing: 1,
              marginTop: 4
            }}
          >
            {formatDuration(song.durationSeconds) || 'unknown'} · {song.id}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          type="button"
          onClick={() => update('visible', !song.visible)}
          style={chipStyle(song.visible ? ED.green : ED.line)}
        >
          {song.visible ? '● VISIBLE' : '○ HIDDEN'}
        </button>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} style={chipStyle(ED.line)}>
          ▲
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} style={chipStyle(ED.line)}>
          ▼
        </button>
        <button type="button" onClick={onDelete} style={chipStyle(ED.red)}>
          ✕ DELETE
        </button>
      </div>
      <ImageDropzone
        slotId={`song-cover-${song.id}`}
        label="COVER"
        currentUrl={song.coverUrl}
        onUploaded={(url) => update('coverUrl', url)}
        onRemoved={() => update('coverUrl', null)}
        aspect="1 / 1"
      />
      <Field label={`suno url (optional · max ${FIELD_LIMITS.songSunoUrl})`}>
        <input
          value={song.sunoUrl ?? ''}
          maxLength={FIELD_LIMITS.songSunoUrl}
          onChange={(e) => update('sunoUrl', e.target.value || undefined)}
          placeholder="https://suno.com/song/..."
          style={editInput}
        />
      </Field>
    </div>
  );
};

const chipStyle = (color: string): React.CSSProperties => ({
  cursor: 'pointer',
  background: 'rgba(0,0,0,0.5)',
  border: `1px solid ${color}`,
  color,
  fontFamily: FONT.mono,
  fontSize: 9,
  letterSpacing: 1.4,
  padding: '4px 10px',
  textTransform: 'uppercase',
  borderRadius: 999
});

export const BangersEditor = ({ songs, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onAdd = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const { audioUrl, durationSeconds, contentHash } = await uploadSong(file);
      const newSong: Song = {
        id: contentHash,
        title: file.name.replace(/\.[^.]+$/, '').slice(0, FIELD_LIMITS.songTitle) || 'untitled',
        audioUrl,
        coverUrl: null,
        durationSeconds,
        visible: true
      };
      onChange([...songs, newSong]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [songs, onChange]);

  const onUpdate = (i: number, next: Song) => {
    const arr = [...songs];
    arr[i] = next;
    onChange(arr);
  };
  const onDelete = (i: number) => {
    const arr = songs.filter((_, idx) => idx !== i);
    onChange(arr);
  };
  const onMove = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= songs.length) return;
    const arr = [...songs];
    const [moved] = arr.splice(i, 1);
    if (moved) arr.splice(j, 0, moved);
    onChange(arr);
  };

  const atLimit = songs.length >= 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: ED.inkDim,
          letterSpacing: 1.4,
          textTransform: 'uppercase'
        }}
      >
        {songs.length} / 12 songs
      </div>
      {songs.map((song, i) => (
        <SongRow
          key={song.id}
          song={song}
          index={i}
          total={songs.length}
          onChange={(next) => onUpdate(i, next)}
          onDelete={() => onDelete(i)}
          onMove={(dir) => onMove(i, dir)}
        />
      ))}
      {atLimit ? (
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: ED.red }}>
          max 12 songs — delete one to add another
        </div>
      ) : (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 14,
            border: `1px dashed ${ED.amber}`,
            borderRadius: 3,
            cursor: uploading ? 'wait' : 'pointer',
            opacity: uploading ? 0.6 : 1
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              letterSpacing: 1.4,
              color: ED.amber,
              textTransform: 'uppercase'
            }}
          >
            {uploading ? 'uploading…' : '+ ADD SONG'}
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 9, color: ED.inkDim }}>
            drop an mp3/m4a/wav (max 15 MB · 10 min)
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onAdd(f);
            }}
            style={{ marginTop: 4 }}
          />
        </label>
      )}
      {error && (
        <div style={{ color: ED.red, fontFamily: FONT.mono, fontSize: 10 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Add `BangersPreview` + `BangersEditor` to `InlineEditView.tsx`**

Open `components/edit/deck/inline/InlineEditView.tsx`. Add the imports near the top:

```ts
import { BangersPreview } from './BangersPreview';
import { BangersEditor } from './BangersEditor';
```

Extend the `PinKey` union:

```ts
type PinKey =
  | 'handle'
  | 'hero'
  | 'stats'
  | 'thumb-style'
  | 'about'
  | 'book'
  | 'socials'
  | 'defaults'
  | 'bangers';
```

Add a setter near the existing ones:

```ts
const setSongs = (songs: SiteContent['songs']) => setContent({ ...content, songs });
```

Pass `setSongs` into the drawer-context object created for `renderDrawer`:

```ts
const drawer = renderDrawer(lastPin, {
  mode,
  content,
  setHandle,
  setHero,
  setStats,
  setAbout,
  setBook,
  setSocials,
  setVideos,
  setDefaultMode,
  setImage,
  setSongs
});
```

Update the `DrawerCtx` interface to include `setSongs`:

```ts
interface DrawerCtx {
  // ... existing ...
  setSongs: (s: SiteContent['songs']) => void;
}
```

Insert the `BangersPreview` row in the JSX, between `ReplaysPreview` and `AboutPreview`:

```tsx
      <ReplaysPreview
        videos={videos}
        pinnedId={content.videos.pinnedId}
        images={content.images}
        onEdit={(k) => open(k)}
      />
      <BangersPreview songs={content.songs} onEdit={(k) => open(k)} />
      <AboutPreview about={content.about} onEdit={(k) => open(k)} />
```

Add a case to `renderDrawer` for the `'bangers'` pin:

```ts
    case 'bangers':
      return {
        title: 'BANGERS',
        kicker: '// dropped from the studio',
        accent: ED.pink,
        content: <BangersEditor songs={ctx.content.songs} onChange={ctx.setSongs} />
      };
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm typecheck`
Expected: Exits 0.

- [ ] **Step 5: End-to-end: upload a song**

Run `pnpm dev`. Open `/edit`, log in, switch to the On-Site Editor tab. Click the `BANGERS` EDIT pin → the drawer opens with the `0 / 12 songs` header and the `+ ADD SONG` dropzone.

Upload a small mp3 file (use any short audio file you have, or use a tool like `ffmpeg -f lavfi -i sine=440 -t 5 test.mp3` to generate a 5-second test tone). Expected:
- Upload progress shown briefly
- New row appears with the filename as title, the detected duration, and a `song-cover-{id}` `ImageDropzone`
- Save → toast confirms

Reload `/` (clearing intro cookie if needed). The `BANGERS` section now renders between REPLAYS and ABOUT, with one square card. Click the card → audio plays. Click again → audio pauses.

- [ ] **Step 6: Commit**

```bash
git add components/edit/deck/inline/BangersPreview.tsx components/edit/deck/inline/BangersEditor.tsx components/edit/deck/inline/InlineEditView.tsx
git commit -m "feat(edit): BANGERS preview + drawer with audio upload, reorder, visibility"
```

---

## Task 12: End-to-end verification across the new surface

**Files:**
- None (this task is verification-only; if defects are found, file them as separate fixes)

- [ ] **Step 1: Type + build gate**

Run: `pnpm typecheck && pnpm build`
Expected: Both succeed.

- [ ] **Step 2: Hero floating tags — runtime check**

Start dev server. Load `/` (set the `khalil_intro_seen` cookie via DevTools if you keep getting redirected to `/intro`).

Take a `preview_screenshot` of the hero. Confirm:
- Four floating tags around the polaroid (SUBS, VIEWS, RANK, VIDEOS by default)
- With `YOUTUBE_API_KEY` set: live numbers for SUBS / VIEWS / VIDEOS
- Without the key: fallback to `manualValue` for each (RANK is always manual = "GOAT")

- [ ] **Step 3: Video card likes — runtime check**

Snapshot the REPLAYS section. Confirm each card's bottom plate shows `▸ {views} · ♥ {likes}` when likes > 0. Live videos still show `LIVE NOW`.

- [ ] **Step 4: BANGERS — empty state**

With `content.songs === []`, no BANGERS section should render. Snapshot the page between REPLAYS and ABOUT — verify continuity.

- [ ] **Step 5: BANGERS — single song**

Add one song via /edit, save. Reload `/`. Snapshot: BANGERS section visible with one card.

Click the card → audio plays. Use `preview_console_logs` to confirm no errors.

- [ ] **Step 6: BANGERS — multiple songs, one-at-a-time playback**

Add a second song. On the public site, start song A → start song B → confirm song A pauses and B plays. Snapshot during playback should show a progress bar across the playing card.

- [ ] **Step 7: Edit area — HeroTagsModule**

In Mission Control, change one of the wired tags to MANUAL and type a value. Save. Reload `/`. That corner now shows the manual value.

Flip it back to wired. Save. The corner returns to the live value.

- [ ] **Step 8: Edit area — YouTubeIntelModule**

Click the `REFRESH` button. The "synced Xs ago" timestamp resets. Channel bio expand/collapse works.

- [ ] **Step 9: Validation backstops**

Try saving with `floatingTags` length 3 in a hand-crafted payload (via the browser's DevTools network tab editing the request body, or via a curl POST to `/api/edit/save` with a stripped payload). Confirm the validator coerces to 4 entries rather than rejecting — that's the intended fail-soft behavior.

Upload a >15 MB audio file → `413` with error message in the editor.

- [ ] **Step 10: Final commit (if anything was changed)**

If any small bugfixes were needed during verification, commit them with descriptive messages. Otherwise, no commit.

```bash
git status
# If nothing to commit, you're done.
```

---

## Summary of files touched

**New files:**
- `lib/youtube-channel.ts`
- `app/api/channel-stats/route.ts`
- `app/api/edit/song/upload/route.ts`
- `components/arena/Bangers.tsx`
- `components/arena/SongCard.tsx`
- `components/arena/BangersPlayer.tsx`
- `components/edit/deck/modules/HeroTagsModule.tsx`
- `components/edit/deck/modules/YouTubeIntelModule.tsx`
- `components/edit/deck/inline/BangersPreview.tsx`
- `components/edit/deck/inline/BangersEditor.tsx`
- `docs/superpowers/specs/2026-05-28-youtube-stats-and-suno-design.md` (already committed)
- `docs/superpowers/plans/2026-05-28-youtube-stats-and-suno.md` (this file)

**Modified files:**
- `lib/content.ts` — schema additions, `FIELD_LIMITS`, validation, `SONG_COVER_SLOT_RE`
- `lib/youtube.ts` — `likeCount` on `VideoItem`, `formatCount`
- `content.json` — `floatingTags`, `songs`, `viewsManual`, `videosManual` defaults
- `components/arena/Hero.tsx` — render floating tags from `content.floatingTags`
- `components/arena/VideoCard.tsx` — inline likes
- `components/arena/ArenaShell.tsx` — accept `channelStats`, slot `<Bangers />`
- `app/page.tsx` — parallel fetch of channel stats
- `app/edit/page.tsx` — fetch channel stats
- `components/edit/deck/ControlDeck.tsx` — `channelStats` prop, mount `HeroTagsModule` + `YouTubeIntelModule`
- `components/edit/deck/inline/InlineEditView.tsx` — `BangersPreview` + drawer wiring
- `package.json` / `pnpm-lock.yaml` — `music-metadata` dependency

**No deleted files.** `components/edit/deck/modules/SubsModule.tsx` remains in active use — Task 7 adds the `HeroTagsModule` as a *new* panel below `LIVE STATUS` rather than replacing the existing `SubsModule`. The +/-/goal subs controls stay where they are. This is a deliberate divergence from the spec's "replaces" wording in favor of the spec's "subs slot still has the +/-/goal controls when in manual mode" — the additive approach gives both surfaces without removing the existing UX.

---

## Notes for the implementing engineer

- **TDD is constrained**: this project doesn't have a test framework. Verification gates are `pnpm typecheck`, runtime preview tools, and manual click-through. Don't add Jest/Vitest unless the user asks.
- **Commits should be small and frequent**: each task ends with one commit.
- **Don't auto-deploy**: every save commits to `main` and triggers a Vercel rebuild. That's the existing flow; verify locally first.
- **Be careful with `content.json`**: it's the source of truth. The validator silently coerces malformed inputs, but adding new top-level fields requires updating both the TypeScript interface and the runtime validator — do them together in Task 1.
- **The pinned-video relationship for `pinnedLikes`**: the floating-tag resolver looks up the pinned video in the `videos[]` array (already fetched at the page level). If `content.videos.pinnedId` is null, the resolver falls back to `tag.manualValue` (or empty). Don't introduce a separate fetch for the pinned video.
- **Vercel Blob URLs**: the validator's `BLOB_HOST_RE` enforces `*.public.blob.vercel-storage.com`. If the project's Blob host pattern differs in production, adjust the regex in `lib/content.ts` — this is the one place to change.
