// Interaction primitives shared across arena, edit, and tunnel surfaces.
// All effects are GPU-only (transform + opacity), respect
// prefers-reduced-motion via the global media-query in app/globals.css,
// and tolerate `(hover: none)` devices by stripping hover-only feedback.

export { Pressable } from './Pressable';
export { Jiggleable } from './Jiggleable';
export { useHoverTilt } from './useHoverTilt';
export { useLongPress } from './useLongPress';
export type { LongPressHandlers } from './useLongPress';
