import type { Mode, SiteContent } from '@/lib/content';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import type { TunnelTheme } from '../theme';
import { SceneTag } from './SceneTag';

interface Props {
  mode: Mode;
  theme: TunnelTheme;
  lockT: number;
  size: ArenaSize;
  subs: SiteContent['subs'];
}

export const HeroRoom = ({ mode, theme, lockT, size, subs }: Props) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 760 : size === 'tablet' ? 640 : 360;
  const titleSize = isDesktop ? 140 : size === 'tablet' ? 110 : 64;

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        padding: isDesktop ? 36 : 18,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 16,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: `0 0 60px ${theme.accent}33, inset 0 0 30px rgba(0,0,0,0.4)`
      }}
    >
      <SceneTag label="01 · ENTER" theme={theme} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: isDesktop ? 14 : 8,
          opacity: lockT
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: theme.accent,
            boxShadow: `0 0 8px ${theme.accent}`
          }}
        />
        <span
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: isDesktop ? 13 : 10,
            color: theme.accent,
            letterSpacing: 2.5
          }}
        >
          {theme.role}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: isDesktop ? 28 : 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Anton', 'Bungee', sans-serif",
              color: theme.fg,
              fontSize: titleSize,
              lineHeight: 0.85,
              letterSpacing: -2,
              textShadow: `0 0 32px ${theme.accent}66`,
              transform: `translateY(${(1 - lockT) * 30}px)`,
              opacity: lockT
            }}
          >
            {theme.titleA}
          </h1>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: titleSize,
              lineHeight: 0.85,
              letterSpacing: -2,
              backgroundImage: `linear-gradient(180deg, ${theme.accent}, ${theme.accent2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 18px ${theme.accent}80)`,
              transform: `translateY(${(1 - lockT) * 60}px)`,
              opacity: lockT
            }}
          >
            {theme.titleB}
          </h1>
        </div>
        {isDesktop && (
          <div
            style={{
              width: 200,
              height: 200,
              flexShrink: 0,
              borderRadius: '50%',
              background:
                mode === 'gaming'
                  ? 'conic-gradient(from 180deg at 50% 50%, #00f0ff, #b026ff, #ff2bd6, #ffe600, #00f0ff)'
                  : 'conic-gradient(from 180deg at 50% 50%, #ffd700, #fff, #4d8fff, #fff, #ffd700)',
              position: 'relative',
              boxShadow: `0 0 60px ${theme.accent}88, 0 16px 32px rgba(0,0,0,0.6)`,
              transform: `scale(${lockT})`,
              opacity: lockT
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '6%',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 30% 25%, rgba(0,0,0,0.85), rgba(0,0,0,0.55))'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Anton', 'Bungee', sans-serif",
                fontSize: 140,
                color: theme.fg,
                textShadow: `0 0 24px ${theme.accent}`
              }}
            >
              7
            </div>
          </div>
        )}
      </div>

      {/* Sub counter HUD */}
      <div
        style={{
          marginTop: isDesktop ? 18 : 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isDesktop ? '12px 16px' : '8px 12px',
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 6,
          opacity: lockT,
          transform: `translateY(${(1 - lockT) * 20}px)`
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              color: theme.accent,
              letterSpacing: 2
            }}
          >
            SUBS · {subs.goal} GOAL
          </div>
          <div
            style={{
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: isDesktop ? 42 : 26,
              color: theme.fg,
              lineHeight: 1,
              letterSpacing: -1
            }}
          >
            {subs.current}
            <span
              style={{
                fontSize: isDesktop ? 16 : 12,
                color: theme.accent,
                marginLeft: 6
              }}
            >
              / {subs.goal}
            </span>
          </div>
        </div>
        <div
          style={{
            padding: isDesktop ? '10px 18px' : '6px 12px',
            background: `linear-gradient(180deg, ${theme.accent}, ${theme.accent2})`,
            color: theme.bgA,
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: isDesktop ? 16 : 12,
            letterSpacing: 2,
            clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)'
          }}
        >
          ● ONLINE
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: isDesktop ? 11 : 9,
          color: theme.accent,
          letterSpacing: 2,
          textAlign: 'center',
          opacity: lockT * 0.7
        }}
      >
        ↓ KEEP WALKING — REPLAYS AHEAD
      </div>
    </div>
  );
};
