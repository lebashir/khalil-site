'use client';

import type { Mode, SiteContent } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { Reveal } from './Reveal';
import { PolaroidStack } from './PolaroidStack';
import { FloatingTag } from './FloatingTag';
import { Pressable, Jiggleable } from '@/components/fx';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  content: SiteContent;
}

const YT_URL = 'https://www.youtube.com/@khalilgaming2020';

export const Hero = ({ mode, theme, size, content }: Props) => {
  const m = content.hero[mode];
  const stats = content.stats[mode];
  const isDesktop = size === 'desktop';
  const isTablet = size === 'tablet';

  const titleA = isDesktop ? 200 : isTablet ? 140 : 80;
  const titleB = isDesktop ? 160 : isTablet ? 112 : 64;
  const bioSize = isDesktop ? 20 : isTablet ? 17 : 14;

  const characterPanel = (
    <div
      style={{
        position: 'relative',
        width: isDesktop ? 400 : '100%',
        minHeight: isDesktop ? 480 : isTablet ? 380 : 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: isDesktop ? 0 : '24px 0 0'
      }}
    >
      <PolaroidStack mode={mode} theme={theme} size={size} />

      <FloatingTag
        label="SUBS"
        value={content.subs.current}
        theme={theme}
        position={{
          right: isDesktop ? -16 : isTablet ? 24 : 8,
          top: isDesktop ? 28 : isTablet ? 16 : 4
        }}
        delay="0s"
      />
      <FloatingTag
        label="RANK"
        value="GOAT"
        theme={theme}
        position={{
          left: isDesktop ? -16 : isTablet ? 24 : 8,
          bottom: isDesktop ? 70 : isTablet ? 30 : 14
        }}
        delay=".8s"
      />
    </div>
  );

  const textPanel = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: theme.accent,
              boxShadow: `0 0 8px ${theme.accent}`,
              transition: 'background .6s ease, box-shadow .6s ease'
            }}
          />
          <span
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: isDesktop ? 12 : 10,
              color: theme.accent,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              transition: 'color .6s ease'
            }}
          >
            {theme.role} · {theme.role2} · {theme.role3}
          </span>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Anton', 'Bungee', sans-serif",
            color: theme.fg,
            fontSize: titleA,
            lineHeight: 0.86,
            letterSpacing: -1,
            textShadow: `0 0 32px ${theme.accent}60, 0 4px 24px rgba(0,0,0,0.6)`,
            transition: 'text-shadow .6s ease'
          }}
        >
          {theme.titleA}
        </h1>
      </Reveal>
      <Reveal delay={180}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: titleB,
            lineHeight: 0.86,
            letterSpacing: -1,
            backgroundImage: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: `drop-shadow(0 0 18px ${theme.accent}80)`,
            transition: 'filter .6s ease'
          }}
        >
          {theme.titleB}
        </h1>
      </Reveal>

      <Reveal delay={280}>
        <p
          key={`${mode}-bio`}
          style={{
            margin: isDesktop ? '24px 0 26px' : '12px 0 16px',
            maxWidth: isDesktop ? 520 : 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: bioSize,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.85)',
            animation: 'k-stamp-in .5s cubic-bezier(.2,1.2,.4,1) both'
          }}
        >
          {m.bio}
        </p>
      </Reveal>

      <Reveal delay={380}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Pressable
            tag="a"
            href={YT_URL}
            target="_blank"
            rel="noopener noreferrer"
            rippleColor={`${theme.accent}88`}
            ringColor={theme.accent}
            style={{
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: isDesktop ? 24 : 18,
              letterSpacing: 1,
              color: mode === 'gaming' ? '#0a0420' : '#001233',
              background: `linear-gradient(180deg, ${theme.ctaA} 0%, ${theme.ctaB} 100%)`,
              padding: isDesktop ? '18px 32px' : '14px 24px',
              border: 'none',
              clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
              boxShadow: `0 0 24px ${theme.accent}50`,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'background .6s ease, box-shadow .6s ease'
            }}
          >
            {m.cta.toUpperCase()}
          </Pressable>
          <Pressable
            tag="a"
            href="#replays"
            rippleColor={`${theme.accent}88`}
            ringColor={theme.accent}
            style={{
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: isDesktop ? 18 : 14,
              letterSpacing: 1,
              color: theme.fg,
              background: 'transparent',
              border: `1.5px solid ${theme.accent}`,
              padding: isDesktop ? '14px 22px' : '10px 16px',
              clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'border-color .6s ease'
            }}
          >
            WATCH →
          </Pressable>
        </div>
      </Reveal>

      <Reveal delay={460}>
        <div
          key={`${mode}-stats`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginTop: isDesktop ? 36 : 22
          }}
        >
          {stats.labels.map((label, i) => (
            <Jiggleable
              key={label}
              style={{
                padding: isDesktop ? '14px 8px' : '8px 6px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 6,
                textAlign: 'center',
                animation: `k-pop-in .4s cubic-bezier(.2,1.4,.4,1) ${i * 60}ms both`,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: isDesktop ? 10 : 8,
                  color: theme.accent,
                  letterSpacing: 1.5,
                  transition: 'color .6s ease'
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "'Anton', 'Bungee', sans-serif",
                  fontSize: isDesktop ? 36 : 22,
                  color: theme.fg,
                  lineHeight: 1,
                  marginTop: 2
                }}
              >
                {stats.values[i]}
              </div>
            </Jiggleable>
          ))}
        </div>
      </Reveal>
    </div>
  );

  if (isDesktop) {
    return (
      <section
        style={{
          position: 'relative',
          padding: '40px 64px 0',
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 60,
          alignItems: 'center'
        }}
      >
        {textPanel}
        {characterPanel}
      </section>
    );
  }
  return (
    <section
      style={{ position: 'relative', padding: isTablet ? '24px 32px 16px' : '8px 14px 16px' }}
    >
      {textPanel}
      {characterPanel}
    </section>
  );
};
