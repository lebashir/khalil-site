import { useMemo } from 'react';
import type { DesignThumb } from '@/lib/content';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import type { TunnelTheme } from './theme';
import { SCENES, clamp } from './state';

interface Props {
  theme: TunnelTheme;
  progress: number;
  size: ArenaSize;
  designThumbs: DesignThumb[];
}

interface Lane {
  side: 'l' | 'r';
  tilt: number;
  items: DesignThumb[];
}

// Drifting video-thumb tiles on both walls. Each tile has its own depth
// phase that wraps as the camera passes. Tiles dim by 50% during scene
// lock windows so they don't compete with the readable rooms.
export const TunnelWalls = ({ theme, progress, size, designThumbs }: Props) => {
  const lanes = useMemo<Lane[]>(() => {
    if (designThumbs.length === 0) return [];
    const pick = (i: number): DesignThumb => designThumbs[i % designThumbs.length]!;
    return [
      { side: 'l', tilt: 14, items: [pick(0), pick(1), pick(2), pick(3)] },
      { side: 'l', tilt: 22, items: [pick(2), pick(4), pick(0), pick(1)] },
      { side: 'r', tilt: -14, items: [pick(1), pick(4), pick(3), pick(0)] },
      { side: 'r', tilt: -22, items: [pick(3), pick(2), pick(1), pick(4)] }
    ];
  }, [designThumbs]);

  if (lanes.length === 0) return null;

  const inLockWindow = SCENES.some(
    (s) => progress > s.lockStart - 0.01 && progress < s.lockEnd + 0.01
  );
  const dim = inLockWindow ? 0.5 : 1;
  const tileW = size === 'desktop' ? 160 : 120;
  const tileH = tileW * 0.6;

  return (
    <div
      aria-hidden
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    >
      {lanes.flatMap((lane, li) =>
        lane.items.map((thumb, ii) => {
          const isL = lane.side === 'l';
          const raw = li * 0.18 + ii * 0.27 - progress * 1.4;
          const phase = ((raw % 1) + 1) % 1;
          const scale = 0.15 + phase * 1.6;
          const lateral = (isL ? -1 : 1) * (12 + phase * 50);
          const opacity =
            phase < 0.15
              ? (phase / 0.15) * 0.55
              : phase > 0.85
                ? clamp((1 - phase) / 0.15, 0, 1) * 0.4
                : 0.55;
          const blur =
            Math.max(0, (0.18 - phase) * 30) + Math.max(0, (phase - 0.8) * 24);

          return (
            <div
              key={`${li}-${ii}`}
              style={{
                position: 'absolute',
                left: `${50 + lateral}%`,
                top: '50%',
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${lane.tilt}deg)`,
                width: tileW,
                height: tileH,
                background: `linear-gradient(135deg, ${thumb.from}, ${thumb.to})`,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 6,
                opacity: opacity * dim,
                boxShadow: `0 0 ${20 * phase}px ${theme.accent}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: blur > 0 ? `blur(${blur}px)` : undefined
              }}
            >
              {phase > 0.4 && phase < 0.85 && (
                <span style={{ fontSize: 28 + phase * 30 }} aria-hidden>
                  {thumb.emoji}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
