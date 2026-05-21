'use client';

import type { Mode, SiteContent } from '@/lib/content';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import type { TunnelTheme } from '../theme';
import { SceneTag } from './SceneTag';
import { setIntroSeenCookie } from '@/lib/intro-cookie';
import { stopIntroHum } from '@/lib/audio/sounds';

interface Props {
  mode: Mode;
  theme: TunnelTheme;
  lockT: number;
  size: ArenaSize;
  subs: SiteContent['subs'];
  socials: SiteContent['socials'];
}

const YT_URL = 'https://www.youtube.com/@khalilgaming2020';

// Mode-specific destination scene rendered inside the room.
const GamingDest = ({ theme, isDesktop }: { theme: TunnelTheme; isDesktop: boolean }) => (
  <>
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 240,
        height: 240,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.glow} 0%, transparent 60%)`,
        filter: 'blur(8px)'
      }}
    />
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: isDesktop ? 220 : 160,
        height: isDesktop ? 130 : 90,
        borderRadius: 6,
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
        boxShadow: `0 0 50px ${theme.accent}, inset 0 0 20px rgba(0,0,0,0.3)`
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 4,
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 3
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 10,
          color: '#fff',
          textShadow: '0 0 6px rgba(0,0,0,0.6)'
        }}
      >
        ● LIVE
      </div>
    </div>
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '8%',
        width: '70%',
        height: 4,
        background: '#000',
        transform: 'translateX(-50%)',
        boxShadow: `0 -2px 12px ${theme.accent}50`
      }}
    />
  </>
);

const FootballDest = ({ theme, isDesktop }: { theme: TunnelTheme; isDesktop: boolean }) => {
  const patternId = `tn-net-${isDesktop ? 'd' : 'm'}`;
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 220,
          height: 220,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, ${theme.glow} 30%, transparent 70%)`,
          filter: 'blur(6px)'
        }}
      />
      <svg
        viewBox="0 0 400 200"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          width: '60%',
          height: '70%',
          transform: 'translateX(-50%)'
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 0 L 8 8 M 0 8 L 8 0" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect x="80" y="40" width="240" height="150" fill={`url(#${patternId})`} />
        <rect x="78" y="38" width="244" height="5" fill="#fff" />
        <rect x="78" y="38" width="5" height="153" fill="#fff" />
        <rect x="317" y="38" width="5" height="153" fill="#fff" />
      </svg>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '30%',
          background: 'linear-gradient(180deg, transparent, rgba(10,74,42,0.7))'
        }}
      />
    </>
  );
};

// Destination room. The big primary button completes the intro: sets the
// gate cookie + hard-navigates to /. Secondary link goes to the actual
// YouTube channel for subscribing.
export const SubscribeRoom = ({ mode, theme, lockT, size, subs, socials }: Props) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 900 : size === 'tablet' ? 700 : 400;
  const subsLeft = Math.max(0, subs.goal - subs.current);

  const onEnter = () => {
    // Stop the ambient hum BEFORE navigation. TunnelShell's pagehide
    // listener does this too, but on Safari the bfcache can capture the
    // page before either pagehide or React cleanup runs reliably. Calling
    // it here guarantees the oscillators are disconnected first.
    stopIntroHum();
    setIntroSeenCookie();
    window.location.href = '/';
  };

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        padding: isDesktop ? 40 : 22,
        background: 'rgba(0,0,0,0.55)',
        border: `2px solid ${theme.accent}`,
        borderRadius: 18,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: `0 0 100px ${theme.accent}, inset 0 0 60px rgba(0,0,0,0.6)`,
        textAlign: 'center'
      }}
    >
      <SceneTag label="05 · DESTINATION" theme={theme} />

      <div
        style={{
          position: 'relative',
          height: isDesktop ? 200 : 130,
          marginBottom: isDesktop ? 24 : 14,
          background:
            mode === 'gaming'
              ? `radial-gradient(ellipse at 50% 50%, ${theme.bgMid} 0%, ${theme.bgDeep} 80%)`
              : `linear-gradient(180deg, ${theme.bgFar} 0%, #2d8a4a 100%)`,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${theme.cardBorder}`,
          opacity: lockT
        }}
      >
        {mode === 'gaming' ? (
          <GamingDest theme={theme} isDesktop={isDesktop} />
        ) : (
          <FootballDest theme={theme} isDesktop={isDesktop} />
        )}
      </div>

      <div
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: isDesktop ? 12 : 10,
          color: theme.accent,
          letterSpacing: 3,
          opacity: lockT
        }}
      >
        ▸ {theme.destLabel}
      </div>

      <h2
        style={{
          margin: '8px 0 6px',
          fontFamily: "'Anton', 'Bungee', sans-serif",
          fontSize: isDesktop ? 84 : 48,
          color: theme.fg,
          lineHeight: 0.9,
          letterSpacing: -1,
          transform: `translateY(${(1 - lockT) * 24}px)`,
          opacity: lockT
        }}
      >
        HIT
        <span
          style={{
            backgroundImage: `linear-gradient(180deg, ${theme.accent}, ${theme.accent2})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {' '}
          {subs.goal >= 1000 ? `${Math.round(subs.goal / 1000)}K` : subs.goal}
        </span>{' '}
        WITH ME
      </h2>

      <p
        style={{
          margin: '0 auto 20px',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: isDesktop ? 16 : 13,
          color: 'rgba(255,255,255,0.82)',
          maxWidth: 460,
          lineHeight: 1.5,
          opacity: lockT
        }}
      >
        {subsLeft} subs to go. if you read this far, you&apos;re already a real one. step inside.
      </p>

      <button
        type="button"
        onClick={onEnter}
        style={{
          fontFamily: "'Anton', 'Bungee', sans-serif",
          fontSize: isDesktop ? 28 : 20,
          letterSpacing: 2,
          color: theme.bgA,
          background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
          padding: isDesktop ? '20px 44px' : '14px 28px',
          border: 'none',
          clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
          boxShadow: `0 0 60px ${theme.accent}, 0 8px 24px rgba(0,0,0,0.5)`,
          cursor: 'pointer',
          transform: `scale(${0.9 + lockT * 0.1})`,
          opacity: lockT
        }}
      >
        ▶ ENTER THE ARENA
      </button>

      <div
        style={{
          marginTop: 14,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 10,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: 2,
          opacity: lockT
        }}
      >
        OR{' '}
        <a
          href={YT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.accent, textDecoration: 'none' }}
        >
          SUBSCRIBE ON YOUTUBE →
        </a>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          justifyContent: 'center',
          gap: isDesktop ? 16 : 8,
          opacity: lockT
        }}
      >
        {(
          [
            { label: 'YT', href: YT_URL },
            { label: 'TT', href: socials.tiktok || null },
            { label: 'IG', href: socials.instagram || null }
          ] as const
        ).map((s) =>
          s.href ? (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: isDesktop ? 40 : 30,
                height: isDesktop ? 40 : 30,
                borderRadius: 6,
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${theme.cardBorder}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Anton', 'Bungee', sans-serif",
                fontSize: isDesktop ? 14 : 11,
                color: theme.fg,
                letterSpacing: 1,
                textDecoration: 'none'
              }}
            >
              {s.label}
            </a>
          ) : (
            <span
              key={s.label}
              style={{
                width: isDesktop ? 40 : 30,
                height: isDesktop ? 40 : 30,
                borderRadius: 6,
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${theme.cardBorder}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Anton', 'Bungee', sans-serif",
                fontSize: isDesktop ? 14 : 11,
                color: theme.fg,
                letterSpacing: 1,
                opacity: 0.4
              }}
            >
              {s.label}
            </span>
          )
        )}
      </div>
    </div>
  );
};
