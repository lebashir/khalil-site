// SHARED TOP BAR — full-width mode toggle.
//
// The toggle takes the entire top row of the site. Two half-tiles, each
// representing a "world" (gaming neon / football stadium). The ACTIVE half
// dominates (70% width, full chroma, big label). The IDLE half is a slim
// 30% strip on the side — visible enough to tap or swipe toward.
//
// Three interactions trigger the flip:
//   - Click/tap on the idle half
//   - Horizontal swipe / drag (mouse or touch) past a threshold
//   - Keyboard: ← / → on a focused topbar
//
// The flip itself is cinematic — managed by <ModeFlipOverlay> below. See
// useModeFlip() for the state machine that coordinates transition timing
// across the topbar AND the rest of the page.

(function () {
  const { useState, useRef, useEffect } = React;

  // ── One-time CSS for the topbar + transition overlay ──────────────────
  if (typeof document !== 'undefined' && !document.getElementById('khalil-topbar-css')) {
    const s = document.createElement('style');
    s.id = 'khalil-topbar-css';
    s.textContent = `
      @keyframes tb-wipe-diag-in {
        0%   { transform: skewX(-12deg) translateX(120%); }
        100% { transform: skewX(-12deg) translateX(0); }
      }
      @keyframes tb-wipe-diag-out {
        0%   { transform: skewX(-12deg) translateX(0); }
        100% { transform: skewX(-12deg) translateX(-120%); }
      }
      @keyframes tb-flash-bright {
        0%   { opacity: 0 }
        25%  { opacity: 1 }
        100% { opacity: 0 }
      }
      @keyframes tb-rise-label {
        0%   { transform: translateY(40px) scale(.6); opacity: 0; filter: blur(8px) }
        45%  { transform: translateY(-6px) scale(1.06); opacity: 1; filter: blur(0) }
        70%  { transform: translateY(2px) scale(0.98); opacity: 1 }
        100% { transform: translateY(0) scale(1); opacity: 1 }
      }
      @keyframes tb-fall-label {
        0%   { transform: translateY(0); opacity: 1 }
        100% { transform: translateY(-30px); opacity: 0; filter: blur(6px) }
      }
      @keyframes tb-streak {
        0%   { transform: translateX(-100%) skewX(-20deg); opacity: 0 }
        30%  { opacity: 1 }
        100% { transform: translateX(120vw) skewX(-20deg); opacity: 0 }
      }
      @keyframes tb-shake-mode {
        0%,100% { transform: translate(0,0) }
        20% { transform: translate(-5px, 2px) }
        40% { transform: translate(4px, -3px) }
        60% { transform: translate(-3px, 3px) }
        80% { transform: translate(3px, 1px) }
      }
      .tb-host { animation: tb-shake-mode .35s ease-out }
      .tb-half { transition: flex .55s cubic-bezier(.6,1.4,.3,1), opacity .35s }
      .tb-half:hover.tb-idle { filter: brightness(1.25) }
      .tb-knob { transition: transform .55s cubic-bezier(.6,1.4,.3,1) }
    `;
    document.head.appendChild(s);
  }

  // Visual identity per mode — used by the topbar tiles AND the transition
  // overlay so the wipe is colored correctly on both sides of the seam.
  const PALETTE = {
    gaming: {
      bgA: '#0e0030', bgB: '#3a0a5a', bgC: '#5a14a0',
      accent: '#00f0ff', accent2: '#ff2bd6', accent3: '#ffe600',
      ink: '#ffffff', label: 'GAMING', emoji: '🎮',
      sub: 'streamer · gamer · goat',
      seamGlow: 'rgba(0,240,255,0.7)',
    },
    football: {
      bgA: '#001233', bgB: '#003366', bgC: '#0a4a2a',
      accent: '#ffd700', accent2: '#ffffff', accent3: '#4d8fff',
      ink: '#ffffff', label: 'FOOTBALL', emoji: '⚽',
      sub: 'striker · madridista · 7',
      seamGlow: 'rgba(255,215,0,0.8)',
    },
  };

  // ────────────────────────────────────────────────────────────────────────
  // TopBarMode — the full-width strip with two half-tiles.
  // ────────────────────────────────────────────────────────────────────────
  window.TopBarMode = function TopBarMode({ mode, onFlip, size = 'desktop', transitioning, height }) {
    const isDesktop = size === 'desktop';
    const isPhone = size === 'phone';
    const H = height || (isDesktop ? 92 : isPhone ? 68 : 78);

    // Sliding pointer/touch — translate the seam by drag delta, snap to
    // flip if user passes a threshold.
    const hostRef = useRef(null);
    const drag = useRef({ active: false, startX: 0, dx: 0 });
    const [dragDx, setDragDx] = useState(0);

    const onPointerDown = (e) => {
      if (transitioning) return;
      drag.current = { active: true, startX: e.clientX, dx: 0 };
      hostRef.current?.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      drag.current.dx = dx;
      setDragDx(dx);
    };
    const onPointerUp = (e) => {
      if (!drag.current.active) return;
      const dx = drag.current.dx;
      drag.current = { active: false, startX: 0, dx: 0 };
      setDragDx(0);
      // Threshold: 80px or 20% of bar width, whichever smaller.
      const bw = hostRef.current?.clientWidth || 800;
      const threshold = Math.min(80, bw * 0.16);
      if (mode === 'gaming' && dx < -threshold) onFlip();
      else if (mode === 'football' && dx > threshold) onFlip();
      hostRef.current?.releasePointerCapture?.(e.pointerId);
    };

    const isGaming = mode === 'gaming';
    const pGaming  = PALETTE.gaming;
    const pFoot    = PALETTE.football;

    // Live flex weighting: idle 22%, active 78%; nudges with drag.
    // dragDx > 0 = trying to grow gaming.
    const bw = hostRef.current?.clientWidth || 800;
    const dragShift = Math.max(-1, Math.min(1, dragDx / (bw * 0.3))) * 0.3;
    const gamingFlex = isGaming ? 0.78 + dragShift : 0.22 + dragShift;
    const footFlex = 1 - gamingFlex;

    return (
      <div
        ref={hostRef}
        className={transitioning ? 'tb-host' : ''}
        style={{
          position: 'relative',
          width: '100%', height: H,
          display: 'flex',
          overflow: 'hidden',
          userSelect: 'none', touchAction: 'pan-y',
          cursor: drag.current.active ? 'grabbing' : 'grab',
          zIndex: 50,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' && !isGaming) onFlip();
          else if (e.key === 'ArrowRight' && isGaming) onFlip();
        }}
        role="tablist"
        aria-label="Mode toggle — gaming or football"
      >
        <Half
          paint={pGaming} isActive={isGaming} flex={gamingFlex}
          onClick={() => { if (!isGaming) onFlip(); }}
          size={size} side="left"
          transitioning={transitioning}
        />
        {/* Seam — flickers brighter during transition */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${gamingFlex * 100}%`,
          width: 2, marginLeft: -1,
          background: `linear-gradient(180deg, ${pGaming.accent}, ${pFoot.accent})`,
          boxShadow: `0 0 14px ${transitioning ? pGaming.accent : pGaming.seamGlow}, 0 0 28px ${transitioning ? pFoot.accent : pFoot.seamGlow}`,
          transition: 'left .55s cubic-bezier(.6,1.4,.3,1), box-shadow .25s',
          zIndex: 5,
          pointerEvents: 'none',
        }} />
        <Half
          paint={pFoot} isActive={!isGaming} flex={footFlex}
          onClick={() => { if (isGaming) onFlip(); }}
          size={size} side="right"
          transitioning={transitioning}
        />
      </div>
    );
  };

  // One half of the top bar. The active half shows the big mode label and
  // a "CURRENTLY" tag; the idle half is a slim chip with a tap hint.
  const Half = ({ paint, isActive, flex, onClick, size, side, transitioning }) => {
    const isDesktop = size === 'desktop';
    const isPhone = size === 'phone';
    return (
      <div
        className={`tb-half ${isActive ? 'tb-active' : 'tb-idle'}`}
        onClick={onClick}
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
          gap: isDesktop ? 16 : 10,
        }}
      >
        {/* Mode-themed background scribble — different per side */}
        <Backplate paint={paint} side={side} isActive={isActive} />

        {/* Big mode label */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center',
          gap: isDesktop ? 14 : 8,
          flexDirection: side === 'right' ? 'row-reverse' : 'row',
        }}>
          <span
            aria-hidden
            style={{
              fontSize: isActive ? (isDesktop ? 44 : isPhone ? 30 : 36) : (isDesktop ? 26 : 22),
              filter: `drop-shadow(0 0 12px ${paint.accent})`,
              transition: 'font-size .55s cubic-bezier(.6,1.4,.3,1)',
            }}
          >{paint.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: isActive ? (isDesktop ? 46 : isPhone ? 24 : 34) : (isDesktop ? 22 : 16),
              letterSpacing: isActive ? 2 : 1.5,
              color: paint.ink,
              lineHeight: 0.95,
              textShadow: isActive ? `0 0 24px ${paint.accent}, 0 0 48px ${paint.accent2}50` : 'none',
              transition: 'all .45s cubic-bezier(.6,1.4,.3,1)',
              whiteSpace: 'nowrap',
            }}>{paint.label}</div>
            {isActive && !isPhone && (
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: isDesktop ? 11 : 9, letterSpacing: 2,
                color: paint.accent,
                marginTop: 4, opacity: 0.85,
                textTransform: 'uppercase',
              }}>{paint.sub}</div>
            )}
            {!isActive && !isPhone && (
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9, letterSpacing: 2,
                color: paint.accent, opacity: 0.65, marginTop: 3,
              }}>{side === 'left' ? '← TAP' : 'TAP →'}</div>
            )}
          </div>
        </div>

        {/* Active-state "CURRENTLY" pip */}
        {isActive && (
          <div style={{
            position: 'absolute',
            top: 8, [side === 'left' ? 'left' : 'right']: 14,
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2,
            color: paint.accent,
            zIndex: 3,
            textShadow: `0 0 6px ${paint.accent}`,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: paint.accent, boxShadow: `0 0 6px ${paint.accent}`,
              animation: 'ed-blink-led 2.6s ease-in-out infinite',
            }} />
            <span>CURRENTLY</span>
          </div>
        )}
      </div>
    );
  };

  // Per-mode SVG/CSS scribble that fills the half. Gaming = neon rings +
  // scanlines; Football = floodlight cones + crowd dots. Subtle, mostly
  // visible on the active half.
  const Backplate = ({ paint, side, isActive }) => {
    const opacity = isActive ? 0.6 : 0.25;
    if (paint.label === 'GAMING') {
      return (
        <>
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(${paint.accent}22 1px, transparent 1px), linear-gradient(90deg, ${paint.accent}22 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: opacity * 0.7,
          }} />
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: side === 'left' ? '20%' : 'auto', right: side === 'right' ? '20%' : 'auto',
            transform: 'translate(-50%, -50%)',
            width: 160, height: 160, borderRadius: '50%',
            background: `radial-gradient(circle, ${paint.accent}44 0%, transparent 65%)`,
            opacity, filter: 'blur(2px)',
          }} />
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)',
            pointerEvents: 'none',
          }} />
        </>
      );
    }
    // FOOTBALL
    return (
      <>
        <svg viewBox="0 0 400 100" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }} aria-hidden>
          <defs>
            <linearGradient id={`cone-${side}-${paint.label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={paint.accent} stopOpacity="0.45" />
              <stop offset="100%" stopColor={paint.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={side === 'left' ? '60,-20 -40,120 200,120' : '340,-20 440,120 200,120'} fill={`url(#cone-${side}-${paint.label})`} />
        </svg>
        {/* Crowd ribbon */}
        <div aria-hidden style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 12,
          background: `radial-gradient(circle at 6px 6px, ${paint.accent}66 4px, transparent 4px) 0 0/10px 12px`,
          opacity: opacity * 0.8,
        }} />
      </>
    );
  };

  // ────────────────────────────────────────────────────────────────────────
  // ModeFlipOverlay — the cinematic transition.
  // ────────────────────────────────────────────────────────────────────────
  // Rendered as an absolutely-positioned overlay on top of everything for
  // ~900ms when a flip happens. Three layers:
  //   1) Diagonal wipe slab in the TARGET mode's color, sweeps across
  //   2) Light streaks shooting in from both sides
  //   3) Big TARGET label rising up dead center
  // It does NOT actually toggle the page mode — useModeFlip() owns that
  // and swaps mode at the midpoint of the animation so content morphs
  // behind the wipe.
  window.ModeFlipOverlay = function ModeFlipOverlay({ from, to, nonce }) {
    if (!nonce) return null;
    const fromP = PALETTE[from];
    const toP   = PALETTE[to];
    return (
      <div key={nonce} aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
        overflow: 'hidden',
      }}>
        {/* Slab from the target mode wipes in */}
        <div style={{
          position: 'absolute', top: -40, bottom: -40, left: 0, width: '160%',
          background: `linear-gradient(135deg, ${toP.bgA} 0%, ${toP.bgB} 45%, ${toP.bgC} 100%)`,
          transform: 'skewX(-12deg) translateX(120%)',
          animation: 'tb-wipe-diag-in .42s cubic-bezier(.6,1.1,.3,1) both, tb-wipe-diag-out .42s cubic-bezier(.5,0,.7,1) .48s both',
        }}>
          {/* Inner halftone on the slab */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            backgroundImage: `radial-gradient(circle, ${toP.accent}33 1.2px, transparent 1.5px)`,
            backgroundSize: '10px 10px',
            opacity: 0.6, mixBlendMode: 'screen',
          }} />
        </div>
        {/* White flash overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#fff',
          opacity: 0,
          animation: 'tb-flash-bright .55s ease-out .25s both',
        }} />
        {/* Light streaks */}
        {[0.15, 0.25, 0.4, 0.55, 0.7, 0.85].map((y, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, top: `${y * 100}%`,
            height: 4 + (i % 3) * 2, width: '40%',
            background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? toP.accent : toP.accent2}, transparent)`,
            opacity: 0.85,
            transform: 'translateX(-100%) skewX(-20deg)',
            animation: `tb-streak ${.6 + (i % 3) * .15}s cubic-bezier(.4,.6,.5,1) ${.18 + i * .04}s both`,
            mixBlendMode: 'screen',
            boxShadow: `0 0 12px ${i % 2 === 0 ? toP.accent : toP.accent2}`,
          }} />
        ))}
        {/* Outgoing label falls off */}
        <div style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: "'Anton', sans-serif", fontSize: 'clamp(80px, 14vw, 220px)',
          color: fromP.ink, letterSpacing: 4,
          textShadow: `0 0 32px ${fromP.accent}, 0 0 64px ${fromP.accent2}`,
          animation: 'tb-fall-label .25s cubic-bezier(.5,.1,.7,.4) both',
        }}>{fromP.emoji} {fromP.label}</div>
        {/* Incoming label rises */}
        <div style={{
          position: 'absolute', top: '54%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: "'Anton', sans-serif", fontSize: 'clamp(80px, 14vw, 220px)',
          color: toP.ink, letterSpacing: 4,
          textShadow: `0 0 32px ${toP.accent}, 0 0 64px ${toP.accent2}`,
          animation: 'tb-rise-label .55s cubic-bezier(.3,1.4,.4,1) .35s both',
        }}>{toP.emoji} {toP.label}</div>
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────
  // useModeFlip — state machine for flipping with cinematic timing.
  //
  // Timing:
  //   t=0      → user fires onFlip
  //              overlay renders with `from` slab sweeping in
  //   t=400ms  → page content swaps mode (behind the slab so the user
  //              never sees a half-rendered cross-fade)
  //   t=900ms  → overlay clears
  //
  // Returns: [mode, flip, transition] where transition is null OR
  // { from, to, nonce } — pass directly to <ModeFlipOverlay>.
  // ────────────────────────────────────────────────────────────────────────
  window.useModeFlip = function useModeFlip(initial = 'gaming') {
    const [mode, setMode] = useState(initial);
    const [transition, setTransition] = useState(null);
    const busy = useRef(false);

    const flip = () => {
      if (busy.current) return;
      busy.current = true;
      const target = mode === 'gaming' ? 'football' : 'gaming';
      const nonce = Date.now();
      setTransition({ from: mode, to: target, nonce });
      // Swap behind the slab
      setTimeout(() => setMode(target), 400);
      // Clear overlay
      setTimeout(() => { setTransition(null); busy.current = false; }, 900);
    };

    // Allow external code (Tweaks panel, edit deck) to drive the flip via
    // a window-level event without prop-drilling.
    useEffect(() => {
      const handler = () => flip();
      window.addEventListener('khalil:flip', handler);
      return () => window.removeEventListener('khalil:flip', handler);
    }, [mode]);

    return [mode, flip, transition];
  };
})();
