import type { SiteContent } from '@/lib/content';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import type { TunnelTheme } from '../theme';
import { SceneTag } from './SceneTag';

interface Props {
  theme: TunnelTheme;
  lockT: number;
  size: ArenaSize;
  book: SiteContent['book'];
}

export const BookRoom = ({ theme, lockT, size, book }: Props) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 760 : size === 'tablet' ? 620 : 380;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        padding: isDesktop ? 36 : 18,
        background: 'rgba(0,0,0,0.5)',
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 16,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: `0 0 60px ${theme.accent}40, inset 0 0 40px rgba(0,0,0,0.5)`
      }}
    >
      <SceneTag label="04 · BOOK" theme={theme} />
      <div style={{ display: 'flex', gap: isDesktop ? 32 : 14, alignItems: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: isDesktop ? 200 : 100,
            height: isDesktop ? 270 : 138,
            flexShrink: 0,
            borderRadius: '2px 10px 10px 2px',
            background: `linear-gradient(135deg, ${theme.bgMid} 0%, ${theme.bgDeep} 100%)`,
            boxShadow: `-12px 14px 40px rgba(0,0,0,0.7), inset 4px 0 0 rgba(0,0,0,0.5), 0 0 50px ${theme.accent}66`,
            padding: isDesktop ? 20 : 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: `rotate(-5deg) scale(${0.85 + lockT * 0.15}) translateY(${(1 - lockT) * 18}px)`,
            opacity: lockT
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: isDesktop ? 11 : 8,
              color: theme.accent,
              letterSpacing: 2
            }}
          >
            VOL.1
          </div>
          <div
            style={{
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: isDesktop ? 30 : 16,
              color: '#fff',
              lineHeight: 0.95,
              textTransform: 'uppercase'
            }}
          >
            {book.title}
          </div>
          {/* Spotlight beam */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: -120,
              width: 200,
              height: 200,
              transform: 'translateX(-50%)',
              background: `radial-gradient(circle, ${theme.accent}88 0%, transparent 70%)`,
              opacity: lockT * 0.5,
              filter: 'blur(8px)'
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: isDesktop ? 12 : 10,
              color: theme.accent,
              letterSpacing: 2.5,
              opacity: lockT
            }}
          >
            UNLOCK · BOOK
          </div>
          <h3
            style={{
              margin: '6px 0 10px',
              fontFamily: "'Anton', 'Bungee', sans-serif",
              fontSize: isDesktop ? 56 : 30,
              color: theme.fg,
              lineHeight: 0.95,
              transform: `translateY(${(1 - lockT) * 18}px)`,
              opacity: lockT
            }}
          >
            WRITING
            <br />
            <span style={{ color: theme.accent }}>A BOOK</span>
          </h3>
          <p
            style={{
              margin: 0,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: isDesktop ? 17 : 13,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.45,
              opacity: lockT
            }}
          >
            {book.subtitle}
          </p>
          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexDirection: isDesktop ? 'row' : 'column',
              gap: isDesktop ? 16 : 4,
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: isDesktop ? 12 : 10,
              letterSpacing: 1,
              color: theme.accent,
              opacity: lockT
            }}
          >
            <span>▸ {book.chapter.toUpperCase()}</span>
            <span>▸ {book.status.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
