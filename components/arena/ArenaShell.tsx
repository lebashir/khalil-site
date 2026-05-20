'use client';

import type { SiteContent } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import { useModeFlipContext } from '@/components/topbar';
import { TopBarMode } from '@/components/topbar';
import { THEMES } from './theme';
import { useArenaSize } from './useArenaSize';
import { SceneBackground } from './bg/SceneBackground';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { SubsHud } from './SubsHud';
import { NowDock } from './NowDock';
import { Videos } from './Videos';
import { About } from './About';
import { Book } from './Book';
import { Foot } from './Foot';

interface Props {
  content: SiteContent;
  videos: VideoItem[];
  videoError: string | null;
}

// The full Arena composition. Mode is sourced from <ModeFlipProvider>
// (mounted in app/layout.tsx) so the homepage and the cinematic flip
// agree on the current mode. Re-renders when the mode swaps at t=400ms
// behind the overlay slab.
export const ArenaShell = ({ content, videos, videoError }: Props) => {
  const { mode } = useModeFlipContext();
  const size = useArenaSize();
  const theme = THEMES[mode];

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden', background: '#000' }}>
      <SceneBackground mode={mode} theme={theme} size={size} />

      <div style={{ position: 'relative' }}>
        <TopBarMode />
        <Nav theme={theme} size={size} mood={content.mood} />
        <Hero mode={mode} theme={theme} size={size} content={content} />
        <SubsHud subs={content.subs} theme={theme} size={size} />
        <NowDock mode={mode} now={content.now} theme={theme} size={size} />
        <Videos mode={mode} theme={theme} size={size} videos={videos} editorial={content.videos} error={videoError} />
        <About paragraphs={content.about} theme={theme} size={size} />
        <Book book={content.book} theme={theme} size={size} />
        <Foot theme={theme} size={size} socials={content.socials} />
      </div>
    </div>
  );
};
