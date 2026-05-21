# 🎮⚽ KHALIL.OPS · OPERATOR MANUAL

```
╔══════════════════════════════════════════════╗
║                                              ║
║   KHALIL.OPS · v1.0                          ║
║   ─────────────────────                      ║
║   PILOT:        KHALIL                       ║
║   STATUS:       ● ONLINE                     ║
║   CLEARANCE:    LEVEL ∞                      ║
║                                              ║
╚══════════════════════════════════════════════╝
```

Yo Khalil. This is the manual for your own site. Read it once, then keep
it around for when you forget what a button does. Every section ends with
a **TL;DR** so you can skim if you're in a hurry.

---

## TABLE OF CONTENTS

```
PART 1  ◇  THE SITE              ← what visitors see
PART 2  ◇  THE TWO MODES         ← gaming vs football
PART 3  ◇  THE TUNNEL            ← the entry sequence
PART 4  ◇  THE ARENA             ← the homepage layout
PART 5  ◇  SECRET DOOR (/edit)   ← where you control everything
PART 6  ◇  MISSION CONTROL       ← LAUNCH tab — fire messages
PART 7  ◇  CONTROL DECK          ← INLINE tab — edit fields
PART 8  ◇  IMAGE UPLOADS         ← drop your own photos
PART 9  ◇  SAVE & FIRE           ← how stuff goes live
PART 10 ◇  TROUBLESHOOTING       ← when something looks wrong
```

---

# PART 1 ◇ THE SITE

Your site lives at **khalil2020.vercel.app**.

Anyone in the world can visit. They'll see:

```
  /intro       ← the tunnel walk (first-time visitors)
  /            ← the arena (the actual homepage)
  /edit        ← YOUR SECRET DOOR (locked unless you have the password)
```

When someone visits for the first time, they get dropped into the
**tunnel** at `/intro`. Once they hit the **▶ ENTER THE ARENA** button at
the end, a cookie gets baked into their browser and from then on they
land straight at `/` — the actual site.

**TL;DR** — First-timers walk through the tunnel. Repeat visitors skip
straight to the arena. You can always visit `/intro` directly if you
want to see the walk again.

---

# PART 2 ◇ THE TWO MODES

Your site has **two personalities** that swap with one tap:

```
  ┌──────────────────────────────────────────────┐
  │  🎮  GAMING                ⚽  FOOTBALL       │
  │  ── neon, purple, glitch    ── grass, gold,   │
  │                                stadium-vibe   │
  └──────────────────────────────────────────────┘
```

### How to flip modes

| Device  | How                                            |
|---------|------------------------------------------------|
| Desktop | Click the smaller half of the top bar          |
| Desktop | OR press ← / → arrow keys                       |
| Mobile  | Swipe horizontally anywhere on the page        |
| Mobile  | OR tap the smaller half of the top bar         |

### Mode-peek (desktop only)

If you just **hover** the smaller (idle) half without clicking, the page
gets a soft glow in the other mode's color — like a sneak peek. Move your
mouse away and it disappears. It's a hint, not a flip.

### What changes when you flip

- The **whole color palette** (neon pink/purple vs stadium green/gold)
- The **hero title** (KHALIL THE GOAT vs KHALIL THE GOAT — same text, different font weights)
- Your **stats grid** (K/D + WINS + STREAK + HRS vs GOALS + CAPS + TROPHIES + ROBONA)
- Your **NOW block** (gaming: equipped loadout. football: starting XI)
- The **video tags** on each replay tile (GAMING vs FOOTBALL)
- The **background art** (gaming grid vs stadium grass)
- Stadium crowd ambient hum (football only — keep your volume up if you
  want the vibe)

### What does NOT change between modes

- Your subscriber count
- The book section
- The video list itself
- Your mood / status LED
- Socials links

**TL;DR** — One toggle swaps the entire color world. Some stuff is per-mode
(hero copy, stats, now block). Some stuff is shared across both (subs, book,
videos, socials, mood).

---

# PART 3 ◇ THE TUNNEL

The tunnel is the **cinematic intro**. Five scenes, scrolled through in
order. The math is: scroll progress 0 → 1 walks the camera through the
corridor.

```
  ┌──────────────────────────────────────────────┐
  │  01 · HERO                                   │
  │     "I AM KHALIL" — your handle + subs       │
  │                                              │
  │  02 · REPLAYS                                │
  │     a few floating video previews            │
  │                                              │
  │  03 · ABOUT                                  │
  │     who you are, in your words               │
  │                                              │
  │  04 · BOOK                                   │
  │     the book you're writing                  │
  │                                              │
  │  05 · DESTINATION  ← the ▶ ENTER button      │
  │     hit the goal + "in / outside the arena"  │
  └──────────────────────────────────────────────┘
```

While walking:
- A **low rumble** starts on the first scroll (the engine hum)
- Each scene **thunks** as you approach it
- The destination scene gets a **bell chord chime**

There's also a "**· STAND BY · SCROLL TO WALK ·**" card the first time
you land, so visitors know to scroll.

**TL;DR** — Scrolling the tunnel = walking forward. Sound is part of it.
The ENTER button at the bottom takes you into the arena and remembers you.

---

# PART 4 ◇ THE ARENA

The arena is the actual homepage. Top to bottom:

```
  ╔══════════════════════════════════════════════╗
  ║  🎮 GAMING       │       FOOTBALL ⚽         ║  ← top bar (the toggle)
  ╠══════════════════════════════════════════════╣
  ║  ● ONLINE        @khalilgaming2020           ║  ← nav (handle + mood LED)
  ╠══════════════════════════════════════════════╣
  ║                                              ║
  ║    KHALIL          ┌─────────┐               ║
  ║    THE GOAT         │ POLAROID│              ║  ← hero
  ║                    │  STACK  │               ║
  ║    [subscribe]      └─────────┘              ║
  ║    K/D · WINS · STREAK · HRS                 ║
  ║                                              ║
  ╠══════════════════════════════════════════════╣
  ║  SUBSCRIBERS · GOAL   744 / 1000             ║  ← subs hud
  ║  [████████░░░░░] 74%                         ║
  ╠══════════════════════════════════════════════╣
  ║  NOW · EQUIPPED                              ║  ← now dock
  ║  playing/watching/reading/listening          ║
  ╠══════════════════════════════════════════════╣
  ║  ◇ REPLAYS                                   ║  ← videos
  ║  [LEGENDARY] [EPIC] [RARE]                   ║
  ║  [EPIC]      [COMMON]                        ║
  ╠══════════════════════════════════════════════╣
  ║  ABOUT  ←  paragraphs you wrote              ║
  ╠══════════════════════════════════════════════╣
  ║  BOOK   ←  the book you're writing           ║
  ╠══════════════════════════════════════════════╣
  ║  YT · TT · IG                                ║  ← foot (socials)
  ╚══════════════════════════════════════════════╝
```

### Things that move on the homepage

- The **polaroid stack** breathes (slight up/down bob), tilts when you
  hover, and **fans out** when hovered (desktop) or tapped (mobile).
  Tap any card → it pops forward briefly. Each card carries its own
  little rotation.
- The **subscribe button** + **watch button** lift slightly on hover and
  ripple from the click point. Stat tiles do a tiny jiggle when tapped.
- Video tiles have a **holographic sheen** — gold/orange ones (LEGENDARY)
  get an extra bright sweep on loop. Other tiers stay calm.
- The **mood LED** next to your handle blinks softly based on your
  current mood (online / on-fire / streaming / in-school / sleeping).

### Sounds on the homepage

- Football mode plays a **stadium crowd ambient** — subtle, always on
  while football is the active mode
- Gaming mode is silent ambient (no constant sound)
- Flipping modes plays a **whoosh** (gaming) or **crowd cheer + horn**
  (football)
- A **plunger ka-CHUNK** + your chosen payload sound when an announcement
  fires (from /edit)

The **🔊 speaker button** in the bottom-right corner toggles ALL sound
on/off. Your choice is remembered for next visit.

**TL;DR** — The arena is your homepage. Most things on it are
interactive — try hovering, tapping, scrolling. Sound is a big part of
the vibe; the speaker button mutes everything if you need quiet.

---

# PART 5 ◇ SECRET DOOR (/edit)

Go to **khalil2020.vercel.app/edit** and type your password.

```
  ┌──────────────────────────────────────────────┐
  │  EDIT ACCESS                                 │
  │  ┌──────────────────────────────────────┐   │
  │  │  password: ●●●●●●●●●●                │   │
  │  └──────────────────────────────────────┘   │
  │  [ AUTHENTICATE → ]                          │
  └──────────────────────────────────────────────┘
```

Once you're in, the top bar swaps to:

```
  ┌──────────────────────────────────────────────┐
  │ KHALIL.OPS  [LAUNCH][INLINE]  ⊕ SAVE  × EXIT │
  └──────────────────────────────────────────────┘
```

Two tabs. Both edit the **same site** — pick whichever feels right for
what you're trying to do:

- **LAUNCH** ← Mission Control. The big plunger + side modules.
  Use it when you want to **fire a message** (announcement) or
  quickly tweak status / now-playing / pinned video without scrolling.
- **INLINE** ← Control Deck. Mini-mockups of the site with pins
  on every editable field. Use it when you want to see what each
  section will look like as you change it.

Anything you change in one tab shows up in the other. **They share the
same memory.** No "switching loses my work" — it's the same canvas.

### The two action buttons

| Button       | Does                                                         |
|--------------|--------------------------------------------------------------|
| ⊕ **SAVE**   | Pushes everything you changed (except messages) to the live site. Takes ~1 minute to deploy. |
| × **EXIT**   | Logs you out. Site stays exactly as it was last saved.       |

Press SAVE when you're done editing a batch of stuff. **You can change a
LOT before saving** — it's one commit per save.

**TL;DR** — /edit is the only password-locked page. Two tabs, both edit
the same content. SAVE pushes everything live (except messages). EXIT
logs out.

---

# PART 6 ◇ MISSION CONTROL (the LAUNCH tab)

This is your **broadcast deck**. The headline feature: send a real-time
message to anyone currently on the site.

```
  ┌──────────────────────────────────────────────┐
  │  ┌────────────────────┐                      │
  │  │ LAUNCH WINDOW      │  ← CRT preview       │
  │  │                    │  (shows what fires)  │
  │  │  GAMING / FOOTBALL │                      │
  │  └────────────────────┘                      │
  │                                              │
  │  message:  [_________________________]       │
  │            120 chars max                     │
  │                                              │
  │  payload: 🎉 💰 ⚡ 🔥 ⚽ 🍰                   │
  │  fuse:    NOW  1H  VISIT  REFRESH            │
  │                                              │
  │             [ ▼ FIRE ]                        │
  └──────────────────────────────────────────────┘
```

### Step-by-step: firing a message

1. **Type the message** — what you want everyone to see (up to 120 chars).
2. **Pick a payload** — what kind of celebration:
   - 🎉 **CONFETTI** — paper pop + sparkly chirps
   - 💰 **GOLD** — Mario-coin shower (14 pings)
   - ⚡ **NEON** — bass drop + rave zap
   - 🔥 **FIRE** — boom + breathing flame + crackles
   - ⚽ **GOAL** — referee whistle + horn + crowd roar
   - 🍰 **CAKE** — party horn + bell triad
3. **Pick a fuse** — when it should go off:
   - **NOW** — fires the instant you press FIRE (active for 5 min)
   - **1H** — fires one hour from now (active for 5 min)
   - **VISIT** — fires the next time a NEW visitor lands (active for 24 hours)
   - **REFRESH** — fires every time the page is refreshed for the next hour
4. **Hit the FIRE plunger** — big red button at the bottom.

The CRT preview at the top shows you exactly what visitors will see. The
plunger goes **ka-CHUNK** and the payload sound plays as it lands.

### The 5 side modules (always visible)

These edit things directly — no need to switch tabs:

| Module           | Edits                                              |
|------------------|----------------------------------------------------|
| **LIVE STATUS** | Mood LED + sub count (current + goal)              |
| **NOW · EQUIPPED / STARTING XI** | What you're playing/watching/reading/listening (per mode) |
| **PINNED REPLAY** | Which video shows up first in the REPLAYS section  |
| **REPLAY STYLE** | YouTube vs designed thumbnails, card rarities, palette |
| **ABOUT** | The about paragraphs at the bottom of the site     |
| **BOOT MODE** | Whether new visitors land in gaming or football    |
| **SOCIALS** | TikTok + Instagram links in the footer             |

### Important difference: messages vs everything else

```
  MESSAGES (the plunger)        EVERYTHING ELSE
  ─────────────────────         ───────────────────
  ▼ FIRE button                 ⊕ SAVE button
  goes out instantly            takes ~1 minute
  no deploy                     triggers a rebuild
  shows up in ~3 seconds        shows up after deploy
```

**Why the difference?** Messages are temporary — they live in a fast
storage and disappear after their fuse expires. Everything else
(your handle, stats, videos, book, etc.) is part of the actual site so
saving it pushes a new version of the site live.

**TL;DR** — The plunger sends a message that pops on the homepage within
a few seconds. The SAVE button updates the actual site (slower but
permanent). Both work from the LAUNCH tab; you just press different
buttons.

---

# PART 7 ◇ CONTROL DECK (the INLINE tab)

This tab shows **mini-mockups** of every section of the homepage. Each
section has small **EDIT pins** floating on it — tap a pin to open a
**drawer** with a form for that exact field.

```
  ┌──────────────────────────────────────────────┐
  │ ● MODE TOGGLE   [GAMING] [FOOTBALL]          │
  │                                              │
  │ ┌──────────────────────────────────────┐ ──┐ │
  │ │ HERO PREVIEW                         │   │ │
  │ │   @handle              ┌── HANDLE ┐  │   │ │
  │ │   tagline + bio        └──────────┘  │   │ │
  │ │   [SUBSCRIBE] vibe     ┌── HERO ──┐  │   │ │
  │ │   stats grid           └──────────┘  │   │ │
  │ │                        ┌── STATS ─┐  │   │ │
  │ │                        └──────────┘  │   │ │
  │ └──────────────────────────────────────┘   │ │
  │ ┌──────────────────────────────────────┐   │ │
  │ │ STATUS PREVIEW                       │   │ │
  │ │   mood + now + subs                  │   │ │
  │ └──────────────────────────────────────┘   │ │
  │ ┌──────────────────────────────────────┐   │ │
  │ │ REPLAYS PREVIEW                      │   │ │
  │ │   pinned + 4 mini thumbs             │   │ │
  │ └──────────────────────────────────────┘   │ │
  │ ┌──────────────────────────────────────┐   │ │
  │ │ ABOUT / BOOK / FOOTER / IMAGES       │   │ │
  │ └──────────────────────────────────────┘ ──┘ │
  │ [BOOT MODE: GAMING] [SOCIALS: 0/2]           │
  └──────────────────────────────────────────────┘
```

### Every pin and what it edits

| Pin            | Opens an editor for                                   |
|----------------|-------------------------------------------------------|
| **HANDLE**     | Your @ username (max 40 chars)                        |
| **HERO**       | Tagline + bio + CTA button text + vibe (per mode)     |
| **STATS**      | The 4 stat cells (label + value, per mode)            |
| **MOOD**       | The blinking LED next to your handle                  |
| **SUBS**       | Current + goal numbers                                |
| **NOW**        | Equipped / Starting XI block (per mode)               |
| **PINNED**     | Which video pins to the top of REPLAYS                |
| **STYLE**      | YouTube vs designed thumbnails + tier rarities + palette |
| **ABOUT**      | The paragraphs at the bottom                          |
| **BOOK**       | Title + subtitle + description + status + **cover photo** |
| **SOCIALS**    | TikTok + Instagram links                              |
| **BOOT MODE**  | Default mode for new visitors                         |

### Mode-aware editing

The HERO, STATS, and NOW sections **are different in gaming vs football**.
The mode toggle at the top of the inline tab (GAMING / FOOTBALL) tells the
preview which version you're looking at. Flip it before editing the
mode-specific fields.

### The drawer

Tapping a pin slides a drawer out from the right side with the form.
Make your changes → the preview updates live → close the drawer → press
SAVE at the top to push to the site.

**TL;DR** — INLINE is the precision editor. See the site in miniature,
tap an EDIT pin to open the field, type, close, save.

---

# PART 8 ◇ IMAGE UPLOADS

Scroll to the bottom of the **INLINE tab**. You'll see the **◇ IMAGES**
section. This is where you replace placeholder art with your own photos.

### The 8 slots

```
  ┌──────────────────────────────────────────────┐
  │  ◇ IMAGES                                    │
  │                                              │
  │  ┌──────────┐ ┌──────────┐                   │
  │  │ PORTRAIT │ │ PORTRAIT │  ← the polaroid   │
  │  │  GAMING  │ │ FOOTBALL │     portrait card │
  │  └──────────┘ └──────────┘                   │
  │                                              │
  │  ┌──────────┐                                │
  │  │   BOOK   │  ← the book cover              │
  │  │  COVER   │                                │
  │  └──────────┘                                │
  │                                              │
  │  // replay thumbnails (5)                    │
  │  ┌────────┐ ┌────────┐                       │
  │  │ REPLAY │ │ REPLAY │  ← per-video thumb    │
  │  │   1    │ │   2    │                       │
  │  └────────┘ └────────┘                       │
  │  ┌────────┐ ┌────────┐                       │
  │  │   3    │ │   4    │                       │
  │  └────────┘ └────────┘                       │
  └──────────────────────────────────────────────┘
```

### How to upload

1. **Click** a slot OR **drag-and-drop** an image onto it.
2. The image gets resized (down to ~1024px on the long edge) and uploaded.
3. The thumbnail appears with a **✓ LIVE ON SITE** badge.
4. Press **SAVE** at the top.

### To replace or remove

- **Replace:** click the slot again → pick a new file. The old one gets
  replaced (don't worry, no one sees the old one once you save).
- **Remove:** press the **× remove** button below the thumbnail.
  Press SAVE — and the slot reverts to its default (emoji / gradient).

### Where each slot shows up on the site

| Slot                | Where it lands on the homepage                          |
|---------------------|---------------------------------------------------------|
| `portrait-gaming`   | Middle polaroid card (when gaming is active)            |
| `portrait-football` | Middle polaroid card (when football is active)          |
| `book-cover`        | Book section cover (replaces the gradient)              |
| `replay-{video-id}` | That specific video's thumbnail (overrides YouTube's)   |

### Two places to edit the same thing

The **BOOK COVER** slot can be uploaded from **either** the IMAGES section
**OR** the BOOK pin's drawer. Both edit the same photo. Use whichever's
faster.

### What kinds of images work

- **Formats:** JPG, PNG, WebP, GIF
- **Max file size:** 6 MB (the uploader resizes anything bigger
  automatically, so most phone photos work fine)
- **Best shape:** photos already shaped like the slot — square-ish for
  portraits, 3:4 portrait for book cover, 16:9 wide for replays. If
  the aspect ratio doesn't match, the photo will be cropped to fit.

**TL;DR** — Drag photos onto slots in the IMAGES section. Press SAVE.
The photo replaces the placeholder. Press × remove to put the placeholder
back. The book cover slot can be edited from two places — both edit the
same photo.

---

# PART 9 ◇ SAVE & FIRE — How stuff goes live

Two different paths for two different kinds of changes:

```
                           SAVE              FIRE
                       (everything           (announcements
                        except               only)
                        announcements)

  press button         ⊕ SAVE                ▼ FIRE plunger
  storage              GitHub commit         Vercel Edge Config
  effect               new build deploys     instant write
  visitors see it      ~1 minute later       within 3-5 seconds
  reversible           git rollback          fuse expires, gone
```

### What "saves" can break

Almost nothing. If you typo your bio you can just edit again. The site
goes through a build every save, but builds are fast (~30 seconds) and
fail-loud — if a save somehow breaks, the deploy errors out and the
PREVIOUS version stays live.

### What "fires" can break

Less than nothing. Messages have a fuse — they go away on their own.
Worst case: people see your typo for a minute, then it vanishes.

### Where the data actually lives

```
  THE SITE'S TEXT, IMAGES, SETTINGS
    ↓
  content.json (on GitHub) + images on Vercel Blob (for photos)

  THE MESSAGES (announcements)
    ↓
  Vercel Edge Config (super-fast, doesn't trigger a deploy)
```

You don't need to think about this — but it's useful to know that the
messages are deliberately separate from the rest so you can fire 20 of
them a day without spamming deploys.

**TL;DR** — SAVE is for content (text, images, settings) — takes ~1
minute. FIRE is for messages — takes 3-5 seconds. Both are reversible.

---

# PART 10 ◇ TROUBLESHOOTING

```
  ╔══════════════════════════════════════════════╗
  ║  IF SOMETHING LOOKS WRONG                    ║
  ╚══════════════════════════════════════════════╝
```

### I changed something and the site didn't update

- Did you press **SAVE**? (Not FIRE — that's only for messages.)
- After saving, give it **~1 minute** for the deploy. Refresh the
  homepage hard (Cmd+Shift+R on Mac).
- Still wrong? Open the **Vercel dashboard → Deployments** and check
  for a red "Error" status on the latest one. If it errored, your
  changes are sitting in GitHub but the live site is stuck on the
  previous deploy. Tell whoever's helping you with the site (or me)
  what you changed and they can fix it.

### I fired a message and no one sees it

- Make sure the homepage **isn't muted** (the 🔊 button) — that's a
  per-device setting that won't affect other visitors but might be
  confusing on your end.
- Wait **~5 seconds** — the homepage polls for new messages on a 3s
  loop, so worst case is one full cycle.
- Did you pick **NOW** as the fuse? Other fuses delay things.

### An image upload failed

- Check the **file size** — over 6 MB might choke. Try resizing first.
- Check the **format** — only JPG / PNG / WebP / GIF.
- If you see "Blob storage is not configured" — that's a setup issue,
  not your fault. Talk to whoever set up the site.

### I want to undo a change

- Same as making a change: just edit it back and save. The site doesn't
  have an undo button, but git history does — any past version can be
  restored by someone with repo access.

### Sounds don't play

- Browsers don't let pages play sound until you interact (click /
  scroll / tap). Try clicking somewhere first.
- iOS Safari sometimes needs an extra second to wake up audio — give
  it a moment after you tap.
- Check the **🔊 speaker button** in the bottom-right. If it's a
  slash through it, sound is muted.

### The mode flip glitched mid-transition

- Don't worry, it'll finish. If it really feels stuck, refresh once.

### Everything is broken

- Don't panic. The previous version of the site is always one
  rollback away. Tell whoever helps you with the site. We can
  restore in a couple minutes.

---

```
╔══════════════════════════════════════════════╗
║                                              ║
║  END OF MANUAL · KHALIL.OPS v1.0             ║
║                                              ║
║  Welcome to your own arena.                  ║
║  Hit the goal.                               ║
║                                              ║
║  ▶ ENTER                                     ║
║                                              ║
╚══════════════════════════════════════════════╝
```

_Last updated: when this thing got cool enough to share. Keep this
manual nearby. When you discover something new, tell us and we'll add
it._
