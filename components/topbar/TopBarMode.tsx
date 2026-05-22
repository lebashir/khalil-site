'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from 'react';
import type { Mode } from '@/lib/content';
import { PALETTE, getGamingPalette, type ModePalette } from './palette';
import { useModeFlipContext } from './ModeFlipProvider';
import { useGamingTheme } from '@/components/GamingThemeProvider';

type Size = 'desktop' | 'tablet' | 'phone';

const useTopbarSize = (): Size => {
  const [size, setSize] = useState<Size>('desktop');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = (): Size => {
      const w = window.innerWidth;
      if (w >= 900) return 'desktop';
      if (w >= 560) return 'tablet';
      return 'phone';
    };
    const update = () => setSize(compute());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
};

const HEIGHT_BY_SIZE: Record<Size, number> = { desktop: 92, tablet: 78, phone: 68 };

// Per-mode backplate scribble that paints behind the label. Gaming gets a
// neon grid + radial glow + scanlines; football gets floodlight cones +
// a halftone crowd ribbon.
interface BackplateProps {
  paint: ModePalette;
  side: 'left' | 'right';
  isActive: boolean;
}

const Backplate = ({ paint, side, isActive }: BackplateProps) => {
  const opacity = isActive ? 0.6 : 0.25;

  if (paint.label === 'GAMING') {
    return (
      <>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${paint.accent}22 1px, transparent 1px), linear-gradient(90deg, ${paint.accent}22 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: opacity * 0.7
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: side === 'left' ? '20%' : 'auto',
            right: side === 'right' ? '20%' : 'auto',
            transform: 'translate(-50%, -50%)',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${paint.accent}44 0%, transparent 65%)`,
            opacity,
            filter: 'blur(2px)'
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)',
            pointerEvents: 'none'
          }}
        />
      </>
    );
  }

  const gradId = `cone-${side}-${paint.label}`;
  return (
    <>
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={paint.accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={paint.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={side === 'left' ? '60,-20 -40,120 200,120' : '340,-20 440,120 200,120'}
          fill={`url(#${gradId})`}
        />
      </svg>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 12,
          background: `radial-gradient(circle at 6px 6px, ${paint.accent}66 4px, transparent 4px) 0 0/10px 12px`,
          opacity: opacity * 0.8
        }}
      />
    </>
  );
};

interface HalfProps {
  paint: ModePalette;
  isActive: boolean;
  flex: number;
  onClick: () => void;
  /** Fires when the user hovers the IDLE side. The arena listens and
   *  paints a soft accent wash to preview the other mode. */
  onPeek: (mode: Mode | null) => void;
  size: Size;
  side: 'left' | 'right';
}

const Half = ({ paint, isActive, flex, onClick, onPeek, size, side }: HalfProps) => {
  const isDesktop = size === 'desktop';
  const isPhone = size === 'phone';

  const labelFontSize = isActive
    ? isDesktop
      ? 46
      : isPhone
        ? 24
        : 34
    : isDesktop
      ? 22
      : 16;

  const emojiFontSize = isActive
    ? isDesktop
      ? 44
      : isPhone
        ? 30
        : 36
    : isDesktop
      ? 26
      : 22;

  // Mode this half represents. Used by the peek broadcast.
  const halfMode: Mode = paint.label === 'GAMING' ? 'gaming' : 'football';

  return (
    <div
      className={`tb-half ${isActive ? 'tb-active' : 'tb-idle'}`}
      onClick={onClick}
      onPointerEnter={() => {
        // Only the IDLE half peeks — hovering the already-active half is
        // a no-op so we don't trigger a wash for the current mode.
        if (!isActive) onPeek(halfMode);
      }}
      onPointerLeave={() => onPeek(null)}
      onPointerCancel={() => onPeek(null)}
      style={{
        position: 'relative',
        flex: `${flex} 1 0`,
        background: isActive
          ? `linear-gradient(${side === 'left' ? '135' : '225'}deg, ${paint.bgA} 0%, ${paint.bgB} 50%, ${paint.bgC} 110%)`
          : `linear-gradient(${side === 'left' ? '135' : '225'}deg, ${paint.bgA} 0%, ${paint.bgB} 100%)`,
        opacity: isActive ? 1 : 0.62,
        cursor: isActive ? 'default' : 'pointer',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
        padding: isPhone ? '0 10px' : isDesktop ? '0 28px' : '0 18px',
        gap: isDesktop ? 16 : 10
      }}
      role="tab"
      aria-selected={isActive}
      aria-label={`${paint.label} mode${isActive ? ' (active)' : ''}`}
    >
      <Backplate paint={paint} side={side} isActive={isActive} />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: isDesktop ? 14 : 8,
          flexDirection: side === 'right' ? 'row-reverse' : 'row'
        }}
      >
        <span
          aria-hidden
          style={{
            fontSize: emojiFontSize,
            filter: `drop-shadow(0 0 12px ${paint.accent})`,
            transition: 'font-size .55s cubic-bezier(.6,1.4,.3,1)',
            lineHeight: 1
          }}
        >
          {paint.emoji}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: labelFontSize,
              letterSpacing: isActive ? 2 : 1.5,
              color: paint.ink,
              lineHeight: 0.95,
              textShadow: isActive ? `0 0 24px ${paint.accent}, 0 0 48px ${paint.accent2}50` : 'none',
              transition: 'all .45s cubic-bezier(.6,1.4,.3,1)',
              whiteSpace: 'nowrap'
            }}
          >
            {paint.label}
          </div>
          {isActive && !isPhone && (
            <div
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: isDesktop ? 11 : 9,
                letterSpacing: 2,
                color: paint.accent,
                marginTop: 4,
                opacity: 0.85,
                textTransform: 'uppercase'
              }}
            >
              {paint.sub}
            </div>
          )}
          {/* Idle-side TAP hint. Renders on every viewport — on phone the
              copy is short so it fits the narrow idle half. */}
          {!isActive && (
            <div
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: isPhone ? 8 : 9,
                letterSpacing: isPhone ? 1.2 : 2,
                color: paint.accent,
                opacity: 0.85,
                marginTop: isPhone ? 2 : 3,
                textTransform: 'uppercase',
                fontWeight: 700,
                textShadow: `0 0 4px ${paint.accent}`,
                whiteSpace: 'nowrap'
              }}
            >
              {isPhone
                ? side === 'left'
                  ? '← FLIP'
                  : 'FLIP →'
                : side === 'left'
                  ? '← TAP TO FLIP'
                  : 'TAP TO FLIP →'}
            </div>
          )}
        </div>
      </div>

      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            ...(side === 'left' ? { left: 14 } : { right: 14 }),
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 9,
            letterSpacing: 2,
            color: paint.accent,
            zIndex: 3,
            textShadow: `0 0 6px ${paint.accent}`
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: paint.accent,
              boxShadow: `0 0 6px ${paint.accent}`,
              animation: 'tb-blink-led 2.6s ease-in-out infinite'
            }}
          />
          <span>CURRENTLY</span>
        </div>
      )}
    </div>
  );
};

// The full-width mode toggle. Sticky to the top of the page.
// Three trigger paths: click idle half, pointer drag past threshold,
// ←/→ keys when focused.
// Event name dispatched on `window` when the user hovers the idle topbar
// half. ArenaShell (and any other consumer) listens and renders a soft
// accent wash to preview that mode. Suppressed during transitions.
export const PEEK_EVENT = 'khalil:peek';

export interface PeekDetail {
  mode: Mode | null;
}

// First-visit hint flag — set in localStorage after the toast plays once.
// We never auto-show again so returning visitors aren't pestered.
const HINT_STORAGE_KEY = 'khalil:flipHintSeen';
// How long the hint stays on screen after it has slid in.
const HINT_DWELL_MS = 4200;
// Delay before showing — let the rest of the page paint first.
const HINT_DELAY_MS = 1500;

export const TopBarMode = () => {
  const { mode, flip, isTransitioning } = useModeFlipContext();
  const { themeKey } = useGamingTheme();
  const size = useTopbarSize();
  const height = HEIGHT_BY_SIZE[size];

  // One-shot first-visit hint. Renders a small toast pointing at the idle
  // side after a short delay; auto-dismisses, and never shows again.
  // Suppressed entirely for visitors who already interacted with the bar.
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(HINT_STORAGE_KEY) === '1';
    } catch {
      // localStorage may be disabled — default to showing the hint once
      // per page load in that case, which is the same UX in practice.
    }
    if (seen) return;
    const showT = window.setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    const hideT = window.setTimeout(() => setShowHint(false), HINT_DELAY_MS + HINT_DWELL_MS);
    return () => {
      window.clearTimeout(showT);
      window.clearTimeout(hideT);
    };
  }, []);

  // Mark hint as seen on the first user-driven flip, so it never re-shows
  // on subsequent page loads. Keyed on `mode` changing.
  const initialModeRef = useRef(mode);
  useEffect(() => {
    if (mode === initialModeRef.current) return;
    setShowHint(false);
    try {
      window.localStorage.setItem(HINT_STORAGE_KEY, '1');
    } catch {
      /* localStorage unavailable — silently no-op */
    }
  }, [mode]);

  const broadcastPeek = (next: Mode | null) => {
    if (typeof window === 'undefined') return;
    // Drop peeks while the cinematic flip is in flight — the wash would
    // fight the transition overlay.
    const target = isTransitioning ? null : next;
    window.dispatchEvent(new CustomEvent<PeekDetail>(PEEK_EVENT, { detail: { mode: target } }));
  };

  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ active: false, startX: 0, dx: 0, pointerId: -1 });
  const [dragDx, setDragDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isTransitioning) return;
    dragState.current = { active: true, startX: e.clientX, dx: 0, pointerId: e.pointerId };
    setDragging(true);
    hostRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.dx = dx;
    setDragDx(dx);
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const dx = dragState.current.dx;
    const bw = hostRef.current?.clientWidth ?? 800;
    const threshold = Math.min(80, bw * 0.16);

    dragState.current = { active: false, startX: 0, dx: 0, pointerId: -1 };
    setDragDx(0);
    setDragging(false);
    if (e.pointerId >= 0) {
      try {
        hostRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }

    if (mode === 'gaming' && dx < -threshold) flip();
    else if (mode === 'football' && dx > threshold) flip();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTransitioning) return;
    if (e.key === 'ArrowLeft' && mode === 'football') {
      e.preventDefault();
      flip();
    } else if (e.key === 'ArrowRight' && mode === 'gaming') {
      e.preventDefault();
      flip();
    } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === hostRef.current) {
      // Enter/Space on the bar itself toggles (any direction)
      e.preventDefault();
      flip();
    }
  };

  const isGaming = mode === 'gaming';
  // The gaming half repaints in the active theme; football is always the
  // canonical Real Madrid palette (single-palette mode by design).
  const pGaming = getGamingPalette(themeKey);
  const pFoot = PALETTE.football;

  // Live flex weighting. Drag delta shifts the seam, clamped to ±0.3 so
  // neither half can collapse during a drag.
  const bw = hostRef.current?.clientWidth ?? 800;
  const dragShift = Math.max(-1, Math.min(1, dragDx / (bw * 0.3))) * 0.3;
  const gamingFlex = isGaming ? 0.78 + dragShift : 0.22 + dragShift;
  const footFlex = 1 - gamingFlex;
  const seamPct = gamingFlex * 100;

  return (
    <div
      ref={hostRef}
      className={isTransitioning ? 'tb-host' : ''}
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height,
        display: 'flex',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'pan-y',
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: 80
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="tablist"
      aria-label="Mode toggle — gaming or football"
    >
      <Half
        paint={pGaming}
        isActive={isGaming}
        flex={gamingFlex}
        onClick={() => {
          if (!isGaming && !isTransitioning) flip();
        }}
        onPeek={broadcastPeek}
        size={size}
        side="left"
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${seamPct}%`,
          width: 2,
          marginLeft: -1,
          background: `linear-gradient(180deg, ${pGaming.accent}, ${pFoot.accent})`,
          boxShadow: `0 0 14px ${isTransitioning ? pGaming.accent : pGaming.seamGlow}, 0 0 28px ${isTransitioning ? pFoot.accent : pFoot.seamGlow}`,
          transition: 'left .55s cubic-bezier(.6,1.4,.3,1), box-shadow .25s',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      />

      {/* Seam chevron — small arrow on the seam that points toward the
          IDLE side and bounces every couple of seconds. Strong "I'm a
          toggle" signal independent of the TAP TO FLIP microcopy.
          Suppressed during the cinematic transition so it doesn't fight
          the overlay. */}
      {!isTransitioning && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: `${seamPct}%`,
            animation: `${isGaming ? 'tb-chevron-right' : 'tb-chevron-left'} 2.4s ease-in-out infinite`,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: size === 'phone' ? 14 : 18,
            fontWeight: 900,
            color: isGaming ? pFoot.accent : pGaming.accent,
            textShadow: `0 0 8px ${isGaming ? pFoot.accent : pGaming.accent}`,
            zIndex: 6,
            pointerEvents: 'none',
            lineHeight: 1,
            transition: 'left .55s cubic-bezier(.6,1.4,.3,1)'
          }}
        >
          {isGaming ? '→' : '←'}
        </div>
      )}

      <Half
        paint={pFoot}
        isActive={!isGaming}
        flex={footFlex}
        onClick={() => {
          if (isGaming && !isTransitioning) flip();
        }}
        onPeek={broadcastPeek}
        size={size}
        side="right"
      />

      {/* First-visit "tap to flip" toast. Renders once per visitor, just
          below the bar, near the idle side so it's clear what's
          interactive. Auto-fades. */}
      {showHint && !isTransitioning && (
        <div
          role="note"
          style={{
            position: 'absolute',
            top: height - 6,
            left: isGaming ? `calc(${seamPct}% + 24px)` : `calc(${seamPct}% - 24px)`,
            transform: 'translate(-50%, 0)',
            padding: size === 'phone' ? '6px 10px' : '7px 14px',
            background: 'rgba(0,0,0,0.85)',
            border: `1px solid ${isGaming ? pFoot.accent : pGaming.accent}`,
            borderRadius: 4,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: size === 'phone' ? 9 : 10,
            letterSpacing: 1.5,
            color: isGaming ? pFoot.accent : pGaming.accent,
            boxShadow: `0 6px 22px rgba(0,0,0,0.5), 0 0 14px ${isGaming ? pFoot.accent : pGaming.accent}66`,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 81,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            animation: 'tb-hint-in .3s ease-out both, tb-hint-out .35s ease-in forwards ' + (HINT_DWELL_MS / 1000) + 's',
            pointerEvents: 'none'
          }}
        >
          ↔ {size === 'phone' ? 'TAP OR SWIPE' : 'TAP HERE OR SWIPE'} — TRY IT
        </div>
      )}
    </div>
  );
};
