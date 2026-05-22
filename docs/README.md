# khalil.gg · docs

Project documentation. Reference material, handoffs, and content that may become production pages.

## What's here

| File              | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| `manual.html`     | Operator manual for Khalil — explains the site, the modes, and `/edit`. Intended to become a real page on the site (see below). |

---

## `manual.html` — turning it into a site page

`manual.html` is a self-contained reference document with the full operator manual content, styled in the site's design language (mode palette, polaroid stack, trading-card tiles, plunger module, marker/Caveat fonts, mode flip).

It is **not** wired into the Next.js app yet. To make it accessible from the live site, ask Claude Code to:

1. **Add a route** at `app/manual/page.tsx` rendering the manual content
2. **Reuse the site's existing primitives** instead of inlining the styles in `manual.html`:
   - `useModeFlip` / `TopBarMode` from `components/topbar/` for the live mode toggle (already in the site — don't reinvent)
   - Existing `Polaroid` / `PolaroidStack` from `components/arena/` for the cover
   - The site's actual `THEMES` / palette tokens from `components/arena/theme.ts` and `components/topbar/palette.ts`
   - Fonts: already loaded site-wide via `app/layout.tsx`
3. **Link from the nav** — add a `MANUAL` entry to the nav strip in `components/arena/Nav.tsx` (or wherever the nav lives in production)
4. **Gate or expose?** — decide whether the manual is public (anyone can read it — useful as a "what is this site" explainer) or only shown when authenticated as Khalil. Probably public; it's all about Khalil's own site so visitors will find it interesting too.
5. **Keep the interactive bits** — the plunger demo + confetti, the live mode flip, polaroid hover. These translate directly to React state + the existing animation classes in `lib.jsx`.

Use `manual.html` as the **design reference** — copy structure, copy copy, copy the styling intent. Port to React components rather than dumping the HTML into a `dangerouslySetInnerHTML`.

### Suggested route

```
/manual    →  app/manual/page.tsx
```

Linkable from nav as **MANUAL** or **HOW IT WORKS**.

### Voice rules

Keep Khalil's voice (lowercase, "i" not "I", deadpan, short sentences). All the copy in `manual.html` already follows this — don't drift when porting.
