'use client';

import type { SiteContent } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import { TopBarMode, useModeFlipContext } from '@/components/topbar';
import { useArenaSize } from '@/components/arena/useArenaSize';
import { TUNNEL_THEMES } from './theme';
import { SCENES, sceneState, clamp } from './state';
import { useTunnelScroll } from './useTunnelScroll';
import { TunnelBG } from './TunnelBG';
import { TunnelWalls } from './TunnelWalls';
import { TunnelNav } from './TunnelNav';
import { Room } from './Room';
import { HeroRoom } from './rooms/HeroRoom';
import { ReplaysRoom } from './rooms/ReplaysRoom';
import { AboutRoom } from './rooms/AboutRoom';
import { BookRoom } from './rooms/BookRoom';
import { SubscribeRoom } from './rooms/SubscribeRoom';

interface Props {
  content: SiteContent;
  videos: VideoItem[];
}

// The full tunnel composition. Wrapper is 5× the viewport height; sticky
// inner stage pins the corridor in place. As the user scrolls past, each
// scene approaches → locks → exits, with the next scene already fading in
// behind it. SubscribeRoom's ENTER button completes the intro (sets the
// cookie and hard-navigates to /).
export const TunnelShell = ({ content, videos }: Props) => {
  const { mode } = useModeFlipContext();
  const size = useArenaSize();
  const theme = TUNNEL_THEMES[mode];
  const { ref, progress } = useTunnelScroll();

  // Heights live in CSS so SSR + CSR render identically (avoids the
  // hydration mismatch you get when reading window.innerHeight on the
  // client only). dvh tracks the actual visible viewport on mobile so
  // the sticky stage fills exactly what the user can see; the wrapper
  // takes 5× that for a comfortable scroll budget across the 5 rooms.
  const trackHeight = '500dvh';
  const stageHeight = '100dvh';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        background: theme.bgDeep,
        transition: 'background .6s ease'
      }}
    >
      {/* Full-width mode toggle — stays visible while walking. */}
      <div style={{ position: 'sticky', top: 0, zIndex: 80 }}>
        <TopBarMode />
      </div>

      <div ref={ref} style={{ position: 'relative', height: trackHeight }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: stageHeight,
            overflow: 'hidden'
          }}
        >
          {/* Layer 1 — corridor background */}
          <TunnelBG mode={mode} theme={theme} progress={progress} size={size} />

          {/* Layer 2 — ambient wall thumbnails */}
          <TunnelWalls
            theme={theme}
            progress={progress}
            size={size}
            designThumbs={content.videos.designThumbs}
          />

          {/* Layer 3 — 5 rooms */}
          {SCENES.map((scene) => {
            const state = sceneState(scene, progress);
            if (!state) return null;
            return (
              <Room key={scene.id} depth={state.depth} opacity={state.opacity}>
                {scene.id === 'hero' && (
                  <HeroRoom
                    mode={mode}
                    theme={theme}
                    lockT={state.lockT}
                    size={size}
                    subs={content.subs}
                  />
                )}
                {scene.id === 'replays' && (
                  <ReplaysRoom theme={theme} lockT={state.lockT} size={size} videos={videos} />
                )}
                {scene.id === 'about' && (
                  <AboutRoom
                    theme={theme}
                    lockT={state.lockT}
                    size={size}
                    paragraphs={content.about}
                  />
                )}
                {scene.id === 'book' && (
                  <BookRoom theme={theme} lockT={state.lockT} size={size} book={content.book} />
                )}
                {scene.id === 'subscribe' && (
                  <SubscribeRoom
                    mode={mode}
                    theme={theme}
                    lockT={state.lockT}
                    size={size}
                    subs={content.subs}
                    socials={content.socials}
                  />
                )}
              </Room>
            );
          })}

          {/* Layer 4 — sticky nav inside the stage */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 70 }}>
            <TunnelNav theme={theme} size={size} progress={progress} />
          </div>

          {/* Layer 5 — bottom scroll cue (fades out as we reach destination) */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              opacity: clamp((0.93 - progress) * 6, 0, 1),
              pointerEvents: 'none',
              zIndex: 65
            }}
          >
            <div
              style={{
                padding: '6px 14px',
                background: 'rgba(0,0,0,0.55)',
                border: `1px solid ${theme.accent}`,
                borderRadius: 999,
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: size === 'desktop' ? 12 : 10,
                color: theme.accent,
                letterSpacing: 2,
                animation: 'k-bob-s 1.6s ease-in-out infinite'
              }}
            >
              ↓ KEEP WALKING
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
