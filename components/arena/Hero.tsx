'use client';

import type { Mode, SiteContent, FloatingTagConfig, TagPosition } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import type { ChannelStats } from '@/lib/youtube-channel';
import type { VideoItem } from '@/lib/youtube';
import { formatCount } from '@/lib/youtube';
import { Reveal } from './Reveal';
import { PolaroidStack } from './PolaroidStack';
import { FloatingTag } from './FloatingTag';
import { Pressable, Jiggleable } from '@/components/fx';
import { themedBackdrop, themedFg } from '@/lib/gaming-themes';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  content: SiteContent;
  videos: VideoItem[];
  channelStats: ChannelStats | null;
}

// Resolves a floating tag's displayed value. Order of preference:
// 1. Live wired source (when channelStats / video data is present)
// 2. Manual override value (tag.manualValue)
// 3. Empty string → caller hides the slot
const resolveTagValue = (
  tag: FloatingTagConfig,
  channelStats: ChannelStats | null,
  content: SiteContent,
  videos: VideoItem[]
): string => {
  switch (tag.source) {
    case 'manual':
      return tag.manualValue;
    case 'subs': {
      const live = channelStats?.subscriberCount;
      if (typeof live === 'number') return formatCount(live);
      // Fall back to content.subs.current (the existing manual value) so
      // existing sites without an API key keep rendering 744.
      if (content.subs.current > 0) return formatCount(content.subs.current);
      return tag.manualValue;
    }
    case 'views': {
      const live = channelStats?.viewCount;
      if (typeof live === 'number') return formatCount(live);
      if (content.viewsManual > 0) return formatCount(content.viewsManual);
      return tag.manualValue;
    }
    case 'videos': {
      const live = channelStats?.videoCount;
      if (typeof live === 'number') return String(live);
      if (content.videosManual > 0) return String(content.videosManual);
      return tag.manualValue;
    }
    case 'pinnedLikes': {
      const pinned = videos.find(v => v.id === content.videos.pinnedId);
      const live = pinned?.likeCount;
      if (typeof live === 'number' && live > 0) return formatCount(live);
      return tag.manualValue;
    }
  }
};

// Maps a tag's logical position (corner) to the responsive style object
// FloatingTag expects. Mirrors the offsets used by the previous
// hardcoded SUBS and RANK tags so layouts don't shift.
const positionFor = (
  pos: TagPosition,
  isDesktop: boolean,
  isTablet: boolean
): { top?: number; right?: number; bottom?: number; left?: number } => {
  switch (pos) {
    case 'tr':
      return {
        right: isDesktop ? -16 : isTablet ? 24 : 8,
        top: isDesktop ? 28 : isTablet ? 16 : 4
      };
    case 'tl':
      return {
        left: isDesktop ? -16 : isTablet ? 24 : 8,
        top: isDesktop ? 28 : isTablet ? 16 : 4
      };
    case 'br':
      return {
        right: isDesktop ? -16 : isTablet ? 24 : 8,
        bottom: isDesktop ? 70 : isTablet ? 30 : 14
      };
    case 'bl':
      return {
        left: isDesktop ? -16 : isTablet ? 24 : 8,
        bottom: isDesktop ? 70 : isTablet ? 30 : 14
      };
  }
};

const delayFor = (pos: TagPosition): string => {
  switch (pos) {
    case 'tr': return '0s';
    case 'tl': return '.4s';
    case 'br': return '.6s';
    case 'bl': return '.8s';
  }
};

const YT_URL = 'https://www.youtube.com/@khalilgaming2020';

export const Hero = ({ mode, theme, size, content, videos, channelStats }: Props) => {
  const m = content.hero[mode];
  const stats = content.stats[mode];
  const isDesktop = size === 'desktop';
  const isTablet = size === 'tablet';

  const titleA = isDesktop ? 200 : isTablet ? 140 : 80;
  const titleB = isDesktop ? 160 : isTablet ? 112 : 64;
  const bioSize = isDesktop ? 20 : isTablet ? 17 : 14;

  const portraitPhotoUrl = content.images[`portrait-${mode}`] ?? null;

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
      <PolaroidStack
        mode={mode}
        theme={theme}
        size={size}
        portraitPhotoUrl={portraitPhotoUrl}
      />

      {content.floatingTags
        .filter(tag => tag.enabled)
        .map(tag => {
          const value = resolveTagValue(tag, channelStats, content, videos);
          if (!value) return null;
          return (
            <FloatingTag
              key={tag.position}
              label={tag.label}
              value={value}
              theme={theme}
              position={positionFor(tag.position, isDesktop, isTablet)}
              delay={delayFor(tag.position)}
            />
          );
        })}
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
            color: themedFg(theme.fg, 0.85),
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
              color: theme.ctaText,
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
                background: themedBackdrop(theme.fg, 0.4),
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
