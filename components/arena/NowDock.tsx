'use client';

import type { Mode, SiteContent } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { Reveal } from './Reveal';
import { HudCard } from './HudCard';
import { HudLabel } from './HudLabel';

interface Props {
  mode: Mode;
  now: SiteContent['now'];
  theme: ArenaTheme;
  size: ArenaSize;
}

// Per-mode label flavor: gaming reads as a loadout, football reads as a
// matchday brief. Same four content fields.
const labelsFor = (mode: Mode): [string, string, string, string] =>
  mode === 'gaming'
    ? ['EQUIPPED', 'WATCHING', 'READING', 'OST']
    : ['STARTING XI', 'POST-MATCH', 'READING', 'WALKOUT MUSIC'];

export const NowDock = ({ mode, now, theme, size }: Props) => {
  const n = now[mode];
  const labels = labelsFor(mode);
  const items: Array<{ label: string; value: string }> = [
    { label: labels[0], value: n.playing },
    { label: labels[1], value: n.watching },
    { label: labels[2], value: n.reading },
    { label: labels[3], value: n.listening }
  ];
  const isDesktop = size === 'desktop';
  return (
    <section style={{ padding: isDesktop ? '24px 64px 0' : '0 14px 14px' }}>
      <Reveal>
        <HudCard theme={theme} style={{ padding: isDesktop ? 24 : 16 }}>
          <HudLabel theme={theme}>{theme.sectionLabel} · THIS WEEK</HudLabel>
          <div
            key={mode}
            style={{
              marginTop: 12,
              display: isDesktop ? 'grid' : 'flex',
              flexDirection: isDesktop ? undefined : 'column',
              gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined,
              gap: isDesktop ? 14 : 8
            }}
          >
            {items.map((it, i) => (
              <div
                key={it.label}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  paddingBottom: 6,
                  borderBottom:
                    !isDesktop && i < items.length - 1 ? `1px dashed ${theme.cardBorder}` : 'none',
                  animation: `k-stamp-in .4s cubic-bezier(.2,1.2,.4,1) ${i * 70}ms both`
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: isDesktop ? 10 : 9,
                    color: theme.accent,
                    letterSpacing: 1.5,
                    minWidth: isDesktop ? 110 : 80,
                    transition: 'color .6s ease'
                  }}
                >
                  {it.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: isDesktop ? 15 : 13,
                    color: theme.fg,
                    fontWeight: 500
                  }}
                >
                  {it.value}
                </span>
              </div>
            ))}
          </div>
        </HudCard>
      </Reveal>
    </section>
  );
};
