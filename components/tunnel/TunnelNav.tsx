import type { ArenaSize } from '@/components/arena/useArenaSize';
import type { TunnelTheme } from './theme';
import { SCENES } from './state';

interface Props {
  theme: TunnelTheme;
  size: ArenaSize;
  progress: number;
}

// Sticky in-stage nav: K-logo + current room name + progress dots.
export const TunnelNav = ({ theme, size, progress }: Props) => {
  const isPhone = size === 'phone';
  const isDesktop = size === 'desktop';

  // The latest scene whose start has been crossed.
  let current = SCENES[0]!;
  for (const s of SCENES) {
    if (progress >= s.start) current = s;
  }
  const idx = SCENES.findIndex((s) => s.id === current.id);

  return (
    <div
      style={{
        padding: isPhone ? '8px 12px 6px' : isDesktop ? '14px 40px' : '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isDesktop ? 38 : 28,
            height: isDesktop ? 38 : 28,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: theme.bgA,
            fontFamily: "'Anton', 'Bungee', sans-serif",
            fontSize: isDesktop ? 22 : 16,
            boxShadow: `0 0 16px ${theme.accent}88`
          }}
        >
          K
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Anton', 'Bungee', sans-serif",
              color: theme.fg,
              fontSize: isDesktop ? 20 : 14,
              letterSpacing: 1.5,
              lineHeight: 1
            }}
          >
            KHALIL
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              color: theme.accent,
              fontSize: isDesktop ? 10 : 8,
              letterSpacing: 1.5,
              marginTop: 2
            }}
          >
            ROOM {idx + 1} / {SCENES.length} · {current.id.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {SCENES.map((s) => {
          const active = progress >= s.lockStart && progress <= s.lockEnd;
          const passed = progress > s.lockEnd;
          return (
            <div
              key={s.id}
              style={{
                width: active ? (isPhone ? 18 : 28) : isPhone ? 6 : 10,
                height: 4,
                borderRadius: 2,
                background: active
                  ? theme.accent
                  : passed
                    ? `${theme.accent}60`
                    : `${theme.accent}20`,
                boxShadow: active ? `0 0 8px ${theme.accent}` : 'none',
                transition: 'width .3s, background .3s, box-shadow .3s'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
