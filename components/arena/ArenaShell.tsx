'use client';

import { useEffect, useState } from 'react';
import type { Mode, SiteContent } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import type { ChannelStats } from '@/lib/youtube-channel';
import { useModeFlipContext } from '@/components/topbar';
import { TopBarMode, PEEK_EVENT, type PeekDetail } from '@/components/topbar';
import { useGamingTheme } from '@/components/GamingThemeProvider';
import { startStadiumAmbient, stopStadiumAmbient } from '@/lib/audio/sounds';
import { getArenaTheme } from './theme';
import { useArenaSize } from './useArenaSize';
import { SceneBackground } from './bg/SceneBackground';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { SubsHud } from './SubsHud';
import { NowDock } from './NowDock';
import { Videos } from './Videos';
import { Bangers } from './Bangers';
import { About } from './About';
import { Book } from './Book';
import { Foot } from './Foot';
import { AnnouncementOverlay } from '@/components/announcement/AnnouncementOverlay';

interface Props {
  content: SiteContent;
  videos: VideoItem[];
  videoError: string | null;
  channelStats: ChannelStats | null;
}

// The full Arena composition. Mode is sourced from <ModeFlipProvider>
// (mounted in app/layout.tsx) so the homepage and the cinematic flip
// agree on the current mode. Re-renders when the mode swaps at t=400ms
// behind the overlay slab.
export const ArenaShell = ({ content, videos, videoError, channelStats }: Props) => {
  const { mode, isTransitioning } = useModeFlipContext();
  const { themeKey } = useGamingTheme();
  const size = useArenaSize();
  const theme = getArenaTheme(mode, themeKey);

  // §8 — mode-peek hover preview. Hovering the IDLE half of TopBarMode
  // dispatches a 'khalil:peek' event with the would-be-target mode. We
  // render a soft accent wash from the top so the page hints at what
  // the other mode would look like, then clear when pointer leaves.
  const [peekMode, setPeekMode] = useState<Mode | null>(null);
  useEffect(() => {
    const onPeek = (e: Event) => {
      const detail = (e as CustomEvent<PeekDetail>).detail;
      setPeekMode(detail?.mode ?? null);
    };
    window.addEventListener(PEEK_EVENT, onPeek);
    return () => window.removeEventListener(PEEK_EVENT, onPeek);
  }, []);
  // Don't paint while a flip is in flight, and never peek the active
  // mode against itself (would just be a no-op wash on the current
  // accent color).
  const peekActive = peekMode !== null && peekMode !== mode && !isTransitioning;
  const peekTheme = peekActive && peekMode ? getArenaTheme(peekMode, themeKey) : null;

  // Stadium crowd ambient — only when football mode is active on the
  // homepage. Fades in/out smoothly on mode flip; stops on unmount so
  // it doesn't follow the user into /edit or /intro.
  useEffect(() => {
    if (mode === 'football') {
      startStadiumAmbient();
    } else {
      stopStadiumAmbient();
    }
    return () => stopStadiumAmbient();
  }, [mode]);

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden', background: '#000' }}>
      <SceneBackground mode={mode} theme={theme} size={size} />

      <div style={{ position: 'relative' }}>
        <TopBarMode />
        <Nav theme={theme} size={size} mood={content.mood} />
        <Hero mode={mode} theme={theme} size={size} content={content} videos={videos} channelStats={channelStats} />
        <SubsHud subs={content.subs} theme={theme} size={size} />
        <NowDock mode={mode} now={content.now} theme={theme} size={size} />
        <Videos
          mode={mode}
          theme={theme}
          size={size}
          videos={videos}
          editorial={content.videos}
          images={content.images}
          error={videoError}
        />
        <Bangers songs={content.songs} theme={theme} size={size} />
        <About paragraphs={content.about} theme={theme} size={size} />
        <Book
          book={content.book}
          theme={theme}
          size={size}
          coverPhotoUrl={content.images['book-cover'] ?? null}
        />
        <Foot theme={theme} size={size} socials={content.socials} />
      </div>

      {/* §8 — mode-peek overlay. Painted only while the user hovers
          the idle topbar half (and the active mode differs from the
          peek target). pointer-events: none so it never intercepts
          clicks; mix-blend-mode: screen layers it like a sweep light
          on top of the page. */}
      {peekTheme && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60vh',
            pointerEvents: 'none',
            zIndex: 70,
            mixBlendMode: 'screen',
            background: `linear-gradient(180deg, ${peekTheme.accent}55 0%, ${peekTheme.accent}22 40%, transparent 100%)`,
            opacity: 0.85,
            transition: 'opacity .25s ease',
            animation: 'k-peek-in .22s ease-out both'
          }}
        />
      )}

      {/* Site-wide announcement overlay — polls /api/announcement every
          ~3s and pops a fullscreen burst when Khalil fires the plunger
          from /edit. */}
      <AnnouncementOverlay />
    </div>
  );
};
