# YouTube stats wiring + Suno songs section — Design

**Date:** 2026-05-28
**Status:** Approved (brainstorm), pending implementation plan
**Author:** Bachir (via Claude brainstorming session)

## Summary

Two related features for the Khalil site:

1. **Wire YouTube data into the mission control / edit area** so subscriber count, total channel views, total videos, channel description, and per-video like counts come from the YouTube Data API automatically — with a per-field manual/auto toggle so Khalil retains override control.
2. **Add a `BANGERS` section** for AI-generated songs Khalil makes in Suno, uploaded as MP3 + cover art to Vercel Blob and rendered with a custom site-styled inline player.

Both features extend the existing `content.json` → `/edit` → GitHub commit → rebuild pipeline. No new auth flows, no new env vars beyond the existing `YOUTUBE_API_KEY`.

## Goals

- Reduce manual upkeep: Khalil shouldn't have to type new subscriber counts every week.
- Surface real YouTube engagement numbers (total views, video count, per-video likes) without breaking the playful design language.
- Give Suno-generated songs a first-class home on the site, styled to match (not a generic embed).
- Keep the manual-override safety hatch — wired fields can always be flipped to manual.

## Non-goals

- YouTube Analytics integration (watch time, retention, demographics) — requires OAuth, out of scope.
- Real-time / live-updating numbers on the public site. Server-render with 10-minute cache is sufficient.
- Auto-importing Khalil's entire Suno library — no public Suno API. Each song is added manually via upload.
- Replacing Khalil's voice in `content.about` with the YouTube channel description. The description is **read-only in /edit only**, never rendered on the public site.

## Decisions locked in during brainstorming

| Question | Decision |
|---|---|
| Wiring model | Per-field toggle: `MANUAL ✎` ↔ `WIRED ⚡` |
| Where channel numbers appear publicly | Floating tags on the hero polaroid (4 fixed corners) |
| Where channel description appears | `/edit` only — read-only intel panel, never on public site |
| Where per-video likes appear | Inline next to views on the video card bottom plate |
| Suno song source | Upload MP3 + cover art to Vercel Blob |
| Songs section placement | Between `REPLAYS` and `ABOUT` |
| Songs section name | `BANGERS` (kicker: `// dropped from the studio`) |
| Song player UX | Inline play/pause per card, only one playing at a time |

## Data model

### Schema additions to `SiteContent` (`lib/content.ts`)

```ts
type TagSource = 'manual' | 'subs' | 'views' | 'videos' | 'pinnedLikes';
type TagPosition = 'tl' | 'tr' | 'bl' | 'br';

interface FloatingTagConfig {
  enabled: boolean;
  source: TagSource;
  label: string;          // 'SUBS', 'VIEWS', 'RANK', etc. (max 8 chars)
  manualValue: string;    // used when source === 'manual', OR as fallback
                          // when wired source returns null (max 12 chars)
  position: TagPosition;  // unique per slot — fixed 4 corners
}

interface Song {
  id: string;             // generated short slug (8 chars, content-hashed)
  title: string;          // max 80 chars
  audioUrl: string;       // must be on *.blob.vercel-storage.com
  coverUrl: string | null; // Blob URL; null → themed gradient fallback
  durationSeconds: number | null;
  visible: boolean;
  sunoUrl?: string;       // optional 'listen on suno' link (max 200 chars)
}

interface SiteContent {
  // ... existing fields ...

  /** Exactly 4 entries — one per corner of the hero polaroid.
   *  Disabled slots leave that corner empty. */
  floatingTags: FloatingTagConfig[];

  /** Ordered list of Suno-style songs.
   *  Max 12 entries. Invisible entries excluded from public site. */
  songs: Song[];
}
```

### `content.subs.current` and `subs.goal` — kept

- `subs.current` stays as the **manual fallback value** for any tag with `source: 'subs'` in either manual mode or when the API returns null.
- `subs.goal` stays as-is — used by the `SubsModule` progress-bar UI in /edit.
- For symmetry, two new fields are added: `content.viewsManual: number` and `content.videosManual: number`, defaulting to 0. They store manual overrides for the views/videos floating tags. Considered nesting them under a `manualOverrides` object but kept flat to match the existing `subs` shape.

### New FIELD_LIMITS

```ts
tagLabel: 8,
tagValue: 12,
songTitle: 80,
songSunoUrl: 200,
```

### `content.json` defaults on first migration

When existing `content.json` is loaded without these new fields, the validator in `lib/content.ts` fills them in:

```ts
floatingTags: [
  { enabled: true,  source: 'subs',     label: 'SUBS',   manualValue: '744',  position: 'tr' },
  { enabled: true,  source: 'manual',   label: 'RANK',   manualValue: 'GOAT', position: 'bl' },
  { enabled: true,  source: 'views',    label: 'VIEWS',  manualValue: '0',    position: 'tl' },
  { enabled: true,  source: 'videos',   label: 'VIDEOS', manualValue: '0',    position: 'br' },
],
songs: [],
viewsManual: 0,
videosManual: 0,
```

These positions preserve the existing hero look (`SUBS` top-right, `RANK GOAT` bottom-left) and fill the empty corners with the new wired fields.

## Architecture

### New library: `lib/youtube-channel.ts`

```ts
export interface ChannelStats {
  subscriberCount: number | null;   // null when YouTube hides it
  viewCount: number | null;
  videoCount: number | null;
  description: string;
  title: string;
  thumbnailUrl: string | null;
  hidden: boolean;                   // mirrors API's hiddenSubscriberCount
  fetchedAt: string;                 // ISO timestamp
}

export const getChannelStats = async (): Promise<ChannelStats | null>;
```

Implementation:
- Single `channels.list?part=snippet,statistics&id=<channelId>` call — **1 quota unit**
- Reuses `cachedChannelId` from `lib/youtube.ts` (no re-resolution of the handle)
- `next: { revalidate: 600 }` — same 10-minute server cache as the videos call
- Returns `null` on any error (no key, no channel, network) — public site falls back gracefully

### Extension to `lib/youtube.ts`

```ts
interface VideoItem {
  // ... existing fields ...
  likeCount: number | null;          // NEW
}
```

The existing `videos.list?part=snippet,statistics,contentDetails,liveStreamingDetails` call already returns `statistics.likeCount`. Parsing is a one-line addition. **No new API call, no quota change.**

### New endpoint: `GET /api/channel-stats`

- Public, no auth (all data is public on YouTube)
- Returns `ChannelStats | { error: string }` JSON
- Headers: `Cache-Control: public, max-age=0, s-maxage=600, stale-while-revalidate=1800` (mirrors `/api/videos`)
- Used by:
  - `YouTubeIntelModule` in /edit (for the read-only intel panel)
  - Server-side render of the public hero (consumed directly via `getChannelStats()`, not via fetch)

### New endpoint: `POST /api/edit/song/upload`

- Requires the existing `SESSION_COOKIE` auth (same as `/api/edit/image/upload`)
- Accepts `multipart/form-data` with `file` field
- Server-side validation:
  - MIME type ∈ `{ audio/mpeg, audio/mp4, audio/wav, audio/x-m4a }`
  - Size ≤ 15 MB
  - Duration probed via `music-metadata` npm package (~50 KB dep); reject if > 600 seconds (10 min sanity rail)
- On success: upload to Vercel Blob with key `song-{contentHash}.{ext}`
- Returns `{ ok: true, audioUrl: string, durationSeconds: number | null, contentHash: string }`
- Errors return `{ ok: false, error: string }` with appropriate HTTP status

### Cover art upload

Reuses the existing `POST /api/edit/image/upload` endpoint. The upload validator there checks `isValidImageSlotId(slotId)`; we extend it with a new pattern:

```ts
// in lib/content.ts
const SONG_COVER_SLOT_RE = /^song-cover-[a-z0-9]{6,12}$/;

// in isValidImageSlotId:
if (SONG_COVER_SLOT_RE.test(id)) return true;
```

Important: the cover URL is **stored on `song.coverUrl`**, never in `content.images` map. The image upload route only uploads to Blob and returns the URL — it never writes content.json. The client puts the returned URL onto the song object, and `validateContent` validates `song.coverUrl` independently against the Blob-domain regex. The `images` map's save-time validation continues to silently drop unknown keys (existing behavior), so even if a song-cover URL accidentally landed there, it'd be cleaned out — no risk of double-storage.

### Schema validation in `lib/content.ts`

`validateContent` extended to:

1. **floatingTags** — coerce to length-4 array; each entry validated against the `FloatingTagConfig` shape; duplicate positions rejected with an explicit error.
2. **songs** — array of `Song` shape; max 12 entries; `audioUrl` must match `*.blob.vercel-storage.com`; `coverUrl` either null or same Blob prefix; `sunoUrl` either absent or a valid `https://` URL.
3. **viewsManual, videosManual** — non-negative integers, default 0.

## Public site changes

### `components/arena/Hero.tsx`

Replace lines 52–71 (hardcoded `SUBS` + `RANK GOAT` tags) with:

```tsx
{content.floatingTags
  .filter(t => t.enabled)
  .map(tag => (
    <FloatingTag
      key={tag.position}
      label={tag.label}
      value={resolveTagValue(tag, channelStats, content, videos)}
      theme={theme}
      position={positionFor(tag.position, isDesktop, isTablet)}
      delay={delayFor(tag.position)}
    />
  ))}
```

A new helper `resolveTagValue` returns:
- `'manual'` → `tag.manualValue`
- `'subs'` → `formatCount(channelStats?.subscriberCount)` or `tag.manualValue` fallback
- `'views'` → `formatCount(channelStats?.viewCount)` or fallback
- `'videos'` → `String(channelStats?.videoCount)` or fallback
- `'pinnedLikes'` → likes of the pinned video, or fallback

`positionFor` maps `'tl'|'tr'|'bl'|'br'` to the existing `{ left/right, top/bottom }` style objects, with responsive offsets matching what's currently hardcoded.

### `components/arena/VideoCard.tsx`

Bottom info plate (around lines 300–330) — replace:

```tsx
<span>▸ {views}</span>
{ago && <span>{ago}</span>}
```

with:

```tsx
<span>
  ▸ {views}
  {video.likeCount && video.likeCount > 0 && (
    <> · ♥ {formatCount(video.likeCount)}</>
  )}
</span>
{ago && <span>{ago}</span>}
```

`formatCount` (new helper in `lib/youtube.ts`) handles `K`/`M` suffixes:
- `< 1000` → `'421'`
- `1000–999_999` → `'1.2K'`
- `≥ 1_000_000` → `'1.2M'`

### New: `components/arena/Bangers.tsx`

Section structure mirrors `ReplaysRoom` / `AboutPreview` styling. Header strip ("BANGERS // dropped from the studio") with the same kicker treatment as other sections.

Grid layout:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Cards have square aspect (1:1)

```tsx
interface BangersProps {
  songs: Song[];
  theme: ArenaTheme;
}

// Renders a section with all visible songs.
// Returns null if songs.length === 0 or none visible.
```

Each card (`components/arena/SongCard.tsx`):
- Cover art fills the square (themed gradient + ♪ emoji if `coverUrl === null`)
- Title overlay at bottom (gradient scrim)
- Centered play/pause button overlay
- Thin progress bar pinned to bottom edge (only visible during playback)
- Duration text bottom-right (`2:34`)
- Optional small "▶ on suno" link bottom-left (only when `sunoUrl` set)

### New: `components/arena/BangersPlayer.tsx` + context

A single `<audio>` element managed by a `BangersContext` provider scoped to the section. Tracks:
- `playingId: string | null`
- `progress: number` (0–1)
- `togglePlay(songId: string)`

`SongCard` consumes the context; clicking play on song B while song A plays → A pauses (audio.pause + reset to start), B plays (audio.src = B.audioUrl, audio.play). No autoplay on page load. SSR-safe: provider's initial state is `{ playingId: null, progress: 0 }`.

### `components/arena/ArenaShell.tsx`

Insert `<Bangers songs={content.songs} theme={theme} />` between the existing `<Videos />` (REPLAYS) and the about section.

### `app/page.tsx`

Parallelize the data fetches:

```tsx
const [content, videoResult, channelStats] = await Promise.all([
  getContent(),
  getRecentVideos(),
  getChannelStats(),
]);
```

Pass `channelStats` through to the `Hero` for tag resolution.

## Edit area changes

### Mission Control tab

**New module: `components/edit/deck/modules/HeroTagsModule.tsx`**

Replaces the existing `SubsModule` in the LIVE STATUS row. Renders a 2×2 grid of corner slots. Each slot is a small card:

```
┌────────────────────────────┐
│ TL · SUBS                  │  ← position chip + editable label (max 8)
│ [⚡ WIRED  ✎ MANUAL]        │  ← toggle
│ → 758                      │  ← when WIRED: live preview from API
│ fallback: [744]            │  ← editable manualValue (used when API null)
└────────────────────────────┘
```

When source is `'manual'`, the row shows a single value input instead of the preview + fallback. When `'subs'` and manual mode is on, the subs +/-/goal controls from the old `SubsModule` slide in below (preserving the existing UX for that specific slot).

Each slot also has an `enabled` toggle — disabled slots show a dim "OFF" state and that corner is empty on the public site.

**New module: `components/edit/deck/modules/YouTubeIntelModule.tsx`**

Placed below the message launcher on Mission Control. Compact read-only panel:

```
┌─ YOUTUBE INTEL ─── // synced 4m ago · [REFRESH] ─┐
│ @khalilgaming2020                                │
│ ───────────────────                              │
│ SUBS    758                                      │
│ VIEWS   184,213                                  │
│ VIDEOS  42                                       │
│                                                  │
│ CHANNEL BIO:                                     │
│ "Welcome to my channel! I play Fortnite,         │
│  Roblox, and Brawl Stars..."         [show more] │
└──────────────────────────────────────────────────┘
```

Error states:
- No API key set → "⚠ NO YOUTUBE_API_KEY · set it in your .env.local"
- API unreachable → "⚠ COULDN'T REACH YOUTUBE — try again"
- Subscriber count hidden → SUBS row shows "—" with note "(hidden by Khalil on YouTube)"

`REFRESH` calls `/api/channel-stats?bust=1` (a one-shot cache-bust query param accepted by the route).

### On-Site Editor tab

**New preview: `components/edit/deck/inline/BangersPreview.tsx`**

Slotted between `ReplaysPreview` and `AboutPreview` in `InlineEditView`. Shows the current songs as a horizontal mini-strip (cover thumbnails + titles) with an `EDIT` pin overlay.

**New drawer: `BangersEditor.tsx`**

Opens when the BANGERS pin is clicked. Layout:

```
SONGS · 3 / 12
─────────────────────────────────────
▼  [cover]  How To Goat        2:34
   ⚡ visible  ✎ edit  ✕ delete
   ▲▼ reorder
─────────────────────────────────────
▼  [cover]  Fortnite W's       1:48
   ⚡ visible  ✎ edit  ✕ delete
─────────────────────────────────────
+ ADD SONG
```

Clicking `+ ADD SONG` expands an inline form:
- Audio dropzone (uses similar pattern to `ImageDropzone`, calls `/api/edit/song/upload`)
- Cover dropzone (uses existing `ImageDropzone` with new `song-cover-{id}` slot)
- Title field (max 80 chars)
- Optional Suno URL field
- Visible toggle
- `[ADD]` button (disabled until audio is uploaded + title entered)

Clicking `✎ edit` on an existing song opens the same form pre-filled.

Reordering: up/down chevrons swap with neighbor. No drag-drop (fiddly on mobile).

### New routes added to `app/api/edit/`

- `POST /api/edit/song/upload` — audio upload (see Architecture section)

Cover art uses the existing `/api/edit/image/upload` with the new song-cover slot pattern.

## Validation & error handling

### YouTube data unavailable

The public site treats `channelStats === null` and `video.likeCount === null` as expected states, not errors:
- Floating tags with wired sources fall back to `manualValue`. If `manualValue` is empty, the slot is hidden.
- Video cards skip the `· ♥ N` segment if `likeCount` is null or 0.
- The site renders identically to today's site if `YOUTUBE_API_KEY` is unset (the existing `videos` API already handles this).

### Floating tag invariants

`validateContent` enforces:
- `floatingTags.length === 4`
- All four `position` values distinct (one per corner)
- `label.length ≤ 8`, `manualValue.length ≤ 12`
- `source` ∈ valid `TagSource` union

Malformed entries are coerced to defaults rather than rejected at save time, preserving the existing graceful-degradation pattern.

### Song invariants

- `songs.length ≤ 12` — exceeded → save rejected with "Too many songs (max 12)"
- `audioUrl` regex enforces Vercel Blob domain — prevents arbitrary external audio URLs in content.json
- `coverUrl` same constraint (or null)
- `sunoUrl` either absent or `https://` URL ≤ 200 chars
- `title` required, max 80 chars
- `id` regenerated server-side on add — clients can't forge collisions
- `durationSeconds` either null or `0 < n ≤ 600`

### Upload errors

- File too large (>15 MB) → `413 PAYLOAD TOO LARGE` with error message
- Wrong MIME → `415 UNSUPPORTED MEDIA TYPE`
- Duration too long (>10 min) → `400 BAD REQUEST` with explanation
- Duration probe fails → save with `durationSeconds: null` (degraded but works)
- Blob upload fails → `502 BAD GATEWAY` with retry hint

### Audio playback errors

- `<audio>` element fires `error` event → `SongCard` shows ✕ overlay, play button disabled
- This handles the rare case of a Blob URL going stale or the file being corrupt

### Cross-cutting

- All new client components are SSR-safe (no `window`/`document` access during render)
- `BangersPlayer` audio element is mounted client-only via `useEffect` to avoid SSR mismatch
- No new env vars required
- No new external services (YouTube API + Vercel Blob both already in use)

## Files touched

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
- `docs/superpowers/specs/2026-05-28-youtube-stats-and-suno-design.md` (this file)

**Modified files:**
- `lib/content.ts` — schema additions, FIELD_LIMITS, validation
- `lib/youtube.ts` — `likeCount` on `VideoItem`, `formatCount` helper
- `content.json` — initial `floatingTags`, `songs`, `viewsManual`, `videosManual`
- `components/arena/Hero.tsx` — replace hardcoded tags with `floatingTags` loop
- `components/arena/VideoCard.tsx` — inline likes next to views
- `components/arena/ArenaShell.tsx` — slot `<Bangers />` between videos and about
- `app/page.tsx` — parallel fetch of `channelStats`
- `app/edit/page.tsx` — fetch `channelStats` for `YouTubeIntelModule`
- `components/edit/deck/ControlDeck.tsx` — register `HeroTagsModule` (replacing `SubsModule` direct usage) + `YouTubeIntelModule`
- `components/edit/deck/inline/InlineEditView.tsx` — register `BangersPreview` + `BangersEditor` drawer
- `package.json` — add `music-metadata` dependency

**Deleted files:**
- None. (The existing `SubsModule.tsx` becomes a sub-component used internally by `HeroTagsModule` for the subs slot's manual-mode controls — but the file itself stays.)

## Open questions / future work

- **Bulk song reorder / drag-drop**: chevrons only in v1; full drag-drop is a polish item.
- **Suno cover art auto-fetch**: would require scraping Suno (no API). Out of scope; Khalil uploads the cover manually.
- **Lyrics**: Suno songs have lyrics; could be displayed in an expanded card. Not in v1.
- **Analytics** (YouTube watch time, demographics) — explicitly out of scope; requires OAuth.

## Implementation order suggestion (for the plan-writer)

1. **Schema first** — `lib/content.ts` types + validation, defaults in `content.json`. Verify save round-trips.
2. **YouTube channel-stats library + endpoint** — `lib/youtube-channel.ts`, `/api/channel-stats`.
3. **Public-site likes** — `likeCount` on `VideoItem`, `formatCount`, video card update. Smallest visible change first.
4. **Floating tags v1** — `HeroTagsModule` in /edit, hero rendering loop. All four sources (`subs`, `views`, `videos`, `pinnedLikes`) wired in this step.
5. **YouTube Intel module** — read-only panel in /edit.
6. **Song upload route** — `/api/edit/song/upload` + `music-metadata` dep.
7. **Bangers section** — public components (`Bangers`, `SongCard`, `BangersPlayer`).
8. **Bangers editor** — `BangersPreview` + drawer.
9. **End-to-end test** — upload a song, verify it appears, plays, can be reordered, deleted, made invisible.
