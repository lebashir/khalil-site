'use client';

import { useModeFlipContext, TopBarMode } from '@/components/topbar';
import { THEMES } from '@/components/arena/theme';
import { useArenaSize } from '@/components/arena/useArenaSize';
import { SceneBackground } from '@/components/arena/bg/SceneBackground';
import { setIntroSeenCookie } from '@/lib/intro-cookie';

// Placeholder intro page. Sets the first-visit cookie on completion and
// hard-navigates to / so the server re-renders with the cookie present.
// Step 5 replaces the static "ENTER" affordance with the scroll-driven
// tunnel — the cookie-set + navigate handshake stays the same.
export const IntroShell = () => {
  const { mode } = useModeFlipContext();
  const size = useArenaSize();
  const theme = THEMES[mode];
  const isDesktop = size === 'desktop';
  const isTablet = size === 'tablet';

  const onEnter = () => {
    setIntroSeenCookie();
    // Hard navigate so the server re-evaluates the gate with the cookie
    // present, instead of relying on the client router cache.
    window.location.href = '/';
  };

  const titleA = isDesktop ? 200 : isTablet ? 140 : 80;
  const titleB = isDesktop ? 160 : isTablet ? 112 : 64;

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden', background: '#000' }}>
      <SceneBackground mode={mode} theme={theme} size={size} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopBarMode />

        <main
          style={{
            minHeight: 'calc(100dvh - 92px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isDesktop ? '40px 64px' : '24px 18px',
            textAlign: 'center'
          }}
        >
          {/* HUD-style first-visit caption */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
              animation: 'k-stamp-in .6s cubic-bezier(.2,1.2,.4,1) both'
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: theme.accent,
                boxShadow: `0 0 10px ${theme.accent}`,
                animation: 'tb-blink-led 2.6s ease-in-out infinite'
              }}
              aria-hidden
            />
            <span
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: isDesktop ? 13 : 11,
                letterSpacing: 3,
                color: theme.accent,
                textTransform: 'uppercase'
              }}
            >
              GATE 01 · FIRST VISIT
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              margin: 0,
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: titleA,
              lineHeight: 0.86,
              letterSpacing: -1,
              color: theme.fg,
              textShadow: `0 0 32px ${theme.accent}60, 0 4px 24px rgba(0,0,0,0.6)`,
              animation: 'k-stamp-in .65s cubic-bezier(.2,1.2,.4,1) .15s both'
            }}
          >
            {theme.titleA}
          </h1>
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
              animation: 'k-stamp-in .7s cubic-bezier(.2,1.2,.4,1) .3s both'
            }}
          >
            {theme.titleB}
          </h1>

          {/* Tagline */}
          <p
            style={{
              maxWidth: 520,
              margin: isDesktop ? '28px 0 36px' : '18px 0 24px',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: isDesktop ? 18 : 15,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.82)',
              animation: 'k-stamp-in .6s cubic-bezier(.2,1.2,.4,1) .45s both'
            }}
          >
            ten years old. mostly fortnite. occasionally a striker.<br />
            tap in.
          </p>

          {/* ENTER cta */}
          <button
            type="button"
            onClick={onEnter}
            style={{
              position: 'relative',
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: isDesktop ? 26 : 20,
              letterSpacing: 1.5,
              color: mode === 'gaming' ? '#0a0420' : '#001233',
              background: `linear-gradient(180deg, ${theme.ctaA} 0%, ${theme.ctaB} 100%)`,
              padding: isDesktop ? '20px 38px' : '16px 28px',
              border: 'none',
              clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
              boxShadow: `0 0 32px ${theme.accent}60, 0 12px 28px rgba(0,0,0,0.5)`,
              cursor: 'pointer',
              transition: 'transform .25s cubic-bezier(.2,1.3,.4,1), box-shadow .25s ease',
              animation: 'k-stamp-in .7s cubic-bezier(.2,1.2,.4,1) .6s both'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            ▶ ENTER THE ARENA
          </button>

          {/* Placeholder footnote — replaced when the real tunnel ships */}
          <p
            style={{
              marginTop: 22,
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase'
            }}
          >
            scroll-through tunnel · v2.5
          </p>
        </main>
      </div>
    </div>
  );
};
