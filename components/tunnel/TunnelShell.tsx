'use client';

import { useEffect, useRef } from 'react';
import type { SiteContent } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import { TopBarMode, useModeFlipContext } from '@/components/topbar';
import { useGamingTheme } from '@/components/GamingThemeProvider';
import { useArenaSize } from '@/components/arena/useArenaSize';
import { setIntroSeenCookie } from '@/lib/intro-cookie';
import {
  playEnterChime,
  playRoomEngage,
  startIntroHum,
  stopIntroHum
} from '@/lib/audio/sounds';
import { getTunnelTheme } from './theme';
import { SCENES, sceneState } from './state';
import { useTunnelAutoWalk } from './useTunnelAutoWalk';
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

// The full tunnel composition. As of the auto-walk rewrite the page no
// longer scrolls — the camera drives itself through the 5 rooms via
// useTunnelAutoWalk, dwelling at each long enough to read, then walking
// on to the next. Visitors can tap (or scroll, or swipe) to fast-forward
// to the next room; the SKIP INTRO link in the topbar area bails out
// straight to /. The final SubscribeRoom holds indefinitely — its ENTER
// button is the only way out from there.
export const TunnelShell = ({ content, videos }: Props) => {
  const { mode } = useModeFlipContext();
  const { themeKey } = useGamingTheme();
  const size = useArenaSize();
  const theme = getTunnelTheme(mode, themeKey);
  const { progress, phase, sceneIndex, advance } = useTunnelAutoWalk();

  const isLastScene = sceneIndex === SCENES.length - 1;
  const isDwelling = phase === 'dwelling';
  const isDone = phase === 'done';
  // The "tap to continue" pill is meaningless on the final room (the
  // ENTER button is the action there) and once we're past the last
  // dwell (no more advances possible).
  const showTapPill = isDwelling && !isLastScene;

  // ── Body scroll lock ────────────────────────────────────────────────────
  //
  // Auto-walk owns progress now; the page must not scroll under the
  // visitor. We toggle overflow-hidden on html+body for the lifetime of
  // the intro and restore on unmount. Touch-action: none also stops iOS
  // rubber-band from twitching the layout.
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.body.style.touchAction = prevTouch;
    };
  }, []);

  // ── Audio: ambient hum + scene-engage thunks + ENTER chime ──────────────
  //
  // Hum starts on the first user gesture (browser autoplay policy). The
  // thunk + chime triggers are unchanged — they fire when `progress`
  // crosses scene.lockStart, which auto-walk does just like scroll did.
  useEffect(() => {
    let started = false;
    const onGesture = () => {
      if (started) return;
      started = true;
      startIntroHum();
      detachGesture();
    };
    const detachGesture = () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
    const onPageHide = () => {
      stopIntroHum();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopIntroHum();
    };

    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    window.addEventListener('touchstart', onGesture, { passive: true });
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      detachGesture();
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopIntroHum();
    };
  }, []);

  const lastEngagedRef = useRef(-1);
  useEffect(() => {
    let idx = -1;
    for (let i = 0; i < SCENES.length; i++) {
      const scene = SCENES[i];
      if (scene && progress >= scene.lockStart) idx = i;
      else break;
    }
    if (idx > lastEngagedRef.current) {
      for (let i = lastEngagedRef.current + 1; i <= idx; i++) {
        const scene = SCENES[i];
        if (!scene) continue;
        if (scene.id === 'subscribe') playEnterChime();
        else if (i > 0) playRoomEngage();
      }
      lastEngagedRef.current = idx;
    }
  }, [progress]);

  // ── Fast-forward triggers ───────────────────────────────────────────────
  //
  // Three input paths, all collapse to advance():
  //   • pointerdown (tap/click) anywhere except interactive ancestors —
  //     so the mode toggle, SKIP INTRO, ENTER button, and social links
  //     keep working as themselves; the empty corridor advances.
  //   • wheel (any direction) — power-user scroll-as-fast-forward.
  //   • keyboard — ↓ / → / space / enter / PageDown — accessibility
  //     parity with tap.
  useEffect(() => {
    if (isDone) return;
    const INTERACTIVE_SELECTOR =
      'button, a, [role="button"], [role="tab"], [role="tablist"], input, textarea, select';
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) return;
      advance();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      advance();
    };
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowRight' ||
        e.key === ' ' ||
        e.key === 'Enter' ||
        e.key === 'PageDown'
      ) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [advance, isDone]);

  // ── Skip intro — bail straight to / ─────────────────────────────────────
  const onSkip = () => {
    stopIntroHum();
    setIntroSeenCookie();
    window.location.href = '/';
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        background: theme.bgDeep,
        transition: 'background .6s ease'
      }}
    >
      {/* Sticky-position is no longer needed — there's nothing to scroll. */}
      <div style={{ position: 'relative', zIndex: 80 }}>
        <TopBarMode />
      </div>

      <div
        style={{
          position: 'relative',
          height: 'calc(100dvh - var(--tunnel-topbar-h, 68px))',
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

        {/* Layer 3 — 5 rooms. Interactive content (ENTER button, etc.)
            sits inside Room which has its own z-index above the click
            shield, so clicks on rooms reach the room. */}
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

        {/* Layer 4 — top nav (scene tag + room dots) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 70 }}>
          <TunnelNav theme={theme} size={size} progress={progress} />
        </div>

        {/* Skip-intro link — small dim affordance in the top-right of
            the stage. Sits above the click shield. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 14,
            zIndex: 72,
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${theme.accent}66`,
            borderRadius: 999,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: 1.6,
            color: theme.accent,
            cursor: 'pointer',
            textTransform: 'uppercase',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          ▶ SKIP INTRO →
        </button>

        {/* "Tap to continue" pill — surfaces during dwell so visitors
            know they CAN tap to skip the wait. Not shown on the final
            room (the ENTER button is the action there) or during a
            walk (would be confusing). Subtle bob animation hints at
            interactivity without being shouty. */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: showTapPill ? 1 : 0,
            transition: 'opacity .35s ease',
            pointerEvents: 'none',
            zIndex: 66
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.65)',
              border: `1px solid ${theme.accent}`,
              borderRadius: 999,
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: size === 'desktop' ? 11 : 10,
              color: theme.accent,
              letterSpacing: 2,
              boxShadow: `0 0 18px ${theme.accent}55`,
              textTransform: 'uppercase',
              animation: 'k-bob-s 1.6s ease-in-out infinite',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          >
            ▶ TAP TO CONTINUE
          </div>
        </div>
      </div>
    </div>
  );
};
