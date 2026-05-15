# Phase 2 ideas (do NOT build now)

Roughly ordered by likely impact. None of these are committed — decide after v1 is in real use.

## /edit v2 — "editor mode" of the actual site
**Idea:** Replace the form-list at `/edit` with an editor-mode version of the live site itself. Khalil's avatar walks between zones (hero → about → book → socials), and entering a zone reveals inline edit fields with cinematic transitions. Could also be a "control-deck" view where the page tilts/flies between sections.

**Why this matters:** A 10-year-old would *love* this. It also makes the editing experience feel like part of the site itself, not a CMS form.

**Reality check:** It's a real build. The current form is functional and clean — don't replace until we know which fields he actually touches most often, and whether the form is the friction point.

**Decide after:** v1 has been in use for at least a few weeks. Watch which fields actually change. If Khalil mostly edits Hero copy, the inline-editor design should optimize for that.

## 3D character: SVG → Spline
Wrap the existing `Character.tsx` shape in a `<CharacterShell>` so swapping the SVG for `@splinetool/react-spline` is a one-file change. Hand-author or commission a Spline scene with:
- Two outfit states (jersey/headset)
- Idle bob + cursor head/eye tracking (already wired in the shell)
- Click reaction triggered via Spline event

## Scroll-driven character choreography
GSAP ScrollTrigger: different character pose per section (chill in hero, looking at book in books, peeking in about). Disable on mobile + reduced motion.

## Toggle sounds
Whistle + crowd cheer on g→f. 8-bit power-up + boot beep on f→g. Off by default, persistent mute toggle near the banner. Load `.mp3` lazily so silent visitors don't pay the kB cost.

## Browse-all-videos page
- Route `/videos` with sort/filter (most viewed, most recent), pagination
- Reuses `getRecentVideos()` but with `maxResults=50` and infinite scroll

## Book preview pages
- One route per book chapter or section
- PDF or image carousel viewer
- Comment box? Probably not — keep privacy posture.

## Analytics
Vercel Web Analytics (free tier) or Plausible self-hosted. Whichever doesn't drop tracking cookies. Anonymous counts only.

## Custom RM crest
Replace the "RM" text-mark in the football outfit with a stylized custom crest (still Madrid-inspired, but original — no trademarks).

## Subtle additions
- Confetti when a viewer hits Subscribe (track outbound click)
- "Last live" or "Next stream" indicator if YouTube API has the data
- Light haptic on toggle click on iOS via the Vibration API (if permitted)
