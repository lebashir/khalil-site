'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { Mode, SiteContent } from '@/lib/content';
import type { ArenaTheme } from '@/components/arena/theme';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import { themedBackdrop, themedFg } from '@/lib/gaming-themes';
import {
  PartMarker,
  PartTitle,
  Tldr,
  Panel,
  Terminal,
  TermLine,
  Prose,
  KsRows,
  Notebook
} from './primitives';
import { PlungerDemo } from './PlungerDemo';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  content: SiteContent;
}

const FONT_DISPLAY = "'Anton', sans-serif";
const FONT_MONO = "'DM Mono', ui-monospace, monospace";

// ── Generic part wrapper ─────────────────────────────────────────────

interface PartProps {
  n: number;
  tag: string;
  title: string;
  theme: ArenaTheme;
  size: ArenaSize;
  children: ReactNode;
}

const Part = ({ n, tag, title, theme, size, children }: PartProps) => (
  <section
    id={`part-${n}`}
    style={{
      margin: size === 'phone' ? '60px 0' : '80px 0',
      animation: 'k-stamp-in .6s cubic-bezier(.2,1.2,.4,1) both',
      scrollMarginTop: 100
    }}
  >
    <PartMarker num={n} tag={tag} theme={theme} size={size} />
    <PartTitle theme={theme} size={size}>{title}</PartTitle>
    {children}
  </section>
);

// ── Single body component renders all 10 parts ─────────────────────

export const ManualBody = ({ mode, theme, size, content }: Props) => {
  const subsCurrent = content.subs.current.toLocaleString();
  const subsGoal = content.subs.goal.toLocaleString();
  const handle = content.handle;

  return (
    <>
      {/* ─── PART 1 ────────────────────────────────────────────── */}
      <Part n={1} tag="◇ PART ONE" title="THE SITE" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            your site lives at <strong>khalil2020.vercel.app</strong>. anyone in
            the world can visit. they'll see three pages:
          </p>
        </Prose>
        <Terminal style={{ marginTop: 16 }}>
          <TermLine prompt="/" promptColor={theme.accent} inkColor={theme.fg}>
            → the arena (your real homepage)
          </TermLine>
          <TermLine prompt="/intro" promptColor={theme.accent} inkColor={theme.fg}>
            → the tunnel walk (first-time visitors)
          </TermLine>
          <TermLine prompt="/edit" promptColor="#ff3a3a" inkColor={theme.fg}>
            → YOUR SECRET DOOR · locked unless you have the password
          </TermLine>
          <TermLine prompt="/manual" promptColor={theme.accent2} inkColor={theme.fg}>
            → this page · the operator manual
          </TermLine>
        </Terminal>
        <Prose style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}>
            first-timers land in the <strong>tunnel</strong> at{' '}
            <Code theme={theme}>/intro</Code>. when they hit the{' '}
            <strong>▶ ENTER THE ARENA</strong> button at the end, their browser
            remembers them. next time, they go straight to{' '}
            <Code theme={theme}>/</Code>.
          </p>
        </Prose>
        <Tldr>
          first-timers walk the tunnel. everyone else jumps straight to the
          arena. you can visit /intro any time you want to see the walk again.
        </Tldr>
      </Part>

      {/* ─── PART 2 ────────────────────────────────────────────── */}
      <Part n={2} tag="◇ PART TWO" title="THE TWO MODES" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            your site has <strong>two personalities</strong> that swap with
            one tap. try clicking the toggle at the top of this page — the
            whole manual flips colors with you. that's the same flip your
            site does.
          </p>
        </Prose>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: size === 'phone' ? '1fr' : '1fr 1fr',
            gap: 16,
            margin: '22px 0'
          }}
        >
          <CompareCol active={mode === 'gaming'} theme={theme} title="🎮 GAMING">
            <li>neon purple + cyan + magenta</li>
            <li>roles: streamer · gamer · goat</li>
            <li>stats like K/D · WINS · STREAK · HRS</li>
            <li>now: equipped loadout</li>
            <li>vibe: glitchy, late-night, on-fire</li>
          </CompareCol>
          <CompareCol active={mode === 'football'} theme={theme} title="⚽ FOOTBALL">
            <li>gold + white + stadium navy</li>
            <li>roles: striker · madridista · forever 7</li>
            <li>stats like GOALS · CAPS · TROPHIES · ROBONA</li>
            <li>now: starting XI</li>
            <li>vibe: pitch lights, crowd hum, gold trophy</li>
          </CompareCol>
        </div>

        <Panel label="◇ HOW TO FLIP MODES" theme={theme}>
          <KsRows
            rows={[
              ['DESKTOP', 'click the smaller half of the top bar — OR press ← / → arrow keys'],
              ['MOBILE', 'swipe sideways anywhere on the page — OR tap the smaller half']
            ]}
            theme={theme}
          />
        </Panel>

        <Notebook>
          <strong>mode-peek (desktop only):</strong> if you just <em>hover</em>{' '}
          the smaller half without clicking, the page gets a soft glow in the
          other mode's color. it's a sneak peek, not a flip.
        </Notebook>

        <Panel label="◇ WHAT CHANGES WHEN YOU FLIP" theme={theme}>
          <KsRows
            rows={[
              ['PALETTE', 'the whole color world (neon vs stadium)'],
              ['HERO', 'tagline, bio, CTA button text, vibe line'],
              ['STATS', 'all 4 stat cells (labels + values)'],
              ['NOW', 'gaming = equipped loadout. football = starting XI.'],
              ['VIDEO TAGS', 'GAMING vs FOOTBALL on each replay'],
              ['BACKGROUND', 'gaming grid vs stadium grass'],
              ['SOUND', 'football mode plays a quiet stadium crowd hum']
            ]}
            theme={theme}
          />
        </Panel>

        <Panel label="◇ WHAT STAYS THE SAME" theme={theme}>
          <KsRows
            rows={[
              ['SUBS', 'subscriber count — same number in both modes'],
              ['BOOK', 'the book section'],
              ['VIDEOS', 'the actual list of videos'],
              ['MOOD', 'your status LED'],
              ['SOCIALS', 'tiktok + instagram links']
            ]}
            theme={theme}
          />
        </Panel>

        <Panel label="◇ GAMING THEMES (extra colors)" theme={theme}>
          <Prose>
            <p style={{ margin: 0 }}>
              gaming mode has <strong>9 different themes</strong> — color
              palettes you can swap into without leaving gaming. you pick
              them in <Code theme={theme}>/edit</Code> → THEME · GAMING.
              there are dark themes (neon, lava, crt, etc.) and light
              themes (paper, ice, storm) that flip the whole canvas bright.
            </p>
            <p style={{ margin: '10px 0 0' }}>three ways to set it:</p>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li><strong>FIXED</strong> — everyone sees the one theme you pick.</li>
              <li><strong>RANDOM</strong> — every page refresh rolls a new color from your pool. even reloading keeps surprising you.</li>
              <li><strong>SHUFFLE</strong> — each visitor gets their own random pick, but it stays the same for them every time they come back.</li>
            </ul>
            <p style={{ margin: '10px 0 0' }}>
              football mode stays a single Real Madrid palette — that's
              on purpose.
            </p>
          </Prose>
        </Panel>

        <Tldr>
          one toggle swaps the entire color world. some stuff is per-mode
          (hero copy, stats, now block). some stuff is shared (subs, book,
          videos, socials, mood).
        </Tldr>
      </Part>

      {/* ─── PART 3 ────────────────────────────────────────────── */}
      <Part n={3} tag="◇ PART THREE" title="THE TUNNEL" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            the tunnel is your <strong>walk-in intro</strong>. five scenes.
            scroll forward = walk forward.
          </p>
        </Prose>

        <Panel label="◇ THE 5 SCENES (in order)" theme={theme}>
          <KsRows
            rows={[
              ['01 · HERO', `"I AM KHALIL" — your handle + subs`],
              ['02 · REPLAYS', 'a few floating video previews'],
              ['03 · ABOUT', 'who you are, in your words'],
              ['04 · BOOK', "the book you're writing"],
              ['05 · DESTINATION', 'the ▶ ENTER button + "in / outside the arena"']
            ]}
            theme={theme}
          />
        </Panel>

        <Panel label="◇ SOUNDS WHILE WALKING" theme={theme}>
          <Prose>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>a <strong>low rumble</strong> starts on the first scroll (the engine hum)</li>
              <li>each scene <strong>thunks</strong> when you reach it</li>
              <li>the last scene gets a <strong>bell chord chime</strong></li>
            </ul>
          </Prose>
        </Panel>

        <Notebook>
          the first time someone lands, a "<strong>· STAND BY · SCROLL TO WALK ·</strong>"
          card pops up so they know what to do.
        </Notebook>

        <Tldr>
          scrolling the tunnel = walking forward. sound is part of it. the
          ENTER button at the bottom takes them into the arena and remembers
          them.
        </Tldr>
      </Part>

      {/* ─── PART 4 ────────────────────────────────────────────── */}
      <Part n={4} tag="◇ PART FOUR" title="THE ARENA" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            the arena is your real homepage. <strong>{handle}</strong> ·{' '}
            {subsCurrent} subscribers, goal {subsGoal}. top to bottom:
          </p>
        </Prose>

        <Panel label="◇ LAYOUT" theme={theme}>
          <KsRows
            rows={[
              ['TOP BAR', 'gaming / football toggle'],
              ['NAV', 'your handle + mood LED'],
              ['HERO', 'big title + polaroid stack + subscribe + stats'],
              ['SUBS HUD', 'subscriber bar + goal'],
              ['NOW', 'playing / watching / reading / listening'],
              ['REPLAYS', 'video trading cards (LEGENDARY → COMMON)'],
              ['ABOUT', 'your paragraphs'],
              ['BOOK', "the book you're writing"],
              ['FOOT', 'youtube · tiktok · instagram']
            ]}
            theme={theme}
          />
        </Panel>

        <Panel label="◇ THINGS THAT MOVE" theme={theme}>
          <Prose>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>the <strong>polaroid stack</strong> breathes (gentle up/down bob). it tilts when you hover and <strong>fans out</strong> when you hover (desktop) or tap (mobile). tap any card → it pops forward for a second.</li>
              <li>the <strong>subscribe button</strong> and <strong>watch button</strong> lift a bit when you hover and ripple from where you click. stat tiles jiggle when tapped.</li>
              <li>video tiles have a <strong>shiny rainbow sheen</strong>. the gold/orange ones (LEGENDARY) get an extra bright sweep on loop. the others stay calm.</li>
              <li>the <strong>mood LED</strong> next to your handle blinks softly based on your mood (online / on-fire / streaming / in-school / sleeping).</li>
            </ul>
          </Prose>
        </Panel>

        <Panel label="◇ SOUNDS ON THE HOMEPAGE" theme={theme}>
          <Prose>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>football mode plays a <strong>stadium crowd hum</strong>. always on while football is the active mode.</li>
              <li>gaming mode is quiet (no constant sound).</li>
              <li>flipping modes plays a <strong>whoosh</strong> (gaming) or <strong>crowd cheer + horn</strong> (football).</li>
              <li>a <strong>plunger ka-CHUNK</strong> + your chosen payload sound when an announcement fires from /edit.</li>
            </ul>
          </Prose>
        </Panel>

        <Notebook>
          the <strong>🔊 speaker button</strong> in the bottom-right mutes
          everything. your choice is remembered for next visit.
        </Notebook>

        <Tldr>
          the arena is your homepage. most things on it are interactive — try
          hovering, tapping, scrolling. sound is a big part of the vibe. the
          speaker button mutes everything if you need quiet.
        </Tldr>
      </Part>

      {/* ─── PART 5 ────────────────────────────────────────────── */}
      <Part n={5} tag="◇ PART FIVE" title="SECRET DOOR · /edit" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            go to <strong>khalil2020.vercel.app/edit</strong> and type your
            password.
          </p>
        </Prose>

        <Terminal style={{ marginTop: 16 }}>
          <div style={{ color: theme.accent }}>EDIT ACCESS</div>
          <div style={{ color: '#92a4ae', margin: '6px 0' }}>
            password: <span style={{ color: theme.fg }}>●●●●●●●●●●</span>
          </div>
          <div style={{ color: theme.accent }}>[ AUTHENTICATE → ]</div>
        </Terminal>

        <Prose style={{ marginTop: 18 }}>
          <p style={{ margin: 0 }}>once you're in, the top bar swaps to:</p>
        </Prose>

        <Terminal style={{ marginTop: 12 }}>
          <div style={{ color: theme.fg }}>
            <span style={{ color: theme.accent }}>KHALIL.OPS</span>{'  '}
            <span style={{ color: theme.accent2 }}>[MISSION CONTROL][ON-SITE EDITOR]</span>{'  '}
            <span style={{ color: '#3df562' }}>⊕ SAVE</span>{'  '}
            <span style={{ color: '#ff3a3a' }}>× EXIT</span>
          </div>
        </Terminal>

        <Prose style={{ marginTop: 18 }}>
          <p style={{ margin: 0 }}>
            two tabs. they edit <strong>different parts</strong> of the same
            site. each thing you can change lives in <strong>exactly one</strong>
            {' '}tab so you never have to remember "where did I edit that?":
          </p>
        </Prose>

        <Panel label="◇ THE TWO TABS" theme={theme}>
          <KsRows
            rows={[
              ['MISSION CONTROL', 'the broadcast deck. the big plunger + the live-state modules. use it for stuff that changes session to session — what you\'re playing now, your mood, your sub count, which video is pinned, which color theme is on, and any message you want to fire.'],
              ['ON-SITE EDITOR', 'mini-mockups of the homepage with pins on every field. use it for stuff that defines what the site IS — your handle, hero copy, stats, the about paragraphs, the book, your social links, your replay style.']
            ]}
            theme={theme}
          />
        </Panel>

        <Notebook>
          both tabs share the same memory, so unsaved edits in one tab are
          still there when you flip to the other.
        </Notebook>

        <Panel label="◇ THE TWO ACTION BUTTONS" theme={theme}>
          <KsRows
            rows={[
              ['⊕ SAVE', 'pushes everything you changed (except messages) to the live site. takes about a minute.'],
              ['× EXIT', 'logs you out. the site stays exactly as it was last saved.']
            ]}
            theme={theme}
          />
        </Panel>

        <Tldr>
          /edit is the only locked page. <strong>MISSION CONTROL</strong> handles
          live stuff (mood, now, theme, messages). <strong>ON-SITE EDITOR</strong>
          handles the site's permanent content (handle, hero, about, book,
          socials). SAVE pushes everything live (except messages). EXIT logs out.
        </Tldr>
      </Part>

      {/* ─── PART 6 ────────────────────────────────────────────── */}
      <Part n={6} tag="◇ PART SIX" title="MISSION CONTROL" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            this tab is your <strong>broadcast deck</strong>. the headline
            feature: a big red plunger that fires a real-time message to
            anyone who's on the site right now. around it sit the live-state
            modules — the things about you that change session to session.
            <strong> try the plunger below</strong> — it really works
            (locally, in this demo).
          </p>
        </Prose>

        <PlungerDemo theme={theme} size={size} />

        <Panel label="◇ STEP-BY-STEP · FIRING A MESSAGE" theme={theme}>
          <Prose>
            <p><strong>1.</strong> type the message — what you want everyone to see (up to 120 letters).</p>
            <p><strong>2.</strong> pick a payload — what kind of celebration:</p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>🎉 <strong>CONFETTI</strong> — paper pop + sparkly chirps</li>
              <li>💰 <strong>GOLD</strong> — mario-coin shower (14 pings)</li>
              <li>⚡ <strong>NEON</strong> — bass drop + rave zap</li>
              <li>🔥 <strong>FIRE</strong> — boom + breathing flame + crackles</li>
              <li>⚽ <strong>GOAL</strong> — referee whistle + horn + crowd roar</li>
              <li>🍰 <strong>CAKE</strong> — party horn + bell triad</li>
            </ul>
            <p><strong>3.</strong> pick a fuse — when it should go off:</p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li><strong>NOW</strong> — fires the instant you press FIRE (lasts 5 minutes)</li>
              <li><strong>+1 HOUR</strong> — fires one hour from now (lasts 5 minutes)</li>
              <li><strong>NEXT VISIT</strong> — fires the next time a new visitor lands (lasts 24 hours)</li>
              <li><strong>ON REFRESH</strong> — fires every time the page is refreshed for the next hour</li>
            </ul>
            <p style={{ marginBottom: 0 }}><strong>4.</strong> hit the FIRE plunger. the preview shows you exactly what visitors will see. the plunger goes <strong>ka-CHUNK</strong> and the payload sound plays as it lands.</p>
          </Prose>
        </Panel>

        <Panel label="◇ SIDE MODULES (the live-state stuff)" theme={theme}>
          <KsRows
            rows={[
              ['LIVE STATUS', 'mood LED + sub count (current + goal)'],
              ['NOW', "what you're playing / watching / reading / listening (per mode)"],
              ['PINNED REPLAY', 'which video shows up first in REPLAYS'],
              ['THEME · GAMING', '9 color palettes. FIXED = one for everyone · RANDOM = new pick every refresh · SHUFFLE = each visitor keeps their own pick.']
            ]}
            theme={theme}
          />
          <Notebook>
            things like your handle, hero copy, about paragraphs, book,
            socials, replay style and boot mode are the permanent identity
            of the site — those live in <strong>ON-SITE EDITOR</strong>.
          </Notebook>
        </Panel>

        <SaveFireQuickCompare theme={theme} size={size} />

        <Notebook>
          <strong>why the difference?</strong> messages are quick — they live
          in a fast box and disappear after their fuse runs out. everything
          else (your handle, stats, videos, book) is part of the actual site.
          saving it makes the site rebuild itself with the new stuff.
        </Notebook>

        <Tldr>
          the plunger sends a message that pops on the homepage within
          seconds. the SAVE button updates the actual site (slower but it
          stays). both live in MISSION CONTROL — different buttons.
        </Tldr>
      </Part>

      {/* ─── PART 7 ────────────────────────────────────────────── */}
      <Part n={7} tag="◇ PART SEVEN" title="ON-SITE EDITOR" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            this tab shows <strong>mini-mockups</strong> of every part of the
            homepage. each section has small <strong>EDIT pins</strong>
            {' '}floating on it — tap a pin to slide a drawer in from the right
            with a form for that exact field. everything here is the
            <strong> permanent identity</strong> of the site (the stuff that's
            the same every time you visit).
          </p>
        </Prose>

        <Panel label="◇ EVERY PIN · WHAT IT EDITS" theme={theme}>
          <PinGrid theme={theme} />
        </Panel>

        <Notebook>
          looking for <strong>MOOD · SUBS · NOW · PINNED · THEME</strong>? those
          are all session-level controls — flip over to <strong>MISSION
          CONTROL</strong>.
        </Notebook>

        <Notebook>
          HERO and STATS are{' '}
          <strong>different in gaming vs football</strong>. the mode toggle at
          the top of the editor tab tells the preview which one you're looking
          at. flip it before editing those fields.
        </Notebook>

        <Panel label="◇ THE DRAWER" theme={theme}>
          <Prose>
            <p style={{ margin: 0 }}>
              tap a pin → a drawer slides in from the right with the form.
              make your changes → the preview updates live → close the drawer
              → press SAVE at the top to push everything live.
            </p>
          </Prose>
        </Panel>

        <Tldr>
          ON-SITE EDITOR is the precision tab for the site's identity. see the
          site in miniature, tap an EDIT pin to open the field, type, close,
          save.
        </Tldr>
      </Part>

      {/* ─── PART 8 ────────────────────────────────────────────── */}
      <Part n={8} tag="◇ PART EIGHT" title="IMAGE UPLOADS" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            scroll to the bottom of the <strong>ON-SITE EDITOR</strong> tab.
            you'll see the <strong>◇ IMAGES</strong> section. this is where
            you replace placeholder art with your own photos.
          </p>
        </Prose>

        <Panel label="◇ 8 SLOTS · DRAG &amp; DROP TO REPLACE" theme={theme}>
          <SlotGrid theme={theme} />
        </Panel>

        <Panel label="◇ HOW TO UPLOAD" theme={theme}>
          <Prose>
            <p><strong>1.</strong> click a slot OR drag-and-drop an image onto it.</p>
            <p><strong>2.</strong> the image gets shrunk to fit (about 1024px on the long edge) and uploaded.</p>
            <p><strong>3.</strong> the thumbnail appears with a <strong>✓ LIVE ON SITE</strong> badge.</p>
            <p style={{ marginBottom: 0 }}><strong>4.</strong> press <strong>SAVE</strong> at the top.</p>
          </Prose>
        </Panel>

        <Panel label="◇ REPLACE OR REMOVE" theme={theme}>
          <KsRows
            rows={[
              ['REPLACE', 'click the slot again → pick a new photo. the old one gets swapped out.'],
              ['REMOVE', 'press the × remove button below the thumbnail. press SAVE — the slot goes back to its default.']
            ]}
            theme={theme}
          />
        </Panel>

        <Panel label="◇ WHERE EACH SLOT SHOWS UP" theme={theme}>
          <KsRows
            rows={[
              ['portrait-gaming', 'the middle polaroid card (when gaming is active)'],
              ['portrait-football', 'the middle polaroid card (when football is active)'],
              ['book-cover', 'the book cover (replaces the gradient)'],
              ['replay-{id}', "that specific video's thumbnail (replaces youtube's)"]
            ]}
            theme={theme}
          />
        </Panel>

        <Notebook>
          the <strong>book cover</strong> slot can be uploaded from either the
          IMAGES section <em>OR</em> the BOOK pin's drawer. both change the
          same photo — use whichever's faster.
        </Notebook>

        <Panel label="◇ FILE RULES" theme={theme}>
          <KsRows
            rows={[
              ['FORMATS', 'JPG, PNG, WebP, GIF'],
              ['MAX SIZE', '6 MB (the uploader shrinks bigger files automatically)'],
              ['BEST SHAPE', 'square-ish for portraits, tall (3:4) for the book cover, wide (16:9) for replays']
            ]}
            theme={theme}
          />
        </Panel>

        <Tldr>
          drag photos onto slots. press SAVE. the photo replaces the
          placeholder. press × remove to put the placeholder back.
        </Tldr>
      </Part>

      {/* ─── PART 9 ────────────────────────────────────────────── */}
      <Part n={9} tag="◇ PART NINE" title="SAVE & FIRE" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>two paths. two kinds of changes.</p>
        </Prose>

        <SaveFireCompare theme={theme} size={size} />

        <Panel label="◇ WHAT 'SAVES' CAN BREAK" theme={theme}>
          <Prose>
            <p style={{ margin: 0 }}>
              almost nothing. if you typo your bio you can just edit again.
              the site does a rebuild on every save, but rebuilds are fast
              (around 30 seconds). if a save somehow breaks the rebuild, the
              new version doesn't go live and the old version stays up. the
              site never goes blank on you.
            </p>
          </Prose>
        </Panel>

        <Panel label="◇ WHAT 'FIRES' CAN BREAK" theme={theme}>
          <Prose>
            <p style={{ margin: 0 }}>
              less than nothing. messages have a fuse — they go away on their
              own. worst case: people see your typo for a minute, then it
              vanishes.
            </p>
          </Prose>
        </Panel>

        <Panel label="◇ WHERE THE DATA LIVES" theme={theme}>
          <Terminal>
            <TermLine prompt="SITE CONTENT" promptColor={theme.accent} inkColor={theme.fg}>
              → saved on github (a safe place that keeps every old version)
            </TermLine>
            <TermLine prompt="IMAGES" promptColor={theme.accent} inkColor={theme.fg}>
              → the photo locker (separate, for actual photo files)
            </TermLine>
            <TermLine prompt="MESSAGES" promptColor={theme.accent2} inkColor={theme.fg}>
              → the fast box (doesn't trigger a rebuild, that's why 3 seconds)
            </TermLine>
          </Terminal>
        </Panel>

        <Notebook>
          you don't have to think about any of this. but it's useful to know
          that messages are deliberately separate, so you can fire 20 of them
          a day without slowing anything down.
        </Notebook>

        <Tldr>
          SAVE is for content (text, images, settings) — takes about a minute.
          FIRE is for messages — takes 3–5 seconds. both are reversible.
        </Tldr>
      </Part>

      {/* ─── PART 10 ───────────────────────────────────────────── */}
      <Part n={10} tag="◇ PART TEN" title="TROUBLESHOOTING" theme={theme} size={size}>
        <Prose>
          <p style={{ margin: 0 }}>
            if something looks wrong, run through these in order:
          </p>
        </Prose>

        <TsBlock
          theme={theme}
          q="i changed something and the site didn't update"
          a={
            <>
              did you press <strong>SAVE</strong>? (not FIRE — that's only for
              messages.) after saving, give it about a minute. still wrong? do
              a hard refresh: <strong>mac:</strong> Cmd + Shift + R ·{' '}
              <strong>windows:</strong> Ctrl + Shift + R. still nothing? tell
              whoever helps you with the site — they can check if the save got
              stuck.
            </>
          }
        />
        <TsBlock
          theme={theme}
          q="i fired a message and no one sees it"
          a={
            <>
              check the speaker button — make sure your homepage isn't muted.
              wait about 5 seconds. the homepage checks for new messages every
              few seconds. did you pick <strong>NOW</strong> as the fuse? the
              other fuses delay things.
            </>
          }
        />
        <TsBlock
          theme={theme}
          q="an image upload failed"
          a={
            <>
              check the file size — over 6 MB might choke. try a smaller photo
              first. check the format — only JPG / PNG / WebP / GIF work. if
              you see "blob storage is not configured" — that's a setup
              problem, not your fault. tell whoever set up the site.
            </>
          }
        />
        <TsBlock
          theme={theme}
          q="i want to undo a change"
          a={
            <>
              easiest way: edit it back and save again. old versions of the
              site are saved on github. someone with repo access can put back
              any past version in a couple of minutes.
            </>
          }
        />
        <TsBlock
          theme={theme}
          q="sounds don't play"
          a={
            <>
              browsers don't let pages play sound until you click or tap
              something. try clicking somewhere first. iphone safari sometimes
              needs a second to wake up audio — wait a tick after you tap.
              check the <strong>🔊 speaker button</strong> in the bottom-right
              corner.
            </>
          }
        />
        <TsBlock
          theme={theme}
          q="the mode flip glitched mid-transition"
          a={<>don't worry, it'll finish. if it feels stuck, refresh the page once.</>}
        />
        <TsBlock
          theme={theme}
          q="everything is broken"
          a={
            <>
              don't panic. the old version is always one rollback away. tell
              whoever helps you with the site — we can put it back in a couple
              minutes.
            </>
          }
        />
      </Part>
    </>
  );
};

// ── inline mini-components ────────────────────────────────────────

const Code = ({ children, theme }: { children: ReactNode; theme: ArenaTheme }) => (
  <code
    style={{
      fontFamily: FONT_MONO,
      fontSize: '0.95em',
      color: theme.accent,
      padding: '1px 6px',
      background: themedBackdrop(theme.fg, 0.4),
      borderRadius: 3
    }}
  >
    {children}
  </code>
);

interface CompareColProps {
  active: boolean;
  theme: ArenaTheme;
  title: string;
  children: ReactNode;
}

const CompareCol = ({ active, theme, title, children }: CompareColProps) => (
  <div
    style={{
      background: active ? `${theme.accent}10` : themedBackdrop(theme.fg, 0.35),
      border: `1px solid ${active ? theme.accent : themedFg(theme.fg, 0.1)}`,
      borderRadius: 6,
      padding: 18,
      boxShadow: active ? `0 0 18px ${theme.accent}40` : 'none',
      transition: 'all .35s ease'
    }}
  >
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 22,
        letterSpacing: 1,
        color: active ? theme.accent : theme.fg,
        marginBottom: 10
      }}
    >
      {title} {active && <span style={{ fontSize: 11, color: theme.accent2 }}>· active</span>}
    </div>
    <ul
      style={{
        margin: 0,
        paddingLeft: 18,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14,
        lineHeight: 1.65,
        color: themedFg(theme.fg, 0.78)
      }}
    >
      {children}
    </ul>
  </div>
);

// ── PinGrid (Part 7) ──────────────────────────────────────────────

const PINS = [
  ['HANDLE', 'your @ username (max 40 letters)'],
  ['HERO', 'tagline + bio + button text + vibe (per mode)'],
  ['STATS', 'the 4 stat cells (label + value, per mode)'],
  ['STYLE', 'youtube vs designed thumbs + tier rarities + palette'],
  ['ABOUT', 'the paragraphs at the bottom'],
  ['BOOK', 'title + subtitle + description + status + cover photo'],
  ['SOCIALS', 'tiktok + instagram links'],
  ['BOOT MODE', 'default mode for new visitors']
] as const;

const PinGrid = ({ theme }: { theme: ArenaTheme }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 10
    }}
  >
    {PINS.map(([tag, desc]) => (
      <div
        key={tag}
        style={{
          padding: '12px 14px',
          background: themedBackdrop(theme.fg, 0.35),
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 4,
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: 1.5,
            color: theme.accent,
            marginBottom: 6
          }}
        >
          ✎ {tag}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.4, color: themedFg(theme.fg, 0.78) }}>
          {desc}
        </div>
      </div>
    ))}
  </div>
);

// ── SlotGrid (Part 8) ─────────────────────────────────────────────

const SLOTS: ReadonlyArray<{ icon: string; name: string; sub: string }> = [
  { icon: '🎮', name: 'PORTRAIT', sub: 'GAMING' },
  { icon: '⚽', name: 'PORTRAIT', sub: 'FOOTBALL' },
  { icon: '📖', name: 'BOOK', sub: 'COVER' },
  { icon: '📼', name: 'REPLAY 1', sub: '16:9' },
  { icon: '📼', name: 'REPLAY 2', sub: '16:9' },
  { icon: '📼', name: 'REPLAY 3', sub: '16:9' },
  { icon: '📼', name: 'REPLAY 4', sub: '16:9' },
  { icon: '📼', name: 'REPLAY 5', sub: '16:9' }
];

const SlotGrid = ({ theme }: { theme: ArenaTheme }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
      gap: 10
    }}
  >
    {SLOTS.map((s, i) => (
      <div
        key={`${s.name}-${i}`}
        style={{
          padding: '14px 8px',
          background: themedBackdrop(theme.fg, 0.4),
          border: `1px dashed ${theme.accent}66`,
          borderRadius: 4,
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            letterSpacing: 1,
            color: theme.fg
          }}
        >
          {s.name}
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 9,
            letterSpacing: 1.5,
            color: theme.accent,
            marginTop: 3
          }}
        >
          {s.sub}
        </div>
      </div>
    ))}
  </div>
);

// ── SaveFireCompare (Part 9 full version) ────────────────────────

interface SaveFireCompareProps {
  theme: ArenaTheme;
  size: ArenaSize;
}

const SaveFireCompare = ({ theme, size }: SaveFireCompareProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: size === 'phone' ? '1fr' : '1fr 1fr',
      gap: 14,
      margin: '20px 0'
    }}
  >
    <SaveFireCard
      kind="save"
      theme={theme}
      icon="⊕ SAVE"
      title={<>EVERYTHING<br />EXCEPT MESSAGES</>}
      rows={[
        ['BUTTON', '⊕ SAVE'],
        ['EFFECT', 'NEW VERSION GOES LIVE'],
        ['SHOWS UP IN', '~1 MINUTE'],
        ['UNDO?', 'YES · ROLLBACK']
      ]}
    />
    <SaveFireCard
      kind="fire"
      theme={theme}
      icon="▼ FIRE"
      title={<>ANNOUNCEMENTS<br />ONLY</>}
      rows={[
        ['BUTTON', '▼ FIRE PLUNGER'],
        ['EFFECT', 'INSTANT WRITE'],
        ['SHOWS UP IN', '3–5 SECONDS'],
        ['UNDO?', 'FUSE EXPIRES · GONE']
      ]}
    />
  </div>
);

// ── SaveFireQuickCompare (Part 6 short version) ────────────────

const SaveFireQuickCompare = ({ theme, size }: SaveFireCompareProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: size === 'phone' ? '1fr' : '1fr 1fr',
      gap: 14,
      margin: '20px 0'
    }}
  >
    <SaveFireCard
      kind="save"
      theme={theme}
      icon="⊕ SAVE"
      title={<>EVERYTHING ELSE</>}
      rows={[
        ['BUTTON', '⊕ SAVE'],
        ['EFFECT', 'NEW VERSION GOES LIVE'],
        ['SHOWS UP IN', '~1 MINUTE'],
        ['UNDO?', 'YES']
      ]}
    />
    <SaveFireCard
      kind="fire"
      theme={theme}
      icon="▼ FIRE"
      title={<>MESSAGES ONLY</>}
      rows={[
        ['BUTTON', '▼ FIRE PLUNGER'],
        ['EFFECT', 'INSTANT WRITE'],
        ['SHOWS UP IN', '3–5 SECONDS'],
        ['UNDO?', 'IT EXPIRES']
      ]}
    />
  </div>
);

interface SaveFireCardProps {
  kind: 'save' | 'fire';
  theme: ArenaTheme;
  icon: string;
  title: ReactNode;
  rows: ReadonlyArray<readonly [string, string]>;
}

const SaveFireCard = ({ kind, theme, icon, title, rows }: SaveFireCardProps) => {
  const accent = kind === 'save' ? '#3df562' : '#ff3a3a';
  return (
    <div
      style={{
        background: themedBackdrop(theme.fg, 0.45),
        border: `2px solid ${accent}`,
        borderRadius: 6,
        padding: 22,
        boxShadow: `0 0 24px ${accent}30`
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 32,
          letterSpacing: 2,
          color: accent,
          textShadow: `0 0 18px ${accent}`,
          marginBottom: 6
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          letterSpacing: 1.5,
          color: theme.fg,
          marginBottom: 14,
          lineHeight: 1.05
        }}
      >
        {title}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: 1.2,
              borderBottom: `1px solid ${themedFg(theme.fg, 0.07)}`,
              paddingBottom: 6
            }}
          >
            <span style={{ color: themedFg(theme.fg, 0.55) }}>{k}</span>
            <span style={{ color: accent, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── TsBlock (Part 10) ─────────────────────────────────────────────

interface TsBlockProps {
  theme: ArenaTheme;
  q: string;
  a: ReactNode;
}

const TsBlock = ({ theme, q, a }: TsBlockProps) => (
  <div
    style={{
      background: themedBackdrop(theme.fg, 0.35),
      border: `1px solid ${theme.cardBorder}`,
      borderLeft: `3px solid ${theme.accent}`,
      borderRadius: 4,
      padding: '16px 20px',
      marginBottom: 12
    }}
  >
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 18,
        letterSpacing: 0.5,
        color: theme.accent,
        marginBottom: 8
      }}
    >
      ▸ {q}
    </div>
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14.5,
        lineHeight: 1.55,
        color: themedFg(theme.fg, 0.78)
      }}
    >
      {a}
    </div>
  </div>
);
