'use client';

import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { Reveal } from './Reveal';
import { HudCard } from './HudCard';
import { HudLabel } from './HudLabel';
import { renderBold } from '@/lib/bold';

interface Props {
  paragraphs: string[];
  theme: ArenaTheme;
  size: ArenaSize;
}

export const About = ({ paragraphs, theme, size }: Props) => {
  const isDesktop = size === 'desktop';
  return (
    <section id="about" style={{ padding: isDesktop ? '32px 64px 0' : '4px 14px 14px' }}>
      <Reveal>
        <HudCard theme={theme} style={{ padding: isDesktop ? 32 : 16 }}>
          <HudLabel theme={theme}>§ ABOUT.SYS</HudLabel>
          <h2
            style={{
              margin: '6px 0 14px',
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: isDesktop ? 56 : 36,
              color: theme.fg,
              lineHeight: 0.95,
              letterSpacing: -0.5
            }}
          >
            PROFILE.
            <span style={{ color: theme.accent, transition: 'color .6s ease' }}>DAT</span>
          </h2>
          <div style={{ maxWidth: isDesktop ? 720 : 'none' }}>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: isDesktop ? 17 : 14,
                  lineHeight: 1.55,
                  color: i === 0 ? theme.fg : 'rgba(255,255,255,0.78)',
                  margin: '0 0 10px',
                  fontWeight: i === 0 ? 600 : 400
                }}
              >
                {renderBold(p)}
              </p>
            ))}
          </div>
        </HudCard>
      </Reveal>
    </section>
  );
};
