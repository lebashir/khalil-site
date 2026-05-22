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

yo khalil. this is the manual for your own site. read it once, then keep
it around for when you forget what a button does. every part ends with a
**tl;dr** so you can skim if you're in a hurry.

---

## table of contents

```
PART 1  ◇  THE SITE              ← four pages visitors can see
PART 2  ◇  THE TWO MODES         ← gaming vs football
PART 3  ◇  THE TUNNEL            ← the walk-in intro
PART 4  ◇  THE ARENA             ← your homepage
PART 5  ◇  SECRET DOOR (/edit)   ← where you change stuff
PART 6  ◇  MISSION CONTROL       ← broadcast deck · fire messages
PART 7  ◇  ON-SITE EDITOR        ← edit the site's content + identity
PART 8  ◇  IMAGE UPLOADS         ← drop your own photos
PART 9  ◇  SAVE & FIRE           ← how stuff goes live
PART 10 ◇  TROUBLESHOOTING       ← when something looks wrong

(the same manual also lives at /manual on the site, with the working
plunger demo and the live mode toggle.)
```

---

# PART 1 ◇ THE SITE

your site lives at **khalil2020.vercel.app**.

anyone in the world can visit. they'll see four pages:

```
  /            ← the arena (your real homepage)
  /intro       ← the tunnel walk (first-time visitors)
  /edit        ← YOUR SECRET DOOR (locked unless you have the password)
  /manual      ← this manual (you're reading it right now)
```

first-timers land in the **tunnel** at `/intro`. when they hit the
**▶ ENTER THE ARENA** button at the end, their browser remembers them.
next time, they go straight to `/`.

**tl;dr** — first-timers walk the tunnel. everyone else jumps straight
to the arena. you can visit `/intro` any time you want to see the walk
again.

---

# PART 2 ◇ THE TWO MODES

your site has **two personalities** that swap with one tap:

```
  ┌──────────────────────────────────────────────┐
  │  🎮  GAMING                ⚽  FOOTBALL       │
  │  ── neon, purple, glitch    ── grass, gold,   │
  │                                stadium-vibe   │
  └──────────────────────────────────────────────┘
```

### how to flip modes

| device  | how                                            |
|---------|------------------------------------------------|
| desktop | click the smaller half of the top bar          |
| desktop | OR press ← / → arrow keys                       |
| mobile  | swipe sideways anywhere on the page            |
| mobile  | OR tap the smaller half of the top bar         |

### mode-peek (desktop only)

if you just **hover** the smaller half without clicking, the page gets a
soft glow in the other mode's color. like a sneak peek. move your mouse
away and it disappears. it's a hint, not a flip.

### what changes when you flip

- the **whole color palette** (neon pink/purple vs stadium green/gold)
- the **hero title** look (same words, different vibe)
- your **stats grid** — gaming shows things like K/D · WINS · STREAK · HRS,
  football shows things like GOALS · CAPS · TROPHIES · ROBONA
- your **NOW block** — gaming = equipped loadout. football = starting XI.
- the **video tags** on each replay tile (GAMING vs FOOTBALL)
- the **background art** (gaming grid vs stadium grass)
- a **stadium crowd hum** in football mode (keep your volume up if you
  want the vibe)

### what does NOT change between modes

- your subscriber count
- the book section
- the video list itself
- your mood / status LED
- socials links

### gaming themes (extra colors)

gaming mode has **9 different themes** — different color palettes you can
swap into without leaving gaming mode. you pick them in `/edit` →
THEME · GAMING. there are dark themes (neon, lava, crt, etc.) and light
themes (paper, ice, storm) that flip the whole canvas bright.

three ways to set it:

- **FIXED** — pick one theme. everyone sees that one theme.
- **RANDOM** — fresh pick from your pool on every page refresh.
  even the same person reloading the page keeps getting surprised.
- **SHUFFLE** — each visitor gets their own random pick from your pool,
  but it stays the same for them every time they come back. variety
  across visitors, calm for any one viewer.

**the pool** is the set of themes you tap on in `/edit`. you control
which themes are in the pool — could be 2, could be all 9.
RANDOM and SHUFFLE both draw from the SAME pool you picked. they only
differ in WHEN they pick:

```
  ┌─────────────────────────────────────────────────────────┐
  │  YOU CURATE THE POOL   →   2-9 THEMES YOU LIKE          │
  │                                                         │
  │  RANDOM  → re-rolls from pool on every page load        │
  │  SHUFFLE → rolls once per visitor, then sticks          │
  └─────────────────────────────────────────────────────────┘
```

football mode stays a single Real Madrid palette — that's on purpose.

**tl;dr** — one toggle swaps the entire color world. some stuff is
per-mode (hero copy, stats, now block). some stuff is shared (subs,
book, videos, socials, mood).

---

# PART 3 ◇ THE TUNNEL

the tunnel is your **walk-in intro**. five scenes. scroll forward =
walk forward.

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

while walking:
- a **low rumble** starts on the first scroll (the engine hum)
- each scene **thunks** when you reach it
- the last scene gets a **bell chord chime**

the first time someone lands, a "**· STAND BY · SCROLL TO WALK ·**"
card pops up so they know what to do.

**tl;dr** — scrolling the tunnel = walking forward. sound is part of
it. the ENTER button at the bottom takes them into the arena and
remembers them.

---

# PART 4 ◇ THE ARENA

the arena is your real homepage. top to bottom:

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

### things that move on the homepage

- the **polaroid stack** breathes (gentle up/down bob). it tilts when
  you hover and **fans out** when you hover (desktop) or tap (mobile).
  tap any card → it pops forward for a second.
- the **subscribe button** + **watch button** lift a bit when you
  hover and ripple from where you click. stat tiles jiggle when tapped.
- video tiles have a **shiny rainbow sheen**. the gold/orange ones
  (LEGENDARY) get an extra bright sweep on loop. the others stay calm.
- the **mood LED** next to your handle blinks softly based on your
  mood (online / on-fire / streaming / in-school / sleeping).

### sounds on the homepage

- football mode plays a **stadium crowd hum** in the background.
  always on while football is the active mode.
- gaming mode is quiet (no constant sound).
- flipping modes plays a **whoosh** (gaming) or a **crowd cheer + horn**
  (football).
- a **plunger ka-CHUNK** + your chosen payload sound when an
  announcement fires from `/edit`.

the **🔊 speaker button** in the bottom-right corner mutes everything.
your choice is remembered for next visit.

**tl;dr** — the arena is your homepage. most things on it are
interactive — try hovering, tapping, scrolling. sound is a big part of
the vibe. the speaker button mutes everything if you need quiet.

---

# PART 5 ◇ SECRET DOOR (/edit)

go to **khalil2020.vercel.app/edit** and type your password.

```
  ┌──────────────────────────────────────────────┐
  │  EDIT ACCESS                                 │
  │  ┌──────────────────────────────────────┐   │
  │  │  password: ●●●●●●●●●●                │   │
  │  └──────────────────────────────────────┘   │
  │  [ AUTHENTICATE → ]                          │
  └──────────────────────────────────────────────┘
```

once you're in, the top bar swaps to:

```
  ┌──────────────────────────────────────────────────┐
  │ KHALIL.OPS  [MISSION CONTROL][ON-SITE EDITOR]    │
  │             ⊕ SAVE  × EXIT                       │
  └──────────────────────────────────────────────────┘
```

two tabs. they edit **different parts** of the same site. each thing
you can change lives in **exactly one** tab so you never have to
remember "where did I edit that?":

- **MISSION CONTROL** ← the broadcast deck. the big plunger + the
  live-state modules. use it for stuff that changes **session to
  session** — what you're playing right now, your mood, your sub
  count, which video is pinned, which color theme is on, and any
  message you want to fire.
- **ON-SITE EDITOR** ← mini-mockups of the homepage with pins on
  every editable field. use it for stuff that defines **what the site
  IS** — your handle, hero copy, stats, the about paragraphs, the
  book, your social links, your replay style.

both tabs share the same memory, so unsaved edits in one tab are
still there when you flip to the other.

### the two action buttons

| button       | does                                                         |
|--------------|--------------------------------------------------------------|
| ⊕ **SAVE**   | pushes everything you changed (except messages) to the live site. takes about a minute. |
| × **EXIT**   | logs you out. the site stays exactly as it was last saved.   |

press SAVE when you finish a batch of changes. **you can change a LOT
before saving** — it's one save for everything.

### where to find this manual

inside `/edit`, in the top-right corner of the top bar, there's a
**📖 MANUAL** button. tap it and the manual opens in a new tab so you
don't lose your edit session. you can also just go to
khalil2020.vercel.app/manual any time.

**tl;dr** — `/edit` is the only locked page. two tabs: **MISSION
CONTROL** handles live stuff (mood, now, theme, messages), **ON-SITE
EDITOR** handles the site's permanent content (handle, hero, about,
book, socials). SAVE pushes everything live (except messages). EXIT
logs out. the 📖 MANUAL link in the top-right opens this manual in a
new tab.

---

# PART 6 ◇ MISSION CONTROL

this tab is your **broadcast deck**. the headline feature: a big red
plunger that fires a real-time message to anyone who's on the site
right now. around it sit the live-state modules — the things about
you that change session to session.

```
  ┌──────────────────────────────────────────────┐
  │  ┌────────────────────┐                      │
  │  │ LAUNCH WINDOW      │  ← live preview      │
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

### step-by-step: firing a message

1. **type the message** — what you want everyone to see (up to 120 letters).
2. **pick a payload** — what kind of celebration:
   - 🎉 **CONFETTI** — paper pop + sparkly chirps
   - 💰 **GOLD** — Mario-coin shower (14 pings)
   - ⚡ **NEON** — bass drop + rave zap
   - 🔥 **FIRE** — boom + breathing flame + crackles
   - ⚽ **GOAL** — referee whistle + horn + crowd roar
   - 🍰 **CAKE** — party horn + bell triad
3. **pick a fuse** — when it should go off:
   - **NOW** — fires the instant you press FIRE (lasts 5 minutes)
   - **1H** — fires one hour from now (lasts 5 minutes)
   - **VISIT** — fires the next time a new visitor lands (lasts 24 hours)
   - **REFRESH** — fires every time the page is refreshed for the next
     hour
4. **hit the FIRE plunger** — big red button at the bottom.

the preview at the top shows you exactly what visitors will see. the
plunger goes **ka-CHUNK** and the payload sound plays as it lands.

### the side modules (always visible)

everything here is **live-state** — the stuff that changes from one
session to the next:

| module           | edits                                              |
|------------------|----------------------------------------------------|
| **LIVE STATUS**  | mood LED + sub count (current + goal)              |
| **NOW · EQUIPPED / STARTING XI** | what you're playing/watching/reading/listening (per mode) |
| **PINNED REPLAY** | which video shows up first in the REPLAYS section |
| **THEME · GAMING** | which color palette gaming mode uses (9 to pick from). FIXED = one for everyone. RANDOM = new pick every refresh. SHUFFLE = each visitor keeps their own random pick. |

things like your handle, hero copy, about paragraphs, book, socials,
replay style and boot mode are the **permanent identity** of the site
— those live in the **ON-SITE EDITOR** tab.

### messages vs everything else

```
  MESSAGES (the plunger)        EVERYTHING ELSE
  ─────────────────────         ───────────────────
  ▼ FIRE button                 ⊕ SAVE button
  goes out instantly            takes about a minute
  shows up in ~3 seconds        shows up after the rebuild
```

**why?** messages are quick — they live in a fast box and disappear when
their fuse runs out. everything else (your handle, stats, videos, book)
is part of the actual site. saving makes the site rebuild itself with
the new stuff.

**tl;dr** — the plunger sends a message that pops on the homepage
within seconds. the SAVE button updates the actual site (slower but it
stays). both live in MISSION CONTROL — different buttons.

---

# PART 7 ◇ ON-SITE EDITOR

this tab shows **mini-mockups** of every part of the homepage. each
section has small **EDIT pins** floating on it — tap a pin to slide a
**drawer** in with a form for that exact field. everything here is the
**permanent identity** of the site (the stuff that's the same every
time you visit).

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
  │ │ REPLAYS PREVIEW                      │   │ │
  │ │   thumbnails + STYLE pin             │   │ │
  │ └──────────────────────────────────────┘   │ │
  │ ┌──────────────────────────────────────┐   │ │
  │ │ ABOUT / BOOK / FOOTER / IMAGES       │   │ │
  │ └──────────────────────────────────────┘ ──┘ │
  │ [BOOT MODE: GAMING] [SOCIALS: 0/2]           │
  └──────────────────────────────────────────────┘
```

### every pin and what it edits

| pin            | opens an editor for                                   |
|----------------|-------------------------------------------------------|
| **HANDLE**     | your @ username (max 40 letters)                      |
| **HERO**       | tagline + bio + button text + vibe (per mode)         |
| **STATS**      | the 4 stat cells (label + value, per mode)            |
| **STYLE**      | youtube vs designed thumbnails + tier rarities + palette |
| **ABOUT**      | the paragraphs at the bottom                          |
| **BOOK**       | title + subtitle + description + status + **cover photo** |
| **SOCIALS**    | tiktok + instagram links                              |
| **BOOT MODE**  | default mode for new visitors                         |

looking for **MOOD · SUBS · NOW · PINNED · THEME**? those are all
session-level controls — flip over to **MISSION CONTROL**.

### per-mode editing

HERO and STATS are **different in gaming vs football**. the mode
toggle at the top of the editor tab tells the preview which one
you're looking at. flip it before editing those fields.

### the drawer

tap a pin → a drawer slides in from the right with the form. make your
changes → the preview updates live → close the drawer → press SAVE at
the top to push everything live.

**tl;dr** — ON-SITE EDITOR is the precision tab for the site's
identity. see the site in miniature, tap an EDIT pin to open the
field, type, close, save.

---

# PART 8 ◇ IMAGE UPLOADS

scroll to the bottom of the **ON-SITE EDITOR** tab. you'll see the
**◇ IMAGES** section. this is where you replace placeholder art with
your own photos.

### the 8 slots

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

### how to upload

1. **click** a slot OR **drag-and-drop** an image onto it.
2. the image gets shrunk to fit (about 1024px on the long edge) and
   uploaded.
3. the thumbnail appears with a **✓ LIVE ON SITE** badge.
4. press **SAVE** at the top.

### to replace or remove

- **replace:** click the slot again → pick a new photo. the old one
  gets swapped out (no one sees the old one once you save).
- **remove:** press the **× remove** button below the thumbnail. press
  SAVE — the slot goes back to its default (emoji / gradient).

### where each slot shows up on the site

| slot                | where it lands on the homepage                          |
|---------------------|---------------------------------------------------------|
| `portrait-gaming`   | the middle polaroid card (when gaming is active)        |
| `portrait-football` | the middle polaroid card (when football is active)     |
| `book-cover`        | the book cover (replaces the gradient)                  |
| `replay-{video-id}` | that specific video's thumbnail (replaces youtube's)    |

### two places to edit the same thing

the **book cover** slot can be uploaded from **either** the IMAGES
section OR the BOOK pin's drawer. both change the same photo. use
whichever's faster.

### what kinds of images work

- **formats:** JPG, PNG, WebP, GIF
- **max file size:** 6 MB. the uploader shrinks anything bigger
  automatically, so most phone photos work fine.
- **best shape:** square-ish for portraits, tall (3:4) for the book
  cover, wide (16:9) for replays. if the shape doesn't match, the
  photo will be cropped to fit.

**tl;dr** — drag photos onto slots in the IMAGES section. press SAVE.
the photo replaces the placeholder. press × remove to put the
placeholder back. the book cover slot can be edited from two places —
both change the same photo.

---

# PART 9 ◇ SAVE & FIRE — how stuff goes live

two paths. two kinds of changes.

```
                           SAVE              FIRE
                       (everything           (announcements
                        except               only)
                        announcements)

  press button         ⊕ SAVE                ▼ FIRE plunger
  takes               ~1 minute              3–5 seconds
  stays               permanent              until the fuse runs out
  can undo?           yes (rollback)         no need — it expires
```

### what "saves" can break

almost nothing. if you typo your bio you can just edit again. the site
does a rebuild on every save, but rebuilds are fast (around 30
seconds). if a save somehow breaks the rebuild, the new version
doesn't go live and the old version stays up. the site never goes
blank on you.

### what "fires" can break

less than nothing. messages have a fuse — they go away on their own.
worst case: people see your typo for a minute, then it vanishes.

### where the data lives

the text and images for your site are saved on github (a safe place
that keeps every old version). the messages live in a separate fast
box that doesn't trigger a rebuild — that's why they show up in 3
seconds instead of 1 minute.

you don't have to think about any of this. but it's useful to know
that messages are deliberately separate, so you can fire 20 of them a
day without slowing anything down.

**tl;dr** — SAVE is for content (text, images, settings) — takes about
a minute. FIRE is for messages — takes 3–5 seconds. both are
reversible.

---

# PART 10 ◇ TROUBLESHOOTING

```
  ╔══════════════════════════════════════════════╗
  ║  IF SOMETHING LOOKS WRONG                    ║
  ╚══════════════════════════════════════════════╝
```

### "i changed something and the site didn't update"

- did you press **SAVE**? (not FIRE — that's only for messages.)
- after saving, give it about a minute.
- still wrong? do a **hard refresh**:
  - **mac:** Cmd + Shift + R
  - **windows:** Ctrl + Shift + R
- still nothing? tell whoever helps you with the site. they can check
  if the save got stuck.

### "i fired a message and no one sees it"

- check the speaker button — make sure your homepage isn't muted.
- wait about 5 seconds. the homepage checks for new messages every
  few seconds.
- did you pick **NOW** as the fuse? the other fuses delay things.

### "an image upload failed"

- check the file size. over 6 MB might choke. try a smaller photo
  first.
- check the format. only JPG / PNG / WebP / GIF work.
- if you see "blob storage is not configured" — that's a setup
  problem, not your fault. tell whoever set up the site.

### "i want to undo a change"

- easiest way: edit it back and save again.
- old versions of the site are saved on github. someone with repo
  access can put back any past version in a couple of minutes.

### "sounds don't play"

- browsers don't let pages play sound until you click or tap
  something. try clicking somewhere first.
- iphone safari sometimes needs a second to wake up audio. wait a
  tick after you tap.
- check the **🔊 speaker button** in the bottom-right. if it has a
  slash through it, sound is muted.

### "the mode flip glitched mid-transition"

- don't worry, it'll finish. if it really feels stuck, refresh the
  page once.

### "everything is broken"

- don't panic. the old version is always one rollback away. tell
  whoever helps you with the site — we can put it back in a couple
  minutes.

---

```
╔══════════════════════════════════════════════╗
║                                              ║
║  END OF MANUAL · KHALIL.OPS v1.0             ║
║                                              ║
║  welcome to your own arena.                  ║
║  hit the goal.                               ║
║                                              ║
║  ▶ ENTER                                     ║
║                                              ║
╚══════════════════════════════════════════════╝
```

_last updated: when this thing got cool enough to share. keep this
manual nearby. when you discover something new, tell us and we'll add
it._
