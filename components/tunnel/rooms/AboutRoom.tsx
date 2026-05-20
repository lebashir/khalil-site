import type { ArenaSize } from '@/components/arena/useArenaSize';
import type { TunnelTheme } from '../theme';
import { SceneTag } from './SceneTag';
import { renderBold } from '@/lib/bold';

interface Props {
  theme: TunnelTheme;
  lockT: number;
  size: ArenaSize;
  paragraphs: string[];
}

export const AboutRoom = ({ theme, lockT, size, paragraphs }: Props) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 800 : size === 'tablet' ? 660 : 380;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        padding: isDesktop ? 32 : 18,
        background: 'rgba(0,0,0,0.45)',
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 16,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: `0 0 60px ${theme.accent}33, inset 0 0 30px rgba(0,0,0,0.4)`
      }}
    >
      <SceneTag label="03 · ABOUT" theme={theme} />
      <div
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: isDesktop ? 12 : 10,
          color: theme.accent,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          opacity: lockT
        }}
      >
        § ABOUT.SYS
      </div>
      <h2
        style={{
          margin: '6px 0 14px',
          fontFamily: "'Anton', 'Bungee', sans-serif",
          fontSize: isDesktop ? 64 : 38,
          color: theme.fg,
          lineHeight: 0.95,
          letterSpacing: -1,
          transform: `translateY(${(1 - lockT) * 18}px)`,
          opacity: lockT
        }}
      >
        PROFILE.<span style={{ color: theme.accent }}>DAT</span>
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr',
          gap: isDesktop ? 24 : 14,
          alignItems: 'start'
        }}
      >
        <div>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: isDesktop ? 16 : 13,
                lineHeight: 1.55,
                color: i === 0 ? theme.fg : 'rgba(255,255,255,0.78)',
                fontWeight: i === 0 ? 700 : 400,
                margin: '0 0 10px',
                transform: `translateY(${(1 - lockT) * (12 + i * 8)}px)`,
                opacity: lockT
              }}
            >
              {renderBold(p)}
            </p>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {theme.chip.map((c, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.55)',
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 6,
                transform: `translateX(${(1 - lockT) * 30}px)`,
                opacity: lockT
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 10,
                  color: theme.accent,
                  letterSpacing: 1.5
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontFamily: "'Anton', 'Bungee', sans-serif",
                  fontSize: isDesktop ? 18 : 14,
                  color: theme.fg,
                  lineHeight: 1.1,
                  marginTop: 2
                }}
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
