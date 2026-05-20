import type { ArenaTheme } from '../theme';
import type { ArenaSize } from '../useArenaSize';

interface Props {
  theme: ArenaTheme;
  size: ArenaSize;
}

// Stadium night scene. Linear bg gradient (sky → pitch), two floodlight
// cones, a crowd ribbon at the mid-line, faint pitch stripes at the
// bottom, and confetti falling from above.
export const FootballBG = ({ theme, size }: Props) => {
  const gradId = `cone1-${size}`;
  const gradId2 = `cone2-${size}`;
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${theme.sceneBgA} 0%, ${theme.sceneBgB} 35%, #0e2a55 65%, ${theme.sceneBgC} 100%)`,
          transition: 'background .8s ease'
        }}
      />
      <svg
        viewBox="0 0 400 800"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={gradId2} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="60,0 -80,800 200,800" fill={`url(#${gradId})`} />
        <polygon points="340,0 480,800 200,800" fill={`url(#${gradId2})`} />
        <polygon points="200,0 100,800 300,800" fill={`url(#${gradId})`} opacity="0.5" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '32%',
          height: 24,
          background: `radial-gradient(circle at 6px 12px, ${theme.sceneBgA} 5px, transparent 5px) 0 0/12px 24px, linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7))`,
          opacity: 0.6
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '40%',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 24px, transparent 24px 48px)'
        }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${(i * 81) % 100}%`,
            top: -8,
            width: 4,
            height: 6,
            background: i % 2 === 0 ? theme.accent : '#fff',
            animation: `k-rise-fade ${6 + (i % 3)}s linear ${i * 0.7}s infinite reverse`,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
};
