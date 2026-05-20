import type { Mode } from '@/lib/content';
import type { TunnelTheme } from './theme';
import type { ArenaSize } from '@/components/arena/useArenaSize';

interface Props {
  mode: Mode;
  theme: TunnelTheme;
  progress: number;
  size: ArenaSize;
}

// The corridor itself. Radial bg gradient (deep → mid), floor/ceiling
// perspective lines that scroll forward with progress, vanishing-point
// radials, and 12 particles drifting toward the camera.
export const TunnelBG = ({ mode, theme, progress, size }: Props) => {
  const lineCount = size === 'desktop' ? 14 : 10;
  const floorId = `tn-floor-${mode}`;
  const ceilId = `tn-ceil-${mode}`;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${theme.bgMid} 0%, ${theme.bgFar} 40%, ${theme.bgDeep} 90%)`,
        overflow: 'hidden'
      }}
    >
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id={floorId} x1="0" y1="0.5" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.floorTint} stopOpacity="0" />
            <stop offset="100%" stopColor={theme.floorTint} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={ceilId} x1="0" y1="0.5" x2="0" y2="0">
            <stop offset="0%" stopColor={theme.wallTint} stopOpacity="0" />
            <stop offset="100%" stopColor={theme.wallTint} stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x="0" y="200" width="400" height="200" fill={`url(#${floorId})`} opacity="0.6" />
        <rect x="0" y="0" width="400" height="200" fill={`url(#${ceilId})`} opacity="0.6" />
        <g opacity="0.55">
          {Array.from({ length: lineCount }).map((_, i) => {
            const dist = i / lineCount;
            const phase = (dist + progress * 1.2) % 1;
            const y = 200 + phase * 260;
            const w = phase * 1400;
            return (
              <line
                key={`f-${i}`}
                x1={200 - w}
                y1={y}
                x2={200 + w}
                y2={y}
                stroke={theme.accent}
                strokeWidth={0.3 + phase * 1.6}
                opacity={1 - phase * 0.5}
              />
            );
          })}
          {Array.from({ length: lineCount }).map((_, i) => {
            const dist = i / lineCount;
            const phase = (dist + progress * 1.2) % 1;
            const y = 200 - phase * 260;
            const w = phase * 1400;
            return (
              <line
                key={`c-${i}`}
                x1={200 - w}
                y1={y}
                x2={200 + w}
                y2={y}
                stroke={theme.accent2}
                strokeWidth={0.3 + phase * 1.6}
                opacity={1 - phase * 0.5}
              />
            );
          })}
          {[-3, -2, -1, 1, 2, 3].map((i) => (
            <line
              key={`r-${i}`}
              x1={200}
              y1={200}
              x2={200 + i * 120}
              y2={i % 2 === 0 ? 400 : 0}
              stroke={i % 2 === 0 ? theme.accent : theme.accent2}
              strokeWidth="0.4"
              opacity="0.25"
            />
          ))}
        </g>
      </svg>

      {/* Particles drifting toward camera */}
      {Array.from({ length: 12 }).map((_, i) => {
        const lane = i % 4;
        const speed = 0.3 + lane * 0.2;
        const local = (i * 0.137 + progress * speed) % 1;
        const sz = 2 + local * 5;
        const lateral = ((i * 53) % 100 - 50) / 100;
        const color = i % 3 === 0 ? theme.accent2 : theme.accent;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${50 + lateral * (15 + local * 60)}%`,
              top: `${50 + lateral * 0.7 * (10 + local * 70)}%`,
              width: sz,
              height: sz,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${sz * 3}px ${color}`,
              opacity: 0.35 + local * 0.55,
              pointerEvents: 'none'
            }}
          />
        );
      })}
    </div>
  );
};
