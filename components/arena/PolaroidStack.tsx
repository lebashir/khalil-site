'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Mode } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { CardEmblem } from './cards/CardEmblem';
import { CardPortrait } from './cards/CardPortrait';
import { CardNote } from './cards/CardNote';
import { useHoverTilt } from '@/components/fx';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  /** Optional real photo for the middle card; falls back to emoji. */
  portraitPhotoUrl?: string | null;
}

// Stable per-card animation/spread vectors. Hardcoded (not random) so
// the server-rendered HTML matches the first client render — no
// hydration mismatch — and the fan-out direction is artful rather than
// arbitrary.
//
//   bobDelay  — negative so each card mounts mid-cycle, breathing
//               out of phase with the others
//   spreadX/Y — pixels. Emblem fans up-and-left, Portrait fans right,
//               Note fans down-and-left so the trio splays away from
//               the geometric center.
const CARD_BEHAVIOR = {
  emblem: { bobDelay: -0.3, spreadX: -34, spreadY: -22 },
  portrait: { bobDelay: -2.1, spreadX: 38, spreadY: -8 },
  note: { bobDelay: -3.8, spreadX: -28, spreadY: 32 }
} as const;

const FAN_TOUCH_MS = 1400;

// Three crooked cards stacked corkboard-style. Per-mode content. Replaces
// the iridescent orb / R3F kid from earlier iterations.
//
// Layered behavior (§5):
//   - Staggered bob per card (CARD_BEHAVIOR.bobDelay)
//   - Per-card hover-lift via .k-polaroid-card:hover
//   - Tap-to-pop via the Polaroid's internal animation-restart trick
//   - Stack fan-out via .k-polaroid-stack:hover (desktop) OR a stateful
//     .fan-out class held for ~1.4s after a tap (touch)
//
// The whole stack also runs §4's useHoverTilt — that transform sits on
// the container and composes naturally with the per-card translates.
export const PolaroidStack = ({ mode, theme, size, portraitPhotoUrl }: Props) => {
  const w = size === 'desktop' ? 240 : size === 'tablet' ? 200 : 160;
  const h = size === 'desktop' ? 300 : size === 'tablet' ? 250 : 200;

  const tiltRef = useHoverTilt<HTMLDivElement>({ max: 6, scale: 1.02 });
  const [fanned, setFanned] = useState(false);
  const fanTimerRef = useRef<number | null>(null);

  const triggerFan = useCallback(() => {
    setFanned(true);
    if (fanTimerRef.current !== null) {
      window.clearTimeout(fanTimerRef.current);
    }
    fanTimerRef.current = window.setTimeout(() => {
      fanTimerRef.current = null;
      setFanned(false);
    }, FAN_TOUCH_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (fanTimerRef.current !== null) {
        window.clearTimeout(fanTimerRef.current);
      }
    };
  }, []);

  const emblem =
    mode === 'gaming'
      ? { label: 'GAMERTAG', sub: '@khalilgaming2020' }
      : { label: 'JERSEY', sub: 'HOME · #7' };
  const portrait =
    mode === 'gaming'
      ? { icon: '🎮', label: 'KHALIL · LVL 10', sub: '744 SUBS · ONLINE' }
      : { icon: '⚽', label: 'KHALIL · NO. 7', sub: 'STRIKER · LATE EQUALIZER GUY' };
  const note =
    mode === 'gaming'
      ? "i'm khalil.\nand yeah i\nactually carry."
      : "i'm khalil.\nthe ball does\nwhat i tell it.";

  return (
    <div
      ref={tiltRef}
      className={`k-polaroid-stack${fanned ? ' fan-out' : ''}`}
      style={{
        position: 'relative',
        width: w * 1.5,
        height: h * 1.45,
        transition: 'transform .15s ease-out',
        transformStyle: 'preserve-3d'
      }}
    >
      <CardEmblem
        label={emblem.label}
        sub={emblem.sub}
        mode={mode}
        theme={theme}
        size={size}
        style={{ width: w, height: h, top: 0, left: 0, zIndex: 1 }}
        rotate={-9}
        bobDelay={CARD_BEHAVIOR.emblem.bobDelay}
        spreadX={CARD_BEHAVIOR.emblem.spreadX}
        spreadY={CARD_BEHAVIOR.emblem.spreadY}
        onTap={triggerFan}
      />
      <CardPortrait
        icon={portrait.icon}
        label={portrait.label}
        sub={portrait.sub}
        mode={mode}
        theme={theme}
        size={size}
        photoUrl={portraitPhotoUrl}
        style={{ width: w, height: h, top: '8%', left: '30%', zIndex: 2 }}
        rotate={7}
        bobDelay={CARD_BEHAVIOR.portrait.bobDelay}
        spreadX={CARD_BEHAVIOR.portrait.spreadX}
        spreadY={CARD_BEHAVIOR.portrait.spreadY}
        onTap={triggerFan}
      />
      <CardNote
        text={note}
        theme={theme}
        size={size}
        style={{
          width: w * 0.82,
          height: h * 0.5,
          top: '70%',
          left: '12%',
          zIndex: 3
        }}
        rotate={-4}
        bobDelay={CARD_BEHAVIOR.note.bobDelay}
        spreadX={CARD_BEHAVIOR.note.spreadX}
        spreadY={CARD_BEHAVIOR.note.spreadY}
        onTap={triggerFan}
      />
    </div>
  );
};
