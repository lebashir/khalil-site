# Claude Code Handoff — khalil.gg

A personal site for **Khalil**, age 10. Two modes — **gaming** and **football** — toggled by a full-width top bar with a cinematic transition. First-time visitors get a scroll-through **tunnel intro**; returning visitors land straight on the Arena homepage. Khalil edits the site through a private Control Deck that includes an on-site editor and a missile-style message launcher for site-wide alerts.

This doc tells you everything you need to translate the design prototype in this repo into a production Next.js (or similar) site.

---

## What's in this repo

```
index.html                  Design canvas — pan/zoom view of all artboards
directions/
  arena.jsx                 Direction C · Arena · the primary homepage
  tunnel.jsx                Direction D · Tunnel · the scroll-through intro
  edit.jsx                  Direction E · Control Deck · Khalil's editor
  topbar.jsx                Shared: TopBarMode + ModeFlipOverlay + useModeFlip
  shared.jsx                Content (window.KHALIL — single source of truth)
  lib.jsx                   Animations, useScrollHero, Burst, Defer, LoadingPanel
design-canvas.jsx           Canvas chrome (Figma-ish)
ios-frame.jsx               iOS device bezel
browser-window.jsx          macOS Chrome window
```

**These are design artifacts, not production code.** They use in-browser Babel and inline JSX. The patterns are correct; the implementation details (font loading, hooks, state) need to be re-derived in your stack.

---

## Information architecture

### Routes

| Route         | Purpose                          | Notes |
|---------------|----------------------------------|-------|
| `/`           | Arena (homepage)                 | Gated by first-visit logic — see below |
| `/intro`      | Tunnel walkthrough               | Optional; route name is yours to pick |
| `/edit`       | Khalil's Control Deck            | Auth required (see Access) |

### First-visit / refresh routing

Khalil wants the Tunnel to play **only on first visit** (and optionally on hard refresh). Recommended implementation:

```ts
// app/(site)/page.tsx (server component)
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Arena from '@/components/arena/Arena'

export default function Home() {
  const seen = cookies().get('khalil_intro_seen')
  if (!seen) redirect('/intro')
  return <Arena />
}
```

```ts
// app/intro/page.tsx — sets the cookie when the user finishes the tunnel
'use client'
import { useEffect } from 'react'

export default function Intro() {
  useEffect(() => {
    document.cookie = 'khalil_intro_seen=1; max-age=2592000; path=/' // 30 days
  }, [])
  return <Tunnel onComplete={() => router.push('/')} />
}
```

**On the "every refresh" question:** I'd recommend against it. Visitors who land via shared links will refresh casually, and re-watching a 30-second intro every time is annoying. The cookie above expires in 30 days — that gives "feels fresh" without being punishing. If Khalil really wants per-session, swap the cookie for `sessionStorage`:

```ts
// On Arena page mount:
useEffect(() => {
  if (!sessionStorage.getItem('khalil_intro_seen')) {
    router.replace('/intro')
  }
}, [])
```

The browser will absolutely handle that — `sessionStorage` is per-tab and persists across reloads within the tab. Just don't tie it to `performance.navigation.type === 'reload'` because that's flaky across browsers.

---

## The mode toggle (high priority — Khalil's main UX gesture)

The toggle is **the entire top row** of every page. Two half-tiles representing each world. Three interactions trigger the flip:

1. **Click the idle (smaller) half**
2. **Swipe / drag horizontally** past a threshold (~80px or 20% of bar width)
3. **Keyboard** `←` / `→` on the focused topbar

### Visual spec

```
┌────────────────────────────────────────────────────────────┐
│  🎮 GAMING                              FOOTBALL ⚽         │  active = ~78% width
│  • CURRENTLY                            ← TAP              │  idle = ~22% width
│  streamer · gamer · goat                                   │
└────────────────────────────────────────────────────────────┘
```

- Active half: full chroma, big label (44–46px), accent glow, "• CURRENTLY" pip
- Idle half: dimmed (opacity 0.62), smaller label (22px), "← TAP" hint
- Seam between halves: 2px line with glow in target accent color
- Bar height: 76px desktop / 60px mobile
- Position: `sticky; top: 0; z-index: 80`

### Cinematic flip transition (LOCKED IN — do not modify)

When a flip fires, a full-screen `<ModeFlipOverlay>` mounts on top of EVERYTHING for ~900ms. The state machine in `useModeFlip()`:

```
t=0     User clicks/swipes/keyboards
        Overlay mounts with target-mode color slab sweeping in (skewed -12deg)
        Outgoing "🎮 GAMING" label falls/blurs out

t=250ms White flash (~250ms)

t=400ms Page content's `mode` actually swaps (behind the slab, so the user
        never sees a half-rendered cross-fade)

t=350-650ms Light streaks shoot across screen, target mode label rises
            and settles dead center

t=900ms Overlay clears, busy flag clears, ready for next flip
```

`useModeFlip()` returns `[mode, flip, transition]`. Pass `transition` directly to `<ModeFlipOverlay>`. The hook has a `busy` ref that swallows additional flip calls during the transition — you cannot flip mid-flip.

It also listens for a global `window` event so anything (Control Deck, Tweaks panel, deeply-nested component) can fire a flip without prop drilling:

```js
window.dispatchEvent(new Event('khalil:flip'))
```

### Reference implementation

`directions/topbar.jsx`. Port the structure directly. Notes:

- The flex weighting between halves uses live drag delta. `dragShift` clamps to ±0.3 so the bar never collapses an idle half to nothing during a drag.
- Pointer capture (`setPointerCapture`/`releasePointerCapture`) is essential — without it, dragging off the bar drops the drag.
- `touch-action: pan-y` prevents the browser hijacking horizontal swipes while still allowing vertical scroll.
- Color palette (`PALETTE` const) is the **single source of truth** for mode visuals. Use these exact hex codes throughout the site.

---

## Arena (homepage) — `directions/arena.jsx`

The primary site. Sections, in order:

1. **TopBarMode** — the global toggle (above)
2. **Nav** — K-logo, KHALIL name, page links (REPLAYS / PROFILE / BOOK / SUBS)
3. **Hero** — polaroid card stack + giant title + bio + stat grid + CTA buttons
4. **SubsHud** — subscriber progress bar with goal
5. **NowDock** — what Khalil is playing / watching / reading / listening to this week
6. **Videos** — "REPLAYS" grid; trading-card aesthetic
7. **About** — "PROFILE.DAT" — bio paragraphs
8. **Book** — "writing a book" — handmade paper aesthetic
9. **Foot** — social links + copyright

### The polaroid stack (hero centerpiece)

Three layered cards on the right side of the hero, rotated at angles like a kid pinned them to a corkboard:

- **Back card (`<CardEmblem>`):** colored gradient with a massive `7` numeral. In gaming mode, labels say "GAMERTAG · @khalilgaming2020"; in football mode "JERSEY · HOME · #7". Tilted -9deg.
- **Middle card (`<CardPortrait>`):** circular portrait frame with an emoji placeholder (🎮 or ⚽). Subtitle says "744 SUBS · ONLINE" (gaming) or "STRIKER · LATE EQUALIZER GUY" (football). Tilted +7deg. **Replace the emoji with a real photo when one exists.**
- **Front card (`<CardNote>`):** notebook-paper texture with handwritten copy (Caveat font, weight 700). Gaming: "i'm khalil. and yeah i actually carry." Football: "i'm khalil. the ball does what i tell it." Tilted -4deg.

Common chrome (`<Polaroid>`): cream `#f3ede0` background, double tape strips on top corners, drop shadow. Floats with `k-bob` animation (5s ease-in-out infinite).

### Replays grid (trading cards)

Each video tile is a **die-cut polygon** (notched corners via `clip-path`). Layers, from back to front:

```
linear-gradient(video.from → video.to)          ← background
inset 1.5px tier-color border                   ← rarity frame
linear-gradient holographic foil sheen          ← screen-blend
emoji placeholder, drop-shadowed                ← thumbnail (replace with real)
repeating-linear-gradient scanlines             ← CRT overlay
top-left rarity tag (LEGENDARY/EPIC/RARE/COMMON) ← skewed banner
top-right duration                              ← black pill
center play button (radial gradient w/ tier color) ← circle
bottom info plate with title, views, age        ← gradient fade
```

Tier colors (`TIER_COLORS` in arena.jsx):
- LEGENDARY: gold → orange (`#ffd700` → `#ff8a00`)
- EPIC: pink → purple (`#ff2bd6` → `#7a26ff`)
- RARE: cyan → blue (`#00f0ff` → `#4d8fff`)
- COMMON: slate (`#9ab1bd` → `#5a6a78`)

First video is always LEGENDARY (it's the featured/big one). Default tiering: `['LEGENDARY', 'EPIC', 'RARE', 'EPIC', 'COMMON']`.

### Book section (handmade paper)

Wrapped in a HudCard. Inside:
- **Notebook paper** background `#fef9e6` with repeating horizontal lines + a red margin line at left
- Three "torn paper" holes on the left edge (small circles, dark, with inset shadow)
- Tape strips diagonally on top-right and bottom-left
- The book itself: stacked-pages shadow (two faux pages peeking from behind), gradient cover with halftone dots, red bookmark ribbon, rotated -5deg
- Title in **Permanent Marker** font — "writing / a book." (second line gradient-clipped to mode accent)
- Body copy in **Caveat** font, color `#3a2a14`
- Three "Stamp" badges below: chapter, "DROPS SOON", "SIGNED COPIES" — each rotated slightly, with red/green/blue outlined borders

### Backgrounds

`<GamingBG>` / `<FootballBG>` — two separate scene compositions. Render one based on mode. They use SVG defs with mode-suffixed IDs (`cone1-${size}`) to avoid id collisions when multiple arenas render in the same document. **You don't need this in production** since only one will mount at a time, but keep the pattern in mind if you ever embed them in a story/preview grid.

---

## Tunnel (intro) — `directions/tunnel.jsx`

Scroll-driven 3D corridor. The user walks through 5 rooms in sequence:

```
01 ENTER       — KHALIL title + sub counter
02 REPLAYS     — featured video + side list
03 ABOUT       — profile copy + status chips
04 BOOK        — spotlighted book + chapter info
05 SUBSCRIBE   — destination scene + CTA (locks at end)
```

### How scroll maps to scenes

The hero wrapper is `5× the visible viewport height`. A sticky inner stage pins the corridor in place while the wrapper scrolls past. `useTunnelScroll()` computes a normalized progress `p ∈ [0, 1]` from the wrapper's bounding rect relative to the scroll container — works inside iframes/nested scroll contexts where plain `window.scrollY` would lie.

Each scene owns an overlapping range of `p`:

```
hero:      p=0.00 → 0.28, locks at 0.05-0.15
replays:   p=0.15 → 0.46, locks at 0.22-0.34
about:     p=0.34 → 0.64, locks at 0.40-0.54
book:      p=0.54 → 0.82, locks at 0.60-0.74
subscribe: p=0.74 → 1.00, locks at 0.82-1.00  (never exits — destination)
```

The overlap is deliberate — as one scene fades out from depth=0.5 → 1.0 (camera passes through it), the next one is already fading in from depth=0.0 → 0.5.

### Depth-to-render mapping

`depthToScale()` and `depthToBlur()` in tunnel.jsx:

```
depth 0.0 (far ahead):    scale=0.18, blur=3px, opacity ramping in
depth 0.5 (locked):       scale=1.0,  blur=0px, opacity=1
depth 1.0 (passed):       scale=2.6,  blur=4px, opacity ramping out
```

This is what creates the "walking through" sensation. Each room scales up and dissolves as the camera crosses it.

### Ambient walls

`<TunnelWalls>` renders video thumbnails as floating tiles drifting toward the camera on both sides of the corridor between scenes. They dim by 50% during scene lock windows so they don't compete with content. Lanes have slight tilts (±14deg or ±22deg) for parallax.

### Floor/ceiling perspective

`<TunnelBG>` draws SVG floor/ceiling lines that scroll forward with `p`. Six lines top, six bottom, each phase-offset so they advance smoothly through the camera.

### Implementation note: scroll tracking inside iframes

The default `useScrollHero()` hook in `lib.jsx` was missing programmatic scroll events in nested artboard contexts. `useTunnelScroll()` in `tunnel.jsx` is the robust version — it uses `requestAnimationFrame` + a `setInterval(16ms)` polling fallback. **In production (not inside iframes), the default `useScrollHero` pattern works fine.** Use that.

### Tunnel completion

When `p >= 0.99`, the user has effectively reached the destination. Wire this to the cookie-set + redirect-to-`/` flow described in the routing section.

---

## Control Deck (`/edit`) — `directions/edit.jsx`

The editing experience for Khalil. Two tabs:

### Tab 1: ✎ ON-SITE EDITOR (`InlineEditView`)

The actual homepage layout, rendered in a preview frame, with small floating **edit pins** on every editable element. Tapping a pin opens an editor drawer (desktop: right rail; mobile: slides up below).

Section nav on the left (Hero / Now·Status / Replays / About / Book). Each section shows a faithful mini-rendering of the live site section so Khalil sees exactly what he's editing.

Pins in current spec:
- `hero.title` — top headline + gradient bottom line
- `hero.bio` — bio copy (shares state with `about.copy`)
- `hero.mood` — online status (online / on fire / streaming / in school / sleeping)
- `status.subs` — manual subscriber count with ±1 / ±10 dials
- `status.now` — current game/team
- `replays.pinned` — which video is pinned to the top of REPLAYS
- `about.copy` — about paragraphs (textareas)
- `book.cover` — image upload + cover title
- `book.copy` — book blurb (Caveat handwriting)

### Tab 2: ⌬ CONTROL DECK (`MessageLauncher` + instruments)

The original Control Deck. Left column:

- **`<MessageLauncher>`** — a CSS missile with a textarea in the body. Below it:
  - Payload picker: CONFETTI / GOLD SHOWER / NEON RAVE / FIRE / GOOOAL / BIRTHDAY (each maps to a `<Burst>` `kind`)
  - Fuse picker: NOW / NEXT VISIT / ON REFRESH / +1 HOUR
  - Giant red **PLUNGER** button (CSS-only — body + plate + cap with radial highlight). Pressing animates the handle pushing down (`ed-plunge-down`)
- **`<LaunchWindow>`** — a CRT screen showing a mini render of the homepage, mode-toggled inline. When the plunger fires, this is where the explosion happens (`<Burst>` overlay + animated message text stamp).

Right column:
- **`<StatusModule>`** — 5 mood toggles (ONLINE / ON FIRE / STREAMING / IN SCHOOL / SLEEPING) with colored LEDs
- **`<SubsModule>`** — ±10/±1 dials around current sub count, progress bar to 1000 goal
- **`<NowPlayingModule>`** — text input + preset chips (game names for gaming mode, team/player names for football)
- **`<PinnedVideoModule>`** — list of all videos, click to pin one to REPLAYS top
- **`<AboutModule>`** — three textareas for the three about paragraphs

### Wiring the message launcher in production

The "message launcher" creates a **site-wide alert/announcement**. Data model:

```ts
type ExplodingMessage = {
  id: string
  text: string                // ≤120 chars
  payload: 'confetti' | 'gold' | 'neon' | 'fire' | 'goal' | 'cake'
  fuse: 'now' | 'visit' | 'refresh' | '1h'
  scheduledFor: Date | null   // computed from fuse
  expiresAt: Date | null
  shownToVisitors: string[]   // for 'visit' fuse — dedupe per visitor
  createdAt: Date
}
```

**Fuse semantics:**
- `now` — fires for everyone currently on the site (use Server-Sent Events or websockets — see "Realtime" below)
- `visit` — fires once per visitor on their first page view since the message was created. Track via a cookie or localStorage entry containing seen message IDs
- `refresh` — fires every page load while the message is active. Set an "expires" of 24h or so to avoid spam
- `1h` — like `now` but with a 1-hour delay before firing

**Rendering on the site:** when an explosion fires, mount a full-screen overlay (similar to `<ModeFlipOverlay>`) with the chosen `<Burst>` and the message text stamped center. The message displays for ~3 seconds, then fades.

### Access (how Khalil gets to `/edit`)

Recommended: **secret tap pattern** — visitor taps the K logo five times in a row within 3 seconds → prompts for a password → on success, redirects to `/edit`. Mock this client-side first, then back it with proper auth.

Or simpler: NextAuth + a single magic-link login that only Khalil's email gets. The K-logo tap is just the un-obvious entry point so the URL isn't discoverable.

---

## Content source of truth — `directions/shared.jsx`

All content lives in `window.KHALIL`. In production, this becomes a database (Postgres / Firestore / etc) with the following tables:

```ts
type Khalil = {
  name: string
  age: number
  handle: string
  subs: { current: number; goal: number }
  modes: {
    gaming:   { tagline: string; bio: string; cta: string; vibe: string }
    football: { tagline: string; bio: string; cta: string; vibe: string }
  }
  videos: Array<{
    id: string
    title: string
    views: string
    ago: string
    duration: string
    tag: string
    thumb: { from: string; to: string; emoji: string }  // gradient + emoji
    // Later: thumb.imageUrl
  }>
  now: {
    gaming:   { playing, watching, reading, listening: string }
    football: { playing, watching, reading, listening: string }
  }
  book: { title, subtitle, chapter, status: string }
  about: string[]   // paragraphs
}
```

**Voice rules** (Khalil's voice):
- Lowercase, short sentences
- Deadpan-funny, no buzzwords
- Numbers as digits ("10", not "ten")
- Use "i" not "I" — it's a kid's site
- Italic conviction: "biggest real madrid fan you'll ever meet" not "huge fan"

Don't lose this voice when generating fresh copy.

---

## Type & color tokens

### Fonts (from `index.html`)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Anton&family=Bungee&family=Russo+One&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Caveat:wght@500;600;700&family=Permanent+Marker&display=swap');
```

Roles (constant `F` in arena.jsx, tunnel.jsx, edit.jsx):

| Role     | Family                           | Used for |
|----------|----------------------------------|----------|
| display  | Anton, Bungee, Russo One         | All caps headlines, big numbers |
| body     | Inter, system-ui                 | Paragraphs, default UI |
| mono     | DM Mono, ui-monospace            | Tags, captions, HUD labels |
| stencil  | Bungee, Anton                    | Edit-zone branding (Control Deck) |
| —        | Permanent Marker                 | Book title only |
| —        | Caveat                           | Handwritten notes, book blurb |

### Mode palettes (single source: `PALETTE` in topbar.jsx, also duplicated as `THEMES` in arena/tunnel for richer extension)

```ts
gaming: {
  bgA: '#0e0030',  bgB: '#3a0a5a',  bgC: '#5a14a0',
  accent:  '#00f0ff',  // cyan
  accent2: '#ff2bd6',  // magenta
  accent3: '#ffe600',  // yellow
}
football: {
  bgA: '#001233',  bgB: '#003366',  bgC: '#0a4a2a',
  accent:  '#ffd700',  // gold
  accent2: '#ffffff',  // white
  accent3: '#4d8fff',  // blue
}
```

### Control Deck palette (`ED` in edit.jsx)

```ts
bg:     '#0a0d0f'   panel:  '#171c22'   panel2: '#1d242b'   line:  '#2a333d'
ink:    '#e6f2f6'   inkDim: '#92a4ae'
amber:  '#ffb84d'   green:  '#3df562'   red:   '#ff3a3a'    blue:  '#3ec4ff'
pink:   '#ff63d6'   yellow: '#ffe600'
```

---

## Animation library (`directions/lib.jsx`)

Global keyframes injected once into a `<style id="khalil-anim">` block. Available classes/keyframes:

- `k-bob` / `k-bob-s` — gentle float up-down
- `k-pop-in` — scale-up entrance with overshoot
- `k-stamp-in` — drop-from-above with bounce + blur clear
- `k-shimmer` — sliding gradient (for skeleton/loading)
- `k-pulse-glow` — drop-shadow pulse
- `k-flash` — opaque white flash overlay
- `k-shake` — translate jitter
- `k-rise-fade` — particle drift upward + fade
- `k-confetti` — particle physics for `<Burst>`
- `k-scanline` — CRT-style scanning bar
- `k-glow-pulse` — outer ring pulse
- `k-marker-write` — SVG stroke-dasharray reveal for "drawn" feel

### `<Burst>` component

Tap-to-pop particle effect. Props: `x`, `y` (0-1 normalized), `count`, `kind` (`'confetti' | 'gold' | 'neon' | 'paper' | 'glass'`), `durationMs`, `spread`, optional `colors` override. Render with `key={nonce}` from `useNonce()` to retrigger.

### `useInView()`

IntersectionObserver-backed hook. Returns `[ref, inView]`. Stays true once triggered (animations don't replay on re-scroll). Threshold default 0.15.

---

## Realtime (live messages, sub counter)

The "fire NOW" fuse on the message launcher needs realtime push to all connected clients. Recommended: Pusher / Ably / Soketi (self-hosted) / Convex / Supabase Realtime. Subscribe each page load to a `khalil:announcements` channel; on receipt, fire the explosion overlay.

For the sub counter (Khalil bumps it manually), realtime is nice-to-have. A 30s SWR-style refresh on the homepage is sufficient.

---

## What to build first

1. **Routing skeleton** — `/`, `/intro`, `/edit` with the cookie/sessionStorage gate
2. **Mode toggle** — `<TopBarMode>` + `useModeFlip` + `<ModeFlipOverlay>`. This is your foundation. Get the flip transition pixel-perfect before anything else.
3. **Arena** — sections in order, statically rendered from the content store
4. **Control Deck** — Inline tab first (the on-site editor). The missile launcher is fun but secondary
5. **Tunnel** — last, because it depends on `useScrollHero`-style scroll math which is finicky
6. **Realtime + auth** — once everything else is wired

---

## Things I'd reconsider / open questions

- **Tunnel on every refresh:** I think this is a bad idea (see routing notes). Cookie-30-days is the sweet spot. If Khalil pushes back, do `sessionStorage` per tab.
- **Edit-pin pattern for the on-site editor:** I built it as a separate tab in the Deck. If you want the pins to appear **on the live site** when Khalil is logged in (CMS-grail style), that's doable too — just gate the `<EditPin>` rendering on session state. Both are valid; the tab approach is simpler.
- **Emoji placeholders everywhere:** Replace with real photos when available. Khalil's headshot for the polaroid portrait card, real video thumbnails for replays, an actual book cover photo. The design already has placeholder slots — `image-slot.js` from the design system would be a good fit.
- **The "GOOOAL" payload** should probably also play a stadium-roar audio file. Same with FIRE → whoosh. Out of scope for the prototype.

---

## Final notes

- The current design canvas (`index.html`) is for review only; don't ship it.
- The `T_VIDEOTILE` tier system uses a hardcoded `TIERS` array — make tier a field on the video record so Khalil can override it.
- All animations respect `prefers-reduced-motion: no-preference` implicitly via CSS — wrap heavier effects in a `@media (prefers-reduced-motion: reduce)` override before shipping.
- The tunnel scroll math is the most fragile piece. Test on iOS Safari with touch scroll early; pay close attention to the `position: sticky` inside the wrapper.

Good luck. The vibe is "10-year-old running his own production" — confident but homemade. If something looks too slick, it's probably wrong.
