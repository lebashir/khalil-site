# Khalil the Goat — site

Personal site for Khalil (10yo YouTuber). Built on Next.js 15 / TypeScript strict / Tailwind / Framer Motion. Hosting target: Vercel free tier ($0/month).

## Local dev

```bash
pnpm install
cp .env.example .env.local      # fill in values as needed (see below)
pnpm dev                         # http://localhost:3000
```

Other scripts:

```bash
pnpm build       # production build (run before deploy as a sanity check)
pnpm typecheck   # strict TypeScript check
pnpm start       # serve the production build
```

## Environment variables

All optional locally — the site will render with placeholder data if anything's missing. All required in production.

| Name | Used for | Required for |
|------|----------|--------------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 | Videos section |
| `YOUTUBE_CHANNEL_ID` | Skips the channel-handle lookup (optional, recommended once you know it) | Faster cold starts |
| `EDIT_PASSWORD` | Password for `/edit` | The CMS |
| `EDIT_SESSION_SECRET` | HMAC secret for the edit session cookie | The CMS |
| `GITHUB_TOKEN` | Fine-grained PAT, scoped to this repo, with `Contents: read+write` | Saving from `/edit` |
| `GITHUB_REPO_OWNER` | GitHub username/org that owns this repo | Saving from `/edit` |
| `GITHUB_REPO_NAME` | Repo name | Saving from `/edit` |
| `GITHUB_BRANCH` | Branch to commit to (default: `main`) | — |

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import in Vercel → keep the defaults (Next.js auto-detected).
3. Add all production env vars above in Vercel project settings.
4. Deploy. After a couple of minutes you have a `…vercel.app` URL.

`/edit` workflow: Khalil signs in with the password, saves changes, and Vercel auto-rebuilds when the commit lands on `main`. New copy is live in ~60 seconds.

## Editing the site

Two paths:

1. **`/edit` (Khalil's path).** Password-gated. Plain textareas for every editable field. Live preview. Save commits `content.json` to GitHub, which triggers a Vercel rebuild.
2. **Editing `content.json` directly** in the repo. Same effect.

What's editable:

- Hero tagline + bio, **per mode** (gaming and football have their own copies)
- About paragraphs 1 and 2 (supports `*bold*` shorthand)
- Book title, description, status pill, show/hide
- TikTok URL, Instagram URL
- Which mode shows on first visit

What's intentionally NOT editable (locked to prevent breakage):

- The "Khalil the Goat" display name
- Toggle labels (GAMING / FOOTBALL)
- CTA button text (Subscribe / Watch latest)
- Footer credit
- Video card copy (pulled live from YouTube)

## Project layout

```
app/
  layout.tsx                root layout, mode provider, inline pre-paint script
  page.tsx                  home page
  globals.css               Tailwind + design tokens (CSS vars per mode)
  api/
    videos/route.ts         YouTube Data API v3 endpoint
    edit/login/route.ts     password → signed cookie
    edit/logout/route.ts    clears cookie
    edit/save/route.ts      validates + commits content.json to GitHub
  edit/page.tsx             editor (login / form + preview)
components/
  ModeProvider.tsx          gaming/football context + persistence
  ModeToggleBanner/         the centerpiece (panes + asymmetric transitions)
    index.tsx
    GamingToFootball.tsx
    FootballToGaming.tsx
    ParticleBurst.tsx       canvas-based confetti/shards helper
    usePrefersReducedMotion.ts
    useIsNarrow.ts
  Hero.tsx                  hero section, mode-aware copy
  Character.tsx             SVG character + cursor tracking + click reaction
  BgShapes.tsx              ambient floating shapes + cursor parallax
  Videos.tsx                YouTube section (server component)
  About.tsx
  Books.tsx
  Footer.tsx
  edit/
    LoginForm.tsx
    EditForm.tsx            the editor with grouped sections + live preview
    PreviewPane.tsx         sticky right-side mini-site preview
lib/
  content.ts                SiteContent types, FIELD_LIMITS, validateContent()
  youtube.ts                YouTube fetcher (10-min revalidate)
  github.ts                 commit content.json via GitHub Contents API
  edit-session.ts           HMAC-signed session cookie
  bold.tsx                  *bold* → <strong>
content.json                editable site content (committed by /edit)
```

## Modes

The site has two modes — gaming (default) and football — toggled via the banner at the top. The chosen mode is persisted in `localStorage` (`khalil-mode`). On first visit, the value of `defaultMode` in `content.json` is used.

CSS variables drive all mode-dependent colors / fonts / glow. The mode class is applied to `<html>` by an inline pre-paint script in the root layout, so there's no first-paint flash even when the user's saved preference differs from the server-rendered default.

## A11y / motion / mobile

- `prefers-reduced-motion: reduce` is respected throughout (toggle transitions degrade to a quick cross-fade; ambient float/spin loops are gated by `motion-safe:`).
- Narrow viewports (`<880px`) skip the heavy particle overlays on the toggle but keep the width animation, so the toggle is still responsive on mobile.
- Cursor parallax + character cursor tracking are gated by `(hover: hover) and (pointer: fine)` so they don't run on touch.
- Toggle buttons are real `<button>` elements with `aria-pressed`; Tab + Enter / Space activate.
- Focus rings: 3px accent ring on `:focus-visible`.

## Costs

Designed to stay at $0/month:

- Vercel Hobby (free) is enough — no cron, no edge functions, no Image Optimization for thumbnails (we set `unoptimized` on YouTube thumbnails to avoid the optimized-image quota).
- YouTube Data API v3 free tier is 10K units/day; one home-page render is ~2 units; with a 10-minute cache we're well under.
- GitHub Contents API for `/edit` saves: free.

## See also

- `TODO_V2.md` — phase-2 ideas (Spline, sound, /edit redesign).
- `content.json` — the actual editable content.
