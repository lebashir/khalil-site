'use client';

import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from 'react';

type PressableTag = 'button' | 'a' | 'div';

interface PressableProps {
  /** Underlying DOM tag. Default 'button'. Use 'a' with href for links. */
  tag?: PressableTag;
  /** Fires on quick tap/click. Suppressed if a long-press fired first. */
  onTap?: () => void;
  /** Fires when the press is held for >= longPressMs. */
  onLongPress?: () => void;
  longPressMs?: number;
  /** Ripple bubble color. Defaults to a soft white if unset. */
  rippleColor?: string;
  /** Color used by the ripple when rippleColor isn't explicitly set. */
  ringColor?: string;
  /** Whether hover lifts the element. Auto-disabled on touch-primary devices. */
  lift?: boolean;
  /** <a> only. */
  href?: string;
  target?: string;
  rel?: string;
  /** <button> only. Default 'button' to prevent stray form submits. */
  type?: 'button' | 'submit' | 'reset';
  /** Accessibility — required when children are non-text. */
  'aria-label'?: string;
  /** Forwarded styles. position:relative + overflow:hidden are forced. */
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

// Module-level counter so multiple Pressables don't clash on keys.
let rippleSeq = 0;

// Interactive shell with hover-lift, ripple, scale-press, optional
// long-press, and `prefers-reduced-motion` awareness. Polymorphic over
// 'button' | 'a' | 'div' via the `tag` prop. Honors `(hover: none)`
// by stripping the hover-lift on touch-primary devices while keeping
// ripple + press feedback.
//
// The hover-lift comes from a CSS rule (.k-pressable:hover) in
// globals.css. The press-scale is applied inline so it wins over the
// hover rule when both apply. The ripple uses the k-press-ripple
// keyframe.
const PressableInner = (
  props: PressableProps,
  forwardedRef: ForwardedRef<HTMLElement>
) => {
  const {
    tag = 'button',
    onTap,
    onLongPress,
    longPressMs = 500,
    rippleColor,
    ringColor,
    lift = true,
    style,
    className,
    children,
    ...domProps
  } = props;

  const internalRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const firedLongPressRef = useRef(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  // (hover: none) at runtime — undefined while SSR/initial render, then
  // populated on mount.  We use this only for class composition, so the
  // SSR markup matches the first client render.
  const [touchPrimary, setTouchPrimary] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setTouchPrimary(false);
      return;
    }
    const mql = window.matchMedia('(hover: none)');
    const update = (e: MediaQueryList | MediaQueryListEvent) => setTouchPrimary(e.matches);
    update(mql);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    return undefined;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const onPointerDown = (e: ReactPointerEvent) => {
    setIsPressed(true);
    firedLongPressRef.current = false;

    // Spawn a ripple at the press point. Bounded so memory doesn't
    // grow if the user spam-taps.
    const el = internalRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const id = ++rippleSeq;
      const r: Ripple = { id, x: e.clientX - rect.left, y: e.clientY - rect.top };
      setRipples((prev) => (prev.length >= 4 ? [...prev.slice(1), r] : [...prev, r]));
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((p) => p.id !== id));
      }, 720);
    }

    if (onLongPress) {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        firedLongPressRef.current = true;
        onLongPress();
      }, longPressMs);
    }
  };

  const finishPress = () => {
    setIsPressed(false);
    clearTimer();
  };

  const onClick = (e: ReactMouseEvent) => {
    // If a long-press handler fired, swallow the trailing click so the
    // <a> doesn't navigate / the <button> doesn't double-trigger.
    if (firedLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      firedLongPressRef.current = false;
      return;
    }
    if (onTap) onTap();
  };

  // Hover-lift class is opt-out via `lift={false}` AND auto-disabled on
  // touch-primary devices. Until matchMedia resolves on the client, we
  // assume non-touch (the SSR markup needs to match).
  const liftEnabled = lift && touchPrimary !== true;
  const composed = [
    'k-pressable',
    liftEnabled ? '' : 'k-pressable--no-lift',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ');

  const refSetter = (node: HTMLElement | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const finalStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
    // inline transform wins over the CSS :hover rule when pressed
    ...(isPressed ? { transform: 'scale(0.97)' } : {})
  };

  const rippleBubbles = ripples.map((r) => (
    <span
      key={r.id}
      aria-hidden
      style={{
        position: 'absolute',
        left: r.x,
        top: r.y,
        width: 0,
        height: 0,
        borderRadius: '50%',
        background: rippleColor ?? ringColor ?? 'rgba(255,255,255,0.55)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        animation: 'k-press-ripple .7s ease-out forwards'
      }}
    />
  ));

  return createElement(
    tag,
    {
      ref: refSetter,
      className: composed,
      style: finalStyle,
      onPointerDown,
      onPointerUp: finishPress,
      onPointerLeave: finishPress,
      onPointerCancel: finishPress,
      onClick,
      ...domProps
    },
    children,
    rippleBubbles
  );
};

export const Pressable = forwardRef<HTMLElement, PressableProps>(PressableInner);
Pressable.displayName = 'Pressable';
