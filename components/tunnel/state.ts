// Tunnel scroll-progress state machine. Each scene owns a slice of overall
// scroll progress p ∈ [0,1]; within its slice it approaches (depth 0→0.5),
// locks at the camera (depth 0.5), then exits (depth 0.5→1) as the next
// scene fades in from depth 0 behind it.
//
// Ranges overlap deliberately so the corridor never goes empty.

export type SceneId = 'hero' | 'replays' | 'about' | 'book' | 'subscribe';

export interface Scene {
  id: SceneId;
  start: number;
  end: number;
  lockStart: number;
  lockEnd: number;
}

export const SCENES: Scene[] = [
  { id: 'hero',      start: 0.00, end: 0.28, lockStart: 0.05, lockEnd: 0.15 },
  { id: 'replays',   start: 0.15, end: 0.46, lockStart: 0.22, lockEnd: 0.34 },
  { id: 'about',     start: 0.34, end: 0.64, lockStart: 0.40, lockEnd: 0.54 },
  { id: 'book',      start: 0.54, end: 0.82, lockStart: 0.60, lockEnd: 0.74 },
  { id: 'subscribe', start: 0.74, end: 1.00, lockStart: 0.82, lockEnd: 1.00 }
];

export interface SceneState {
  /** position inside the scene's [start, end] slice, [0, 1] */
  local: number;
  /** 0 = far ahead, 0.5 = locked at camera, 1 = passed */
  depth: number;
  /** ramp in/out near depth edges so scenes don't pop */
  opacity: number;
  /** 0→1 through the scene's lock window — drives intra-scene content reveals */
  lockT: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Returns null when the scene is fully outside the camera. Otherwise emits
// depth/opacity/lockT for the renderer.
export const sceneState = (scene: Scene, p: number): SceneState | null => {
  if (p < scene.start - 0.04 || p > scene.end + 0.02) return null;
  const local = (p - scene.start) / (scene.end - scene.start);
  const lsL = (scene.lockStart - scene.start) / (scene.end - scene.start);
  const leL = (scene.lockEnd - scene.start) / (scene.end - scene.start);

  let depth: number;
  if (local < lsL) {
    depth = clamp(local / lsL, 0, 1) * 0.5;
  } else if (local > leL && leL < 1) {
    depth = 0.5 + clamp((local - leL) / (1 - leL), 0, 1) * 0.5;
  } else {
    depth = 0.5;
  }

  let opacity = 1;
  if (depth < 0.18) opacity = clamp(depth / 0.18, 0, 1);
  if (depth > 0.82) opacity = clamp((1 - depth) / 0.18, 0, 1);

  const lockT = clamp((local - lsL) / Math.max(0.01, leL - lsL), 0, 1);
  return { local, depth, opacity, lockT };
};

// depth ∈ [0,1] → CSS scale. Far is small, locked is 1.0, passed is huge.
export const depthToScale = (depth: number): number => {
  if (depth <= 0.5) return 0.18 + (depth / 0.5) * 0.82;
  return 1.0 + ((depth - 0.5) / 0.5) * 1.6;
};

// Subtle blur far + near.
export const depthToBlur = (depth: number): number => {
  if (depth < 0.2) return (0.2 - depth) * 16;
  if (depth > 0.7) return (depth - 0.7) * 14;
  return 0;
};

export { clamp };
