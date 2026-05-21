# Handoff updates — review batch (May 2026)

A delta on top of `HANDOFF.md`. Apply these on top of the implementation in
flight — they don't restructure anything, just add interactions, an image
store, and tighten a few visuals. Most changes are isolated; section
"Don't break" notes call out the few places where care is needed.

**TL;DR for CC:**

| # | Change                          | Type   | Verify before applying?    |
|---|---------------------------------|--------|----------------------------|
| 1 | `backgroundImage:` not `background:` for gradient text | Style hygiene | **Yes** — see §1   |
| 2 | Hero title sizing                | Style  | **Yes** — see §2           |
| 3 | LEGENDARY holographic sweep      | Visual | No                         |
| 4 | Interaction primitives (new file) | Pattern | No                         |
| 5 | Polaroid stack interactivity     | Visual | No                         |
| 6 | Image upload + store (new file)  | Feature | No — design check only    |
| 7 | `/edit` IMAGES section           | Feature | No                         |
| 8 | Mode-peek hover preview          | Pattern | No                         |
| 9 | Tunnel depth + onboarding card   | Visual | No                         |

**Cut from this batch:** A "fan signal" global heart-counter widget was
prototyped and removed at the user's direction. **Do NOT implement.** All
fan-signal traces have been removed from the design files; ignore any
stragglers if you encounter them.

---

## 1 · Gradient text — `backgroundImage:` instead of `background:` shorthand

**File:** `directions/arena.jsx`, `directions/tunnel.jsx`, `directions/edit.jsx`

**Where:** Anywhere a heading uses the gradient-clipped-to-text pattern
(`THE GOAT`, "a book.", etc.).


```diff
- background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
+ backgroundImage: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
```



**Rationale:** The `background:` shorthand resets `background-clip` to
`border-box`. In React inline styles, the bug doesn't usually appear
because subsequent `WebkitBackgroundClip: 'text'` re-sets it within the
same batch, but the longhand form is clearer and bug-proof in all paths
(CSS-in-CSS, mixed inline + class, SSR hydration order, etc.).

**Verify before applying:** Render the current prod build with `THE GOAT`
in football mode. If the gradient is visible and clipped, this is purely
hygiene — apply at your discretion. If the text appears as a solid
rectangle, the bug IS present (likely from a non-React render path), and
the fix is mandatory.

**Don't break:** Keep all three properties (`WebkitBackgroundClip`,
`WebkitTextFillColor`, `backgroundClip`) — Safari needs both prefixed
variants.

---

## 2 · Hero title sizing — tighter

**File:** `directions/arena.jsx` (inside `Hero`)

| Token        | Before    | After       |
|--------------|-----------|-------------|
| `titleA` (KHALIL)    desktop | 200px | **168px** |
| `titleB` (THE GOAT)  desktop | 160px | **132px** |
| `line-height`        all     | 0.86  | **0.95**  |

Tablet and mobile unchanged.

**Rationale:** At line-height 0.86, the ascenders of the giant title were
crowding the polaroid stack on the right and visually eating the
"STREAKER · MADRIDISTA · FOREVER 7" tagline above. Pulling to lh 0.95
gives the hero room to breathe.

**Verify before applying:** Open the current prod build on a 1440px+
desktop browser. If the hero looks cramped (title kissing the polaroid
or the tagline feels squeezed), apply this. If it already looks open and
the title feels appropriately heroic at 200px, the original sizing wins
— this was tuned in the design canvas at zoom-fit scale and may not
reflect real browser rendering.

**Don't break:** Keep tablet/mobile unchanged — they were sized for
narrower viewports and don't have the same density problem.

---

## 3 · LEGENDARY tier — holographic sweep

**File:** `directions/arena.jsx`, `directions/interactions.jsx`

The featured replay tile is always LEGENDARY (gold/orange tier). To
visually distinguish it from EPIC/RARE/COMMON without making it
obnoxious, a 3.4s holographic sheen sweeps across it on loop.

**Implementation:**


```js
{isLegend && (
  <div aria-hidden style={{
    position: 'absolute', inset: 0,
    background: `linear-gradient(110deg, transparent 0%, transparent 40%, #fff8 47%, ${tc[0]}cc 50%, #fff8 53%, transparent 60%, transparent 100%)`,
    backgroundSize: '300% 100%',
    mixBlendMode: 'screen',
    animation: 'kfx-legend-sweep 3.4s ease-in-out infinite',
  }} />
)}
```



The `kfx-legend-sweep` keyframe lives in `directions/interactions.jsx` as
a one-time-injected stylesheet:


```css
@keyframes kfx-legend-sweep {
  0%, 18%   { background-position: -120% 0 }
  45%, 55%  { background-position: 50% 0 }
  82%, 100% { background-position: 220% 0 }
}
```



**Don't break:** This is GPU-cheap (background-position animation on a
single element). Don't apply it to EPIC/RARE/COMMON tiers — it stops
being a distinguishing signal if every tier sparkles.

---

## 4 · Interaction primitives — `directions/interactions.jsx`

**New file.** Three reusable primitives + a hooks set, all GPU-only
(transform + opacity), all honoring `prefers-reduced-motion`. Adds one
`<style>` block to `document.head` on first load.

### Globals exposed


```ts
// Component primitives
window.Pressable    // hover-lift + ripple + scale-press + optional long-press
window.Jiggleable   // tap-rotate jiggle wrapper
window.Burst        // (pre-existing) particle burst

// Hooks
window.useHoverTilt({ max, scale }): RefObject  // mousemove 3D tilt
window.useLongPress(callback, { ms })           // ms long-press handler set
```



### `<Pressable>` API


```jsx
<Pressable
  tag="button"               // element tag, default 'button'
  onTap={fn}                 // fires on quick tap/click
  onLongPress={fn}           // fires on hold >= longPressMs (default 500ms)
  longPressMs={500}
  rippleColor="#00f0ffaa"    // ripple from the press point
  ringColor="#00f0ff"        // (also used as ripple fallback)
  lift={true}                // hover translateY(-3px), default true
  style={...} className=""
>
  ...children
</Pressable>
```



Honors `prefers-reduced-motion: reduce` — all transitions/ripples/lifts
are stripped to no-op CSS.

**Production note:** In React 18+ with strict-mode StrictMode double-mounting,
`useLongPress` and the internal Pressable timer are stable across remount
(use a ref for the timer, not state). The reference implementation does this
correctly — port it as-is rather than re-deriving.

### `useHoverTilt({ max, scale })`

Returns a `ref` to attach to any element. On `pointermove` inside the
element, applies `perspective(900px) rotateX/Y(±max deg) scale(scale)`.
Disabled on `@media (hover: none)` and reduced-motion.

Throttled with `requestAnimationFrame` — safe to attach to multiple
elements simultaneously.

### `<Jiggleable>`

Wraps content with a tap-fires-rotation-jiggle animation. Used for stat
tiles (K/D, WINS, etc.) — adds personality without disturbing layout.

### Where these are wired in the prototype

| Element            | Component    | Why |
|--------------------|--------------|-----|
| SUBSCRIBE button   | `Pressable`  | Ripple + lift + hold-to-test |
| WATCH button       | `Pressable`  | Ripple + lift |
| Video tiles        | `Pressable`  | Tier-color ripple |
| Stat tiles (4×)    | `Jiggleable` | Tap → quick jiggle |
| Polaroid stack     | `useHoverTilt` | 3D tilt of whole stack on mousemove |

**Don't break:** Don't pass `onTap`/`onLongPress`/`ringColor`/
`rippleColor` to a raw DOM `<button>` — those are Pressable-only props
and React will console-warn if they hit the DOM. Use `onClick` on plain
buttons.

---

## 5 · Polaroid stack interactivity

**File:** `directions/arena.jsx` (`Polaroid`, `PolaroidStack`), additional
CSS in `directions/interactions.jsx`.

Four layers, all composable:

1. **Staggered bob** — Each polaroid mounts with a random
   `animation-delay` between `-0s` and `-4.5s` on the `k-bob` animation.
   Stack breathes organically instead of moving in lockstep.

2. **Per-card hover lift** — Hovering an individual card lifts it 7px,
   scales 1.025, raises z-index, deepens the shadow. Disabled on
   `@media (hover: none)`.

3. **Tap-to-pop** — Pointer-down on any card bumps a React `key` to
   force a one-shot `polaroid-pop` animation: leap forward (-18px),
   untilt, scale 1.075, settle back. ~550ms total.

4. **Stack fan-out** — Each card carries a `--spread-x` / `--spread-y`
   CSS variable. Two triggers:
   - Desktop: hovering the stack container (any card) sets a CSS rule
     that translates each card by its spread vector.
   - Touch: tapping any card adds a `.fan-out` class to the stack
     container for ~1.4s, then auto-clears.

### Critical pattern — rotation as CSS variable

Each card's static rotation is exposed as a CSS custom property `--rot`
on the inner Polaroid div. All transforms (hover, pop, fan, plus the
combined hover+fan+pop) compose with `rotate(var(--rot))` so the
rotation never disappears mid-animation. **Preserve this pattern.**
Setting `transform: rotate(-9deg)` statically and then animating
`transform: translateY(...)` strips the rotation for the duration of the
animation — a CSS animation's keyframes fully replace transform.


```jsx
// Outer wrapper handles bob only (no rotation concerns)
<div style={{ animation: `k-bob 4.6s ease-in-out ${bobDelay}s infinite` }}>
  {/* Inner handles rotation + hover + click + spread */}
  <div className="khalil-polaroid"
    key={popN}
    onPointerDown={() => setPopN(n => n + 1)}
    style={{ '--rot': rot,
      animation: popN ? 'polaroid-pop .55s cubic-bezier(.2,1.4,.4,1) both' : 'none' }}>
    {/* polaroid content */}
  </div>
</div>
```



**Don't break:**
- The nested-divs architecture is load-bearing. Don't collapse it back
  to a single div — the bob animation will trample static rotation.
- `pointer-events` on the inner card must stay default. Disabling them
  breaks the per-card tap-to-pop AND the parent's pointerdown-fires-fan.
- The stack `.fan-out` class is added/removed via React state, not CSS
  `:active` — it has to persist past the brief pointerdown→up cycle.

---

## 6 · Image upload — `directions/store.jsx`

**New file.** A tiny client-side store for image slots. Prototype-only;
**swap for a real database in production.**

### Public API


```ts
// Set / get / clear
window.setImageSlot(id: string, dataUrl: string | null): void
window.getImageSlot(id: string): string | null
window.getAllImageSlots(): Record<string, string>

// React hook
window.useImageSlot(id: string): string | null   // subscribes, re-renders on change

// File reader + auto-resize to max 1024px, returns JPEG dataUrl (~80%)
window.readImageFile(file: File, max?: number): Promise<string>
```



### Slot IDs currently in use


```
portrait-gaming     // CardPortrait when mode === 'gaming'
portrait-football   // CardPortrait when mode === 'football'
book-cover          // Book section cover
replay-v1, …, replay-v5   // VideoTile thumbnails
```



### Storage details (prototype)

- Backed by `localStorage` key `khalil:images:v1`
- Image read pipeline: `FileReader` → `Image` → `<canvas>` (resized to
  max 1024px on long edge) → `toDataURL('image/jpeg', 0.82)`
- ~80% JPEG keeps a 5MB localStorage budget tractable
- Uses React 18's `useSyncExternalStore` for the hook

### Production swap-out

Replace the `localStorage` read/write paths with:


```ts
// Read: same shape (slotId → url), come from your DB
const imgs = await fetchImageSlots()   // { portrait-gaming: 'https://...', ... }

// Write: PUT to your asset storage (S3/Cloudflare R2/etc.),
// then update DB row with the returned URL.
async function setImageSlot(slotId, file) {
  const url = await uploadToStorage(file)   // returns CDN URL
  await api.updateSlot(slotId, url)
}
```



The hook (`useImageSlot`) can keep its current shape — point it at a
real-time channel or polled fetch instead of the in-memory pub/sub.

**Don't break:**
- The slot ID format (`portrait-${mode}`, `replay-${v.id}`, etc.) is
  hard-coded in arena. Keep the same IDs in production or update both
  ends together.
- The image-or-emoji fallback in arena's render path is the safety net
  — never hard-fail rendering when a slot is empty.

---

## 7 · `/edit` IMAGES section

**File:** `directions/edit.jsx`

A new tab in the on-site editor's left nav, sitting after the BOOK
section. Lists all 8 image slots as drop-zones.


```js
const SECTIONS = [
  // ... existing ...
  { id: 'images', label: 'IMAGES', icon: '◇' },
]
```



The `ImagesPreview` component renders an `ImageDropzone` per slot. Each
dropzone:
- Click → opens file picker
- Drag-over → highlights amber, accepts drop
- Display → live thumbnail, `✓ LIVE ON SITE` overlay
- "× remove" button → reverts to placeholder

The same `ImageDropzone` is also used in the `BOOK` pin's cover field
(`openPin === 'book.cover'`). Both edit the same `book-cover` slot —
shared state via the store.

**Don't break:**
- Don't lock image uploads into one location. Both the BOOK pin and the
  IMAGES tab MUST write to the same slot. If you split the storage, the
  UX gets confusing fast.
- Photos render *as-is* in placeholder positions (circle for portrait,
  rectangular for book/replay). Don't add automatic cropping UI — let
  Khalil drop and try, then re-drop if it's off.

---

## 8 · Mode-peek hover preview

**File:** `directions/topbar.jsx`, `directions/arena.jsx`

When the user hovers the IDLE (smaller) half of the topbar, the entire
page gets a soft accent-color wash from the top — previewing what the
other mode would look like. Pointer leave reverses it. Disabled during
the actual mode flip transition.

### Mechanism


```js
// topbar Half onPointerEnter:
window.dispatchEvent(new CustomEvent('khalil:peek', { detail: { mode: targetMode } }))
// On leave / cancel:
window.dispatchEvent(new CustomEvent('khalil:peek', { detail: { mode: null } }))
```




```js
// ArenaRoot listens:
React.useEffect(() => {
  const on = (e) => setPeek(e.detail?.mode || null)
  window.addEventListener('khalil:peek', on)
  return () => window.removeEventListener('khalil:peek', on)
}, [])
```



The arena renders a soft gradient overlay (60vh tall, `mix-blend-mode:
screen`) in the peeked mode's accent — visible only when `peek` is
non-null AND differs from the currently-active mode.

**Don't break:**
- `pointer-events: none` on the overlay is mandatory — it must not
  intercept clicks targeting the hero.
- Suppress peek during a transition; `useModeFlip().transitioning` is
  the right gate.
- This is a single-listener pattern — don't multiply listeners across
  components that should hear the same event.

---

## 9 · Tunnel — depth + onboarding

**File:** `directions/tunnel.jsx` (`TunnelBG`, scroll cue layer)

### Depth fix

The original corridor had only floor + ceiling perspective lines, which
read as a horizon (not an enclosed tunnel). Added three visual layers:

1. **Concentric receding rings** — 12 rectangle outlines emanating from
   the vanishing point at `(200, 200)`, scaled with `phase² ` so they
   compress near the center and spread out as they approach. This is
   the "doorway after doorway" effect that sells "I am walking inside a
   corridor".

2. **More + brighter radials** — 20 evenly-distributed vanishing-point
   lines (was 6 diagonals at 0.25 opacity). Now 0.42 opacity, evenly
   spaced around the full clock so the back wall reads as a tunnel
   opening.

3. **Radial vignette** — a subtle dark ring at the SVG edges, brighter
   at the vanishing point. Sells depth without geometry.

All scale-with-progress and remain SVG (no canvas / no JS animation).

### First-load onboarding card

Centered toward the bottom of the viewport, visible only while
`p < 0.04` (very start). Fades fast as user scrolls.


```
· STAND BY ·
SCROLL TO WALK
THROUGH THE TUNNEL
        ↓
```



Sits at `zIndex: 66` (just above the existing `↓ KEEP WALKING` pill).
Once it fades, the smaller pill (always visible until `p > 0.93`) takes
over.

**Don't break:**
- The first-load card uses `opacity: clamp((0.04 - p) * 25, 0, 1)` so
  it disappears within ~120 viewport-px of scroll. If you migrate the
  scroll math, keep this fast-fade.
- Tunnel `<defs>` use mode-suffixed IDs (`vignette-${mode}`,
  `floor-${mode}`, etc.) to avoid collision with the other mode's
  tunnel renders. Preserve this pattern if you embed multiple corridors
  on a page.

---

## Files inventory


```
ADDED
─────
directions/interactions.jsx     New — Pressable, Jiggleable, useHoverTilt,
                                useLongPress + a polaroid CSS block
directions/store.jsx            New — image-slot store, useImageSlot hook,
                                readImageFile resizer

CHANGED
───────
directions/arena.jsx            Polaroid nesting + tap-pop, fan-out, image
                                fallbacks, hero density, LEGENDARY sweep
                                hook-up, mode-peek listener, Pressable
                                wiring
directions/tunnel.jsx           Receding rings + radials + vignette + first-
                                load card; backgroundImage gradient fix
directions/edit.jsx             IMAGES section, real ImageDropzone wired to
                                store, useImageSlot consumption
directions/topbar.jsx           Mode-peek pointer broadcast on idle half
directions/lib.jsx              No keyframes added (peek/polaroid live in
                                interactions.jsx)
index.html                      Loads interactions.jsx + store.jsx before
                                shared.jsx

REMOVED
───────
(none from previous handoff — fan signal experiment was added and removed
in the same review cycle, no trace remains)
```


---

## Open questions for production

1. **Image storage backend.** Prototype is localStorage + dataURL. In
   production: S3 / Cloudflare R2 / Supabase Storage for the binary;
   Postgres / Firestore row keyed by slot ID for the reference. Either
   way, keep `useImageSlot(slotId)` as the read API — it's already
   contract-shaped to be backed by anything.

2. **Image dimensions/crop.** No automatic crop UI currently. If users
   upload mismatched aspect ratios, the placeholder positions handle it
   gracefully (`background-size: cover`), but consider whether a crop
   step should be added at upload time for the book cover specifically.

3. **`prefers-reduced-motion` audit.** The interaction primitives and
   the polaroid CSS honor it. The tunnel scroll-driven animation does
   NOT — by design it's the user driving every frame, but if reduced
   motion is set, consider skipping the tunnel entirely and routing
   straight to `/`.

4. **Mode-peek on touch.** Currently fires on `pointerenter`/`leave`,
   which means a tap-and-hold on the idle topbar half will trigger a
   brief peek before the tap actually flips. Probably fine; if it
   reads as broken, gate the peek behind `(hover: hover)` only.

---

## Things explicitly NOT in this batch

- **Fan signal** — prototyped, reviewed, cut. Do not implement. If you
  see references in older docs, they're stale.
- **Image cropping UI** — out of scope.
- **Real-time anything** — see HANDOFF.md §Realtime.
- **Auth on `/edit`** — see HANDOFF.md §Access.

---

The whole point of this batch was small, surgical additions on top of a
stable core. Each item above is independently shippable — if any one
breaks in your stack, skip it and the rest still work. Don't refactor
the existing arena/tunnel/edit roots; just thread the new primitives
through.
