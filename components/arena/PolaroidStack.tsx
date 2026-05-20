import type { Mode } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { CardEmblem } from './cards/CardEmblem';
import { CardPortrait } from './cards/CardPortrait';
import { CardNote } from './cards/CardNote';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  /** Optional real photo for the middle card; falls back to emoji. */
  portraitPhotoUrl?: string | null;
}

// Three crooked cards stacked corkboard-style. Per-mode content. Replaces
// the iridescent orb / R3F kid from earlier iterations.
export const PolaroidStack = ({ mode, theme, size, portraitPhotoUrl }: Props) => {
  const w = size === 'desktop' ? 240 : size === 'tablet' ? 200 : 160;
  const h = size === 'desktop' ? 300 : size === 'tablet' ? 250 : 200;

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
    <div style={{ position: 'relative', width: w * 1.5, height: h * 1.45 }}>
      <CardEmblem
        label={emblem.label}
        sub={emblem.sub}
        mode={mode}
        theme={theme}
        size={size}
        style={{ width: w, height: h, top: 0, left: 0, transform: 'rotate(-9deg)', zIndex: 1 }}
      />
      <CardPortrait
        icon={portrait.icon}
        label={portrait.label}
        sub={portrait.sub}
        mode={mode}
        theme={theme}
        size={size}
        photoUrl={portraitPhotoUrl}
        style={{ width: w, height: h, top: '8%', left: '30%', transform: 'rotate(7deg)', zIndex: 2 }}
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
          transform: 'rotate(-4deg)',
          zIndex: 3
        }}
      />
    </div>
  );
};
