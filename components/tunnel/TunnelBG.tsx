import type { Mode } from '@/lib/content';
import type { TunnelTheme } from './theme';
import type { ArenaSize } from '@/components/arena/useArenaSize';

interface Props {
  mode: Mode;
  theme: TunnelTheme;
  progress: number;
  size: ArenaSize;
}

// §9 — depth-fix layer counts. Tuned so the BG sells "I am walking
// inside a corridor" rather than reading as a flat horizon.
const RADIAL_LINES = 20;
const RECEDING_RINGS = 12;

// The corridor itself. Layers, in render order:
//   1. Radial bg gradient (deep → mid)
//   2. Floor/ceiling horizon tints
//   3. Floor + ceiling perspective lines, scrolling forward with progress
//   4. §9 concentric receding rings — the "doorway after doorway" effect
//   5. §9 brighter radial vanishing-point lines (20 around the clock)
//   6. §9 radial vignette darkening the edges so the back wall reads
//      as a tunnel opening
//   7. Particles drifting toward the camera
//
// All SVG `<defs>` IDs are mode-suffixed so a hypothetical two-tunnel
// page (or a transition layer over the top of another) doesn't collide.
export const TunnelBG = ({ mode, theme, progress, size }: Props) => {
  const lineCount = size === 'desktop' ? 14 : 10;
  const floorId = `tn-floor-${mode}`;
  const ceilId = `tn-ceil-${mode}`;
  const vignetteId = `tn-vignette-${mode}`;

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
          {/* §9 vignette — bright at the vanishing point (200,200), dark
              at the edges. Sells depth without geometry. */}
          <radialGradient id={vignetteId} cx="0.5" cy="0.5" r="0.7">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="65%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* Floor / ceiling horizon */}
        <rect x="0" y="200" width="400" height="200" fill={`url(#${floorId})`} opacity="0.6" />
        <rect x="0" y="0" width="400" height="200" fill={`url(#${ceilId})`} opacity="0.6" />

        <g opacity="0.55">
          {/* Floor perspective lines */}
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
          {/* Ceiling perspective lines */}
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

          {/* §9 — concentric receding rings. 12 rectangle outlines that
              compress toward the vanishing point and expand outward
              over time. Their scale uses phase² so they bunch up near
              the center (selling acceleration through the doorway) and
              spread as they approach the camera. */}
          {Array.from({ length: RECEDING_RINGS }).map((_, i) => {
            const dist = i / RECEDING_RINGS;
            const phase = (dist + progress * 1.4) % 1;
            const scaled = phase * phase; // ease-in growth
            const half = 12 + scaled * 380;
            const stroke = i % 2 === 0 ? theme.accent : theme.accent2;
            return (
              <rect
                key={`ring-${i}`}
                x={200 - half}
                y={200 - half}
                width={half * 2}
                height={half * 2}
                fill="none"
                stroke={stroke}
                strokeWidth={0.4 + phase * 1.2}
                opacity={1 - phase * 0.85}
              />
            );
          })}

          {/* §9 — brighter, more-spread radial lines around the clock.
              Previously 6 diagonal pairs at 0.25 opacity; now 20 evenly
              distributed so the back wall reads as an enclosed mouth. */}
          {Array.from({ length: RADIAL_LINES }).map((_, i) => {
            const angle = (i / RADIAL_LINES) * Math.PI * 2;
            const x2 = 200 + Math.cos(angle) * 600;
            const y2 = 200 + Math.sin(angle) * 600;
            const stroke = i % 2 === 0 ? theme.accent : theme.accent2;
            return (
              <line
                key={`r-${i}`}
                x1={200}
                y1={200}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={0.4}
                opacity={0.42}
              />
            );
          })}
        </g>

        {/* §9 — radial vignette on top of all line layers so the
            corner darkening doesn't fight the perspective. */}
        <rect x="0" y="0" width="400" height="400" fill={`url(#${vignetteId})`} />
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
