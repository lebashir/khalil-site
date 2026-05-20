'use client';

import type { SiteContent } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { Reveal } from './Reveal';
import { HudCard } from './HudCard';
import { HudLabel } from './HudLabel';

interface Props {
  subs: SiteContent['subs'];
  theme: ArenaTheme;
  size: ArenaSize;
}

export const SubsHud = ({ subs, theme, size }: Props) => {
  const pct = Math.max(0, Math.min(100, (subs.current / subs.goal) * 100));
  const isDesktop = size === 'desktop';
  return (
    <section id="subs" style={{ padding: isDesktop ? '24px 64px 0' : '4px 14px 14px' }}>
      <Reveal>
        <HudCard theme={theme} style={{ padding: isDesktop ? 24 : 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <HudLabel theme={theme}>SUBSCRIBERS · GOAL</HudLabel>
            <span
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: isDesktop ? 12 : 10,
                color: theme.accent2,
                letterSpacing: 1,
                transition: 'color .6s ease'
              }}
            >
              {(100 - pct).toFixed(0)}% TO GO
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
            <span
              style={{
                fontFamily: "'Anton', 'Bungee', sans-serif",
                fontSize: isDesktop ? 72 : 44,
                color: theme.fg,
                lineHeight: 1,
                letterSpacing: -1
              }}
            >
              {subs.current}
            </span>
            <span
              style={{
                fontFamily: "'Anton', 'Bungee', sans-serif",
                fontSize: isDesktop ? 24 : 16,
                color: theme.accent,
                transition: 'color .6s ease'
              }}
            >
              / {subs.goal}
            </span>
          </div>
          <div
            style={{
              marginTop: 10,
              height: isDesktop ? 12 : 8,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.cardBorder}`,
              transition: 'border-color .6s ease'
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
                boxShadow: `0 0 10px ${theme.accent}`,
                transition: 'width .8s ease, background .6s ease, box-shadow .6s ease'
              }}
            />
          </div>
        </HudCard>
      </Reveal>
    </section>
  );
};
