import type { ArenaTheme } from '../theme';
import type { ArenaSize } from '../useArenaSize';

interface Props {
  theme: ArenaTheme;
  size: ArenaSize;
}

// Neon bunker scene. Radial bg gradient, faint grid, perspective lines,
// scanline overlay, ambient cyan/magenta motes rising up.
export const GamingBG = ({ theme, size }: Props) => {
  const particles = size === 'desktop' ? 22 : 14;
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${theme.sceneBgC} 0%, ${theme.sceneBgB} 35%, ${theme.sceneBgA} 80%)`,
          transition: 'background .8s ease'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${theme.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.line} 1px, transparent 1px)`,
          backgroundSize: size === 'desktop' ? '64px 64px' : '40px 40px',
          maskImage: 'linear-gradient(180deg, black, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(180deg, black, transparent 85%)',
          opacity: 0.5
        }}
      />
      <svg
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '60%',
          opacity: 0.4
        }}
      >
        {[0.2, 0.3, 0.45, 0.62, 0.82].map((y, i) => (
          <line
            key={i}
            x1={-100 + i * 60}
            y1={y * 800}
            x2={500 - i * 60}
            y2={y * 800}
            stroke={theme.accent}
            strokeWidth={0.6}
            opacity={0.4 + i * 0.1}
          />
        ))}
        {[-2, -1, 0, 1, 2].map((i) => (
          <line
            key={i}
            x1={200 + i * 20}
            y1={160}
            x2={200 + i * 400}
            y2={800}
            stroke={theme.accent2}
            strokeWidth={0.6}
            opacity={0.3}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)',
          mixBlendMode: 'overlay'
        }}
      />
      {Array.from({ length: particles }).map((_, i) => {
        const color = i % 3 === 0 ? theme.accent2 : theme.accent;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 73) % 100}%`,
              bottom: -10,
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 8px ${color}`,
              animation: `k-rise-fade ${4 + (i % 4)}s linear ${i * 0.4}s infinite`,
              opacity: 0.85
            }}
          />
        );
      })}
    </div>
  );
};
