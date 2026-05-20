// Direction D — Tunnel walkthrough (rewrite)
//
// Scroll-driven. The tunnel IS the site. As you scroll, you walk through a
// long corridor and lock onto each "room" in sequence:
//
//   HERO → REPLAYS → ABOUT → BOOK → SUBSCRIBE
//
// Each room appears in the distance ahead, grows as you walk toward it,
// locks at the camera for a beat (content readable, animations play), then
// fades out behind you as the next room approaches. Walls between rooms
// show ambient mode-themed content (video thumbnails / kit numbers
// streaming past you).
//
// Toggle gaming/football to morph the whole environment (palette, particles,
// destination type) live.

(function () {
const { useState, useEffect, useMemo } = React;
const K = window.KHALIL;
const { useScrollHero, useNonce, Burst, clamp, range, useModeFlip, TopBarMode, ModeFlipOverlay } = window;

// Robust scroll tracker — listens via rAF polling. Some sandboxed iframe
// contexts throttle rAF until first user interaction and some don't deliver
// scroll events on programmatic scrollTop, so a 60Hz setInterval fallback
// keeps progress in sync no matter what.
//
// Also: the immediate `overflow:auto` ancestor of the heroRef may be a
// chrome layer whose scrollHeight === clientHeight (no actual scroll). We
// walk past those and pick the first ancestor that ACTUALLY has overflowing
// content.
function useTunnelScroll() {
  const ref = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const [h, setH] = React.useState(600);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let parent = el.parentElement;
    while (parent) {
      const oy = getComputedStyle(parent).overflowY;
      const canScroll = (oy === 'auto' || oy === 'scroll') && parent.scrollHeight > parent.clientHeight + 4;
      if (canScroll) break;
      parent = parent.parentElement;
    }
    if (!parent) return;
    let last = -1;
    let lastH = -1;
    let rafId = 0;
    const tick = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const ph = parent.clientHeight;
      const pRect = parent.getBoundingClientRect();
      const wrapperTop = rect.top - pRect.top;
      const denom = Math.max(1, rect.height - ph);
      const p = Math.max(0, Math.min(1, -wrapperTop / denom));
      if (Math.abs(p - last) > 0.0008) { last = p; setProgress(p); }
      if (ph !== lastH) { lastH = ph; setH(ph); }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    const iv = setInterval(tick, 16);
    return () => { cancelAnimationFrame(rafId); clearInterval(iv); };
  }, []);
  return [ref, progress, h];
}

const F = {
  display: "'Anton', 'Bungee', 'Russo One', sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'DM Mono', ui-monospace, monospace",
};

// ── THEMES ───────────────────────────────────────────────────────────────
const THEMES = {
  gaming: {
    bgDeep:  '#020108',
    bgFar:   '#0a0530',
    bgMid:   '#1a0a3a',
    bgNear:  '#2a0f5a',
    fg:      '#ffffff',
    accent:  '#00f0ff',
    accent2: '#ff2bd6',
    accent3: '#ffe600',
    wallTint: 'rgba(0,240,255,0.18)',
    floorTint: 'rgba(255,43,214,0.12)',
    glow:    'rgba(0,240,255,0.7)',
    card:    'rgba(20,10,60,0.65)',
    cardBorder: 'rgba(0,240,255,0.45)',
    titleA:  'KHALIL',
    titleB:  'THE GOAT',
    role:    'STREAMER · GAMER · GOAT',
    chip:    [
      { l: 'RIG',    v: 'PS5 + RTX 4070' },
      { l: 'GAME',   v: 'FORTNITE — ZERO BUILD' },
      { l: 'STATUS', v: 'ONLINE · ON FIRE' },
    ],
    burstKind: 'neon',
    destLabel: 'STREAMING ROOM',
  },
  football: {
    bgDeep:  '#000814',
    bgFar:   '#001a3a',
    bgMid:   '#003366',
    bgNear:  '#0a4a6a',
    fg:      '#ffffff',
    accent:  '#ffd700',
    accent2: '#ffffff',
    accent3: '#4d8fff',
    wallTint: 'rgba(255,215,0,0.16)',
    floorTint: 'rgba(255,255,255,0.10)',
    glow:    'rgba(255,215,0,0.7)',
    card:    'rgba(0,30,90,0.65)',
    cardBorder: 'rgba(255,215,0,0.5)',
    titleA:  'KHALIL',
    titleB:  'NO. 7',
    role:    'STRIKER · MADRIDISTA · FOREVER 7',
    chip:    [
      { l: 'TEAM',   v: 'REAL MADRID' },
      { l: 'KIT',    v: 'HOME · #7' },
      { l: 'STATUS', v: 'READY · COLD' },
    ],
    burstKind: 'gold',
    destLabel: 'BERNABÉU TUNNEL',
  },
};

// ── SCENE TIMING ─────────────────────────────────────────────────────────
// Each scene owns a slice of overall scroll progress. Within its slice it
// approaches (depth 0→0.5), locks (depth 0.5), then exits (depth 0.5→1).
//
// depth meaning, with camera at 0.5:
//   0.0  = far ahead, very small + faint
//   0.5  = at camera, full size + opacity
//   1.0  = passed, scaled up huge + transparent (we walked through it)
//
// Ranges overlap deliberately so as one scene fades out (depth→1) the next
// is already fading in from far (depth→0). Last scene stays locked at the
// end (lockEnd = end) so the user never sees an empty corridor.
const SCENES = [
  { id: 'hero',      start: 0.00, end: 0.28, lockStart: 0.05, lockEnd: 0.15 },
  { id: 'replays',   start: 0.15, end: 0.46, lockStart: 0.22, lockEnd: 0.34 },
  { id: 'about',     start: 0.34, end: 0.64, lockStart: 0.40, lockEnd: 0.54 },
  { id: 'book',      start: 0.54, end: 0.82, lockStart: 0.60, lockEnd: 0.74 },
  { id: 'subscribe', start: 0.74, end: 1.00, lockStart: 0.82, lockEnd: 1.00 },
];

function sceneState(scene, p) {
  if (p < scene.start - 0.04 || p > scene.end + 0.02) return null;
  const local = (p - scene.start) / (scene.end - scene.start);
  const lsL = (scene.lockStart - scene.start) / (scene.end - scene.start);
  const leL = (scene.lockEnd   - scene.start) / (scene.end - scene.start);
  // depth 0→0.5 over [0, lsL], 0.5 over [lsL, leL], 0.5→1 over [leL, 1]
  let depth;
  if (local < lsL) depth = clamp(local / lsL, 0, 1) * 0.5;
  else if (local > leL && leL < 1) depth = 0.5 + clamp((local - leL) / (1 - leL), 0, 1) * 0.5;
  else depth = 0.5;
  // opacity: ramp in/out near edges so the scene doesn't pop
  let opacity = 1;
  if (depth < 0.18) opacity = clamp(depth / 0.18, 0, 1);
  if (depth > 0.82) opacity = clamp((1 - depth) / 0.18, 0, 1);
  // lockT: 0→1 through the lock window
  const lockT = clamp((local - lsL) / Math.max(0.01, leL - lsL), 0, 1);
  return { local, depth, opacity, lockT };
}

// Map depth → CSS scale + perspective Z offset.
// At depth=0 (far): scale 0.18.  At 0.5 (locked): 1.0.  At 1.0 (passed): 2.6
function depthToScale(depth) {
  if (depth <= 0.5) return 0.18 + (depth / 0.5) * 0.82; // 0.18 → 1.0
  return 1.0 + ((depth - 0.5) / 0.5) * 1.6;             // 1.0 → 2.6
}
function depthToBlur(depth) {
  // Blur far + very near
  if (depth < 0.2) return (0.2 - depth) * 16;
  if (depth > 0.7) return (depth - 0.7) * 14;
  return 0;
}

// ════════════════════════════════════════════════════════════════════════
// TUNNEL BACKGROUND — the corridor itself (always rendered, all scenes)
// ════════════════════════════════════════════════════════════════════════
const TunnelBG = ({ mode, t, p, size }) => {
  // Floor / ceiling perspective lines drift forward as we walk
  const lineCount = size === 'desktop' ? 14 : 10;
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${t.bgMid} 0%, ${t.bgFar} 40%, ${t.bgDeep} 90%)`,
      overflow: 'hidden',
    }}>
      <svg viewBox="0 0 400 400" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id={`floor-${mode}`} x1="0" y1="0.5" x2="0" y2="1">
            <stop offset="0%" stopColor={t.floorTint} stopOpacity="0" />
            <stop offset="100%" stopColor={t.floorTint} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`ceil-${mode}`} x1="0" y1="0.5" x2="0" y2="0">
            <stop offset="0%" stopColor={t.wallTint} stopOpacity="0" />
            <stop offset="100%" stopColor={t.wallTint} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Floor + ceiling gradient */}
        <rect x="0" y="200" width="400" height="200" fill={`url(#floor-${mode})`} opacity="0.6" />
        <rect x="0" y="0"   width="400" height="200" fill={`url(#ceil-${mode})`}  opacity="0.6" />
        {/* Floor lines */}
        <g opacity="0.55">
          {Array.from({ length: lineCount }).map((_, i) => {
            const dist = i / lineCount;
            const phase = (dist + p * 1.2) % 1;
            const y = 200 + phase * 260;
            const w = phase * 1400;
            return (
              <line key={`f-${i}`} x1={200 - w} y1={y} x2={200 + w} y2={y}
                stroke={t.accent} strokeWidth={0.3 + phase * 1.6} opacity={1 - phase * 0.5} />
            );
          })}
          {Array.from({ length: lineCount }).map((_, i) => {
            const dist = i / lineCount;
            const phase = (dist + p * 1.2) % 1;
            const y = 200 - phase * 260;
            const w = phase * 1400;
            return (
              <line key={`c-${i}`} x1={200 - w} y1={y} x2={200 + w} y2={y}
                stroke={t.accent2} strokeWidth={0.3 + phase * 1.6} opacity={1 - phase * 0.5} />
            );
          })}
          {/* Vanishing-point radials */}
          {[-3, -2, -1, 1, 2, 3].map(i => (
            <line key={`r-${i}`} x1={200} y1={200} x2={200 + i * 120} y2={i % 2 === 0 ? 400 : 0}
              stroke={i % 2 === 0 ? t.accent : t.accent2} strokeWidth="0.4" opacity="0.25" />
          ))}
        </g>
      </svg>
      {/* Particles drifting toward camera */}
      {Array.from({ length: 12 }).map((_, i) => {
        const lane = i % 4;
        const speed = 0.3 + lane * 0.2;
        const local = (i * 0.137 + p * speed) % 1;
        const sz = 2 + local * 5;
        const lateral = ((i * 53) % 100 - 50) / 100;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${50 + lateral * (15 + local * 60)}%`,
            top: `${50 + (lateral * 0.7) * (10 + local * 70)}%`,
            width: sz, height: sz, borderRadius: '50%',
            background: i % 3 === 0 ? t.accent2 : t.accent,
            boxShadow: `0 0 ${sz * 3}px ${i % 3 === 0 ? t.accent2 : t.accent}`,
            opacity: 0.35 + local * 0.55,
            pointerEvents: 'none',
          }} />
        );
      })}
    </div>
  );
};

// Wall content — between scene locks, slabs of video thumbs / posters
// stream past on the walls so you feel like the website is sliding past.
const TunnelWalls = ({ t, mode, p, size }) => {
  // Two strips per side, each with its own offset; built from K.videos
  const items = useMemo(() => {
    const v = K.videos;
    return [
      // left lane
      { side: 'l', tilt: 14,  items: [v[0], v[1], v[2], v[3]] },
      { side: 'l', tilt: 22,  items: [v[2], v[4], v[0], v[1]] },
      // right lane
      { side: 'r', tilt: -14, items: [v[1], v[4], v[3], v[0]] },
      { side: 'r', tilt: -22, items: [v[3], v[2], v[1], v[4]] },
    ];
  }, []);

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map((lane, li) => {
        const isL = lane.side === 'l';
        return lane.items.map((v, ii) => {
          // Each tile starts at depth (li*0.25 + ii*0.27 - p*1.4) wrapped
          const raw = (li * 0.18 + ii * 0.27 - p * 1.4);
          const phase = ((raw % 1) + 1) % 1;
          // scale follows perspective: small far, large near
          const scale = 0.15 + phase * 1.6;
          const lateral = (isL ? -1 : 1) * (12 + phase * 50);
          const verticalSway = lane.tilt * 0.05;
          const opacity = phase < 0.15
            ? phase / 0.15 * 0.55
            : phase > 0.85
              ? clamp((1 - phase) / 0.15, 0, 1) * 0.4
              : 0.55;
          // Determine if currently inside a scene-lock window — if so, dim walls
          const dim = SCENES.some(s => p > s.lockStart - 0.01 && p < s.lockEnd + 0.01) ? 0.5 : 1;
          const w = size === 'desktop' ? 160 : 120;
          const h = w * 0.6;
          return (
            <div key={`${li}-${ii}`} style={{
              position: 'absolute',
              left: `${50 + lateral}%`,
              top: '50%',
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${lane.tilt}deg)`,
              width: w, height: h,
              background: `linear-gradient(135deg, ${v.thumb.from}, ${v.thumb.to})`,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 6,
              opacity: opacity * dim,
              boxShadow: `0 0 ${20 * phase}px ${t.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40 * phase,
              filter: `blur(${Math.max(0, (0.18 - phase) * 30) + Math.max(0, (phase - 0.8) * 24)}px)`,
            }}>
              {phase > 0.4 && phase < 0.85 && (
                <span style={{ fontSize: 28 + phase * 30 }}>{v.thumb.emoji}</span>
              )}
            </div>
          );
        });
      })}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════
// ROOM SHELL — wraps a scene with depth-based scale/blur/opacity
// ════════════════════════════════════════════════════════════════════════
const Room = ({ depth, opacity, children, style }) => {
  const scale = depthToScale(depth);
  const blur = depthToBlur(depth);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: depth > 0.4 && depth < 0.6 ? 'auto' : 'none',
    }}>
      <div style={{
        transform: `scale(${scale})`,
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        transformOrigin: '50% 50%',
        willChange: 'transform, opacity',
        ...style,
      }}>{children}</div>
    </div>
  );
};

// Small scene-label tag pinned somewhere on the room
const SceneTag = ({ label, t }) => (
  <div style={{
    position: 'absolute', top: -36, left: 0,
    padding: '4px 10px',
    background: 'rgba(0,0,0,0.65)',
    border: `1px solid ${t.accent}`,
    fontFamily: F.mono, fontSize: 11, color: t.accent, letterSpacing: 2,
    textShadow: `0 0 8px ${t.accent}`,
  }}>▸ {label}</div>
);

// ════════════════════════════════════════════════════════════════════════
// SCENES
// ════════════════════════════════════════════════════════════════════════

// HERO room — title, sub counter, character orb
const HeroRoom = ({ t, mode, lockT, size }) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 760 : size === 'tablet' ? 640 : 360;
  const titleSize = isDesktop ? 140 : size === 'tablet' ? 110 : 64;
  return (
    <div style={{
      position: 'relative', width: w, padding: isDesktop ? 36 : 18,
      background: 'rgba(0,0,0,0.4)',
      border: `1px solid ${t.cardBorder}`,
      borderRadius: 16,
      backdropFilter: 'blur(4px)',
      boxShadow: `0 0 60px ${t.accent}33, inset 0 0 30px rgba(0,0,0,0.4)`,
    }}>
      <SceneTag label="01 · ENTER" t={t} />
      {/* Top: label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: isDesktop ? 14 : 8,
        opacity: lockT,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, boxShadow: `0 0 8px ${t.accent}` }} />
        <span style={{ fontFamily: F.mono, fontSize: isDesktop ? 13 : 10, color: t.accent, letterSpacing: 2.5 }}>{t.role}</span>
      </div>
      {/* Title pair */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: isDesktop ? 28 : 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, fontFamily: F.display, color: t.fg,
            fontSize: titleSize, lineHeight: 0.85, letterSpacing: -2,
            textShadow: `0 0 32px ${t.accent}66`,
            transform: `translateY(${(1 - lockT) * 30}px)`,
            opacity: lockT,
          }}>{t.titleA}</h1>
          <h1 style={{
            margin: 0, fontFamily: F.display, fontSize: titleSize, lineHeight: 0.85, letterSpacing: -2,
            background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: `drop-shadow(0 0 18px ${t.accent}80)`,
            transform: `translateY(${(1 - lockT) * 60}px)`,
            opacity: lockT,
            transitionDelay: '50ms',
          }}>{t.titleB}</h1>
        </div>
        {/* Character orb */}
        {isDesktop && (
          <div style={{
            width: 200, height: 200, flexShrink: 0,
            borderRadius: '50%',
            background: mode === 'gaming'
              ? 'conic-gradient(from 180deg at 50% 50%, #00f0ff, #b026ff, #ff2bd6, #ffe600, #00f0ff)'
              : 'conic-gradient(from 180deg at 50% 50%, #ffd700, #fff, #4d8fff, #fff, #ffd700)',
            position: 'relative',
            boxShadow: `0 0 60px ${t.accent}88, 0 16px 32px rgba(0,0,0,0.6)`,
            transform: `scale(${lockT})`,
            opacity: lockT,
          }}>
            <div style={{ position: 'absolute', inset: '6%', borderRadius: '50%', background: 'radial-gradient(circle at 30% 25%, rgba(0,0,0,0.85), rgba(0,0,0,0.55))' }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: F.display, fontSize: 140, color: t.fg,
              textShadow: `0 0 24px ${t.accent}`,
            }}>7</div>
          </div>
        )}
      </div>
      {/* Sub counter HUD */}
      <div style={{
        marginTop: isDesktop ? 18 : 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isDesktop ? '12px 16px' : '8px 12px',
        background: 'rgba(0,0,0,0.55)',
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 6,
        opacity: lockT,
        transform: `translateY(${(1 - lockT) * 20}px)`,
      }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: t.accent, letterSpacing: 2 }}>SUBS · {K.subs.goal} GOAL</div>
          <div style={{ fontFamily: F.display, fontSize: isDesktop ? 42 : 26, color: t.fg, lineHeight: 1, letterSpacing: -1 }}>
            {K.subs.current}
            <span style={{ fontSize: isDesktop ? 16 : 12, color: t.accent, marginLeft: 6 }}>/ {K.subs.goal}</span>
          </div>
        </div>
        <div style={{
          padding: isDesktop ? '10px 18px' : '6px 12px',
          background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
          color: '#0a0420', fontFamily: F.display, fontSize: isDesktop ? 16 : 12, letterSpacing: 2,
          clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
        }}>● ONLINE</div>
      </div>
      {/* Scroll hint */}
      <div style={{
        marginTop: 14, fontFamily: F.mono, fontSize: isDesktop ? 11 : 9,
        color: t.accent, letterSpacing: 2, textAlign: 'center',
        opacity: lockT * 0.7,
      }}>
        ↓ KEEP WALKING — REPLAYS AHEAD
      </div>
    </div>
  );
};

// REPLAYS room — featured + 4 side tiles
const ReplaysRoom = ({ t, lockT, size }) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 880 : size === 'tablet' ? 700 : 380;
  const featured = K.videos[0];
  const sides = K.videos.slice(1);
  return (
    <div style={{
      position: 'relative', width: w, padding: isDesktop ? 28 : 16,
      background: 'rgba(0,0,0,0.4)',
      border: `1px solid ${t.cardBorder}`,
      borderRadius: 16,
      backdropFilter: 'blur(4px)',
      boxShadow: `0 0 60px ${t.accent}33, inset 0 0 30px rgba(0,0,0,0.4)`,
    }}>
      <SceneTag label="02 · REPLAYS" t={t} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontFamily: F.display, fontSize: isDesktop ? 56 : 32, color: t.fg, letterSpacing: 0.5, lineHeight: 1 }}>
          REPLAYS<span style={{ color: t.accent }}>.</span>
        </h2>
        <span style={{ fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, color: t.accent, letterSpacing: 2 }}>
          {K.videos.length} CLIPS · {(K.videos.length * 1200 + '').slice(0,1)}K VIEWS
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr', gap: 10 }}>
        {/* Featured */}
        <div style={{
          position: 'relative',
          aspectRatio: '16/9',
          background: `linear-gradient(135deg, ${featured.thumb.from}, ${featured.thumb.to})`,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: 8, overflow: 'hidden',
          transform: `scale(${0.92 + lockT * 0.08}) translateY(${(1 - lockT) * 12}px)`,
          opacity: lockT,
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isDesktop ? 120 : 70, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))' }}>
            {featured.thumb.emoji}
          </div>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px)', pointerEvents: 'none' }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: isDesktop ? 70 : 44, height: isDesktop ? 70 : 44, borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
            boxShadow: `0 0 22px ${t.accent}, 0 4px 10px rgba(0,0,0,0.5)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0420', fontSize: isDesktop ? 26 : 16, fontWeight: 900,
          }}>▶</div>
          <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: 'rgba(0,0,0,0.7)', border: `1px solid ${t.accent}`, color: t.accent, fontFamily: F.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
            FEATURED
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontFamily: F.mono, fontSize: 10, fontWeight: 600 }}>
            {featured.duration}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))' }}>
            <div style={{ fontFamily: F.body, fontSize: isDesktop ? 18 : 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{featured.title}</div>
            <div style={{ marginTop: 3, fontFamily: F.mono, fontSize: 10, color: t.accent }}>{featured.views} · {featured.ago}</div>
          </div>
        </div>
        {/* Side stack */}
        <div style={{ display: 'grid', gridTemplateRows: isDesktop ? 'repeat(4, 1fr)' : 'auto', gridAutoRows: 'auto', gap: 6 }}>
          {sides.map((v, i) => (
            <div key={v.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 6,
              background: 'rgba(0,0,0,0.45)',
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 6,
              transform: `translateX(${(1 - lockT) * (i + 1) * 16}px)`,
              opacity: lockT,
              transitionDelay: `${i * 60}ms`,
            }}>
              <div style={{
                width: 60, height: 36, flexShrink: 0,
                background: `linear-gradient(135deg, ${v.thumb.from}, ${v.thumb.to})`,
                borderRadius: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{v.thumb.emoji}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {v.title}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: t.accent, marginTop: 1, letterSpacing: 0.5 }}>{v.views} · {v.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ABOUT room — bio paragraphs + status chips
const AboutRoom = ({ t, mode, lockT, size }) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 800 : size === 'tablet' ? 660 : 380;
  return (
    <div style={{
      position: 'relative', width: w, padding: isDesktop ? 32 : 18,
      background: 'rgba(0,0,0,0.45)',
      border: `1px solid ${t.cardBorder}`,
      borderRadius: 16,
      backdropFilter: 'blur(6px)',
      boxShadow: `0 0 60px ${t.accent}33, inset 0 0 30px rgba(0,0,0,0.4)`,
    }}>
      <SceneTag label="03 · ABOUT" t={t} />
      <div style={{ fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, color: t.accent, letterSpacing: 2.5, textTransform: 'uppercase', opacity: lockT }}>
        § ABOUT.SYS
      </div>
      <h2 style={{
        margin: '6px 0 14px', fontFamily: F.display, fontSize: isDesktop ? 64 : 38, color: t.fg, lineHeight: 0.95, letterSpacing: -1,
        transform: `translateY(${(1 - lockT) * 18}px)`, opacity: lockT,
      }}>
        PROFILE.<span style={{ color: t.accent }}>DAT</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr', gap: isDesktop ? 24 : 14, alignItems: 'start' }}>
        <div>
          {K.about.map((p, i) => (
            <p key={i} style={{
              fontFamily: F.body,
              fontSize: isDesktop ? 16 : 13,
              lineHeight: 1.55,
              color: i === 0 ? t.fg : 'rgba(255,255,255,0.78)',
              fontWeight: i === 0 ? 700 : 400,
              margin: '0 0 10px',
              transform: `translateY(${(1 - lockT) * (12 + i * 8)}px)`,
              opacity: lockT,
            }}>{p}</p>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {t.chip.map((c, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.55)',
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 6,
              transform: `translateX(${(1 - lockT) * 30}px)`,
              opacity: lockT,
              transitionDelay: `${i * 80}ms`,
            }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: t.accent, letterSpacing: 1.5 }}>{c.l}</div>
              <div style={{ fontFamily: F.display, fontSize: isDesktop ? 18 : 14, color: t.fg, lineHeight: 1.1, marginTop: 2 }}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// BOOK room — floating book in spotlight
const BookRoom = ({ t, mode, lockT, size }) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 760 : size === 'tablet' ? 620 : 380;
  return (
    <div style={{
      position: 'relative', width: w, padding: isDesktop ? 36 : 18,
      background: 'rgba(0,0,0,0.5)',
      border: `1px solid ${t.cardBorder}`,
      borderRadius: 16,
      backdropFilter: 'blur(6px)',
      boxShadow: `0 0 60px ${t.accent}40, inset 0 0 40px rgba(0,0,0,0.5)`,
    }}>
      <SceneTag label="04 · BOOK" t={t} />
      <div style={{ display: 'flex', gap: isDesktop ? 32 : 14, alignItems: 'center' }}>
        {/* The book */}
        <div style={{
          position: 'relative',
          width: isDesktop ? 200 : 100, height: isDesktop ? 270 : 138,
          flexShrink: 0,
          borderRadius: '2px 10px 10px 2px',
          background: `linear-gradient(135deg, ${t.bgMid} 0%, ${t.bgDeep} 100%)`,
          boxShadow: `-12px 14px 40px rgba(0,0,0,0.7), inset 4px 0 0 rgba(0,0,0,0.5), 0 0 50px ${t.accent}66`,
          padding: isDesktop ? 20 : 10,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          transform: `rotate(-5deg) scale(${0.85 + lockT * 0.15}) translateY(${(1 - lockT) * 18}px)`,
          opacity: lockT,
        }}>
          <div style={{ fontFamily: F.mono, fontSize: isDesktop ? 11 : 8, color: t.accent, letterSpacing: 2 }}>VOL.1</div>
          <div style={{ fontFamily: F.display, fontSize: isDesktop ? 30 : 16, color: '#fff', lineHeight: 0.95 }}>
            THE GOAT<br />CHRONICLES
          </div>
          {/* Spotlight beam */}
          <div aria-hidden style={{
            position: 'absolute', left: '50%', top: -120,
            width: 200, height: 200,
            transform: 'translateX(-50%)',
            background: `radial-gradient(circle, ${t.accent}88 0%, transparent 70%)`,
            opacity: lockT * 0.5, filter: 'blur(8px)',
          }} />
        </div>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, color: t.accent, letterSpacing: 2.5, opacity: lockT }}>
            UNLOCK · BOOK
          </div>
          <h3 style={{
            margin: '6px 0 10px', fontFamily: F.display, fontSize: isDesktop ? 56 : 30, color: t.fg, lineHeight: 0.95,
            transform: `translateY(${(1 - lockT) * 18}px)`, opacity: lockT,
          }}>
            WRITING<br /><span style={{ color: t.accent }}>A BOOK</span>
          </h3>
          <p style={{
            margin: 0, fontFamily: F.body, fontSize: isDesktop ? 17 : 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.45,
            opacity: lockT,
          }}>
            grandma started it last christmas. now i'm finishing it myself — stories, drawings, and the funniest stuff that happens at school.
          </p>
          <div style={{
            marginTop: 14, display: 'flex', flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 16 : 4,
            fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, letterSpacing: 1, color: t.accent,
            opacity: lockT,
          }}>
            <span>▸ {K.book.chapter.toUpperCase()}</span>
            <span>▸ DROPS SOON</span>
            <span>▸ PRE-ORDER NEXT MONTH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// SUBSCRIBE room — destination of the tunnel. Mode-specific scene + CTA.
const SubscribeRoom = ({ t, mode, lockT, size, onFire }) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 900 : size === 'tablet' ? 700 : 400;
  return (
    <div style={{
      position: 'relative', width: w, padding: isDesktop ? 40 : 22,
      background: 'rgba(0,0,0,0.55)',
      border: `2px solid ${t.accent}`,
      borderRadius: 18,
      backdropFilter: 'blur(8px)',
      boxShadow: `0 0 100px ${t.accent}, inset 0 0 60px rgba(0,0,0,0.6)`,
      textAlign: 'center',
    }}>
      <SceneTag label="05 · SUBSCRIBE" t={t} />
      {/* Mode-specific destination scene */}
      <div style={{
        position: 'relative', height: isDesktop ? 200 : 130, marginBottom: isDesktop ? 24 : 14,
        background: mode === 'gaming'
          ? `radial-gradient(ellipse at 50% 50%, ${t.bgMid} 0%, ${t.bgDeep} 80%)`
          : `linear-gradient(180deg, ${t.bgFar} 0%, #2d8a4a 100%)`,
        borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.cardBorder}`,
        opacity: lockT,
      }}>
        {mode === 'gaming' ? <GamingDest t={t} lockT={lockT} isDesktop={isDesktop} /> : <FootballDest t={t} lockT={lockT} isDesktop={isDesktop} />}
      </div>
      <div style={{
        fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, color: t.accent, letterSpacing: 3,
        opacity: lockT,
      }}>
        ▸ {t.destLabel}
      </div>
      <h2 style={{
        margin: '8px 0 6px', fontFamily: F.display, fontSize: isDesktop ? 84 : 48, color: t.fg, lineHeight: 0.9, letterSpacing: -1,
        transform: `translateY(${(1 - lockT) * 24}px)`, opacity: lockT,
      }}>
        HIT
        <span style={{
          background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}> 1K</span> WITH ME
      </h2>
      <p style={{
        margin: '0 auto 20px', fontFamily: F.body, fontSize: isDesktop ? 16 : 13, color: 'rgba(255,255,255,0.82)', maxWidth: 460, lineHeight: 1.5,
        opacity: lockT,
      }}>
        {K.subs.goal - K.subs.current} subs to go. if you're reading this, you're already a real one. one click and you're in.
      </p>
      <button onClick={onFire} style={{
        fontFamily: F.display, fontSize: isDesktop ? 32 : 22, letterSpacing: 2,
        color: mode === 'gaming' ? '#020108' : '#000814',
        background: `linear-gradient(180deg, ${t.accent} 0%, ${t.accent2} 100%)`,
        padding: isDesktop ? '20px 48px' : '14px 28px',
        border: 'none',
        clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
        boxShadow: `0 0 60px ${t.accent}, 0 8px 24px rgba(0,0,0,0.5)`,
        cursor: 'pointer',
        transform: `scale(${0.9 + lockT * 0.1})`, opacity: lockT,
      }}>▶ SUBSCRIBE</button>
      <div style={{
        marginTop: 16, display: 'flex', justifyContent: 'center', gap: isDesktop ? 16 : 8,
        opacity: lockT,
      }}>
        {['YT', 'TT', 'IG'].map(s => (
          <span key={s} style={{
            width: isDesktop ? 40 : 30, height: isDesktop ? 40 : 30, borderRadius: 6,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${t.cardBorder}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F.display, fontSize: isDesktop ? 14 : 11, color: t.fg, letterSpacing: 1,
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
};

// Destinations
const GamingDest = ({ t, lockT, isDesktop }) => (
  <>
    <div aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 240, height: 240, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 60%)`, filter: 'blur(8px)' }} />
    <div aria-hidden style={{
      position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
      width: isDesktop ? 220 : 160, height: isDesktop ? 130 : 90, borderRadius: 6,
      background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
      boxShadow: `0 0 50px ${t.accent}, inset 0 0 20px rgba(0,0,0,0.3)`,
    }}>
      <div style={{ position: 'absolute', inset: 4, background: 'rgba(0,0,0,0.25)', borderRadius: 3 }} />
      <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: F.mono, fontSize: 10, color: '#fff', textShadow: '0 0 6px rgba(0,0,0,0.6)' }}>● LIVE 744</div>
    </div>
    <div aria-hidden style={{ position: 'absolute', left: '50%', bottom: '8%', width: '70%', height: 4, background: '#000', transform: 'translateX(-50%)', boxShadow: `0 -2px 12px ${t.accent}50` }} />
  </>
);

const FootballDest = ({ t, lockT, isDesktop }) => (
  <>
    <div aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 220, height: 220, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, ${t.glow} 30%, transparent 70%)`, filter: 'blur(6px)' }} />
    <svg viewBox="0 0 400 200" style={{ position: 'absolute', left: '50%', bottom: 0, width: '60%', height: '70%', transform: 'translateX(-50%)' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id={`net-tunnel-${isDesktop}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0 L 8 8 M 0 8 L 8 0" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect x="80" y="40" width="240" height="150" fill={`url(#net-tunnel-${isDesktop})`} />
      <rect x="78" y="38" width="244" height="5" fill="#fff" />
      <rect x="78" y="38" width="5" height="153" fill="#fff" />
      <rect x="317" y="38" width="5" height="153" fill="#fff" />
    </svg>
    <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%', background: 'linear-gradient(180deg, transparent, rgba(10,74,42,0.7))' }} />
  </>
);

// ════════════════════════════════════════════════════════════════════════
// NAV — K-logo + room progress meter (mode toggle lives in TopBarMode above)
// ════════════════════════════════════════════════════════════════════════
const Nav = ({ mode, t, size, p }) => {
  const isPhone = size === 'phone';
  const isDesktop = size === 'desktop';
  const currentScene = SCENES.findLast ? SCENES.findLast(s => p >= s.start) : [...SCENES].reverse().find(s => p >= s.start);
  const idx = SCENES.findIndex(s => s.id === currentScene?.id);
  return (
    <div style={{
      padding: isPhone ? '8px 12px 6px' : isDesktop ? '14px 40px' : '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: isDesktop ? 38 : 28, height: isDesktop ? 38 : 28, borderRadius: 6,
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
          color: '#0a0420', fontFamily: F.display, fontSize: isDesktop ? 22 : 16,
          boxShadow: `0 0 16px ${t.accent}88`,
        }}>K</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: F.display, color: t.fg, fontSize: isDesktop ? 20 : 14, letterSpacing: 1.5, lineHeight: 1 }}>KHALIL</div>
          <div style={{ fontFamily: F.mono, color: t.accent, fontSize: isDesktop ? 10 : 8, letterSpacing: 1.5, marginTop: 2 }}>
            ROOM {idx + 1} / {SCENES.length} · {currentScene?.id.toUpperCase()}
          </div>
        </div>
      </div>
      {/* Progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {SCENES.map((s, i) => {
          const active = p >= s.lockStart && p <= s.lockEnd;
          const passed = p > s.lockEnd;
          return (
            <div key={s.id} style={{
              width: active ? (isPhone ? 18 : 28) : (isPhone ? 6 : 10), height: 4,
              borderRadius: 2,
              background: active ? t.accent : passed ? `${t.accent}60` : `${t.accent}20`,
              boxShadow: active ? `0 0 8px ${t.accent}` : 'none',
              transition: 'width .3s, background .3s, box-shadow .3s',
            }} />
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════════
const TunnelRoot = ({ size = 'phone' }) => {
  const [mode, flip, transition] = useModeFlip('gaming');
  const [boomN, fireBoom] = useNonce();
  const t = THEMES[mode];
  const transitioning = !!transition;

  const [heroRef, p, containerH] = useTunnelScroll();

  // Tall scroll track so each scene has comfortable lock time.
  // 5 scenes × ~containerH each = 5x the visible height. The sticky stage
  // pins the corridor in place while you scroll through.
  const trackH = Math.max(2000, containerH * 5);
  const stickyH = Math.max(560, containerH);

  // Compute state for each scene
  const states = SCENES.map(s => [s, sceneState(s, p)]);

  return (
    <div style={{
      position: 'relative', width: '100%', minHeight: '100%',
      background: t.bgDeep,
      transition: 'background .6s ease',
    }}>
      {/* Full-width mode toggle. Sticky so it stays visible while walking. */}
      <div style={{ position: 'sticky', top: 0, zIndex: 80 }}>
        <TopBarMode mode={mode} onFlip={flip} size={size} transitioning={transitioning} height={size === 'desktop' ? 76 : 60} />
      </div>

      {/* Tunnel wrapper — sticky stage inside */}
      <div ref={heroRef} style={{ position: 'relative', height: trackH }}>
        <div style={{ position: 'sticky', top: size === 'desktop' ? 76 : 60, height: stickyH, overflow: 'hidden' }}>
          {/* Layer 1: corridor BG */}
          <TunnelBG mode={mode} t={t} p={p} size={size} />
          {/* Layer 2: ambient wall content */}
          <TunnelWalls t={t} mode={mode} p={p} size={size} />
          {/* Layer 3: rooms */}
          {states.map(([scene, state]) => {
            if (!state) return null;
            const Comp =
              scene.id === 'hero'      ? HeroRoom :
              scene.id === 'replays'   ? ReplaysRoom :
              scene.id === 'about'     ? AboutRoom :
              scene.id === 'book'      ? BookRoom :
              scene.id === 'subscribe' ? SubscribeRoom : null;
            if (!Comp) return null;
            return (
              <Room key={scene.id} depth={state.depth} opacity={state.opacity}>
                <Comp t={t} mode={mode} lockT={state.lockT} size={size} onFire={fireBoom} />
              </Room>
            );
          })}
          {/* Layer 4: Nav (top) — K logo + room progress */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 70 }}>
            <Nav mode={mode} t={t} size={size} p={p} />
          </div>
          {/* Layer 5: bottom scroll cue */}
          <div style={{
            position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center',
            opacity: clamp((0.93 - p) * 6, 0, 1),
            pointerEvents: 'none', zIndex: 65,
          }}>
            <div style={{
              padding: '6px 14px',
              background: 'rgba(0,0,0,0.55)',
              border: `1px solid ${t.accent}`,
              borderRadius: 999,
              fontFamily: F.mono, fontSize: size === 'desktop' ? 12 : 10, color: t.accent, letterSpacing: 2,
              animation: 'k-bob-s 1.6s ease-in-out infinite',
            }}>↓ KEEP WALKING</div>
          </div>
        </div>
      </div>

      {/* Brief footer that scrolls in after the tunnel ends */}
      <div style={{
        padding: size === 'desktop' ? '40px 64px 80px' : '24px 16px 40px',
        background: t.bgDeep,
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: F.mono, fontSize: size === 'desktop' ? 12 : 10, color: t.accent, letterSpacing: 3 }}>
          ▸ TUNNEL CLEARED
        </div>
        <h2 style={{
          margin: '8px 0 16px',
          fontFamily: F.display, fontSize: size === 'desktop' ? 48 : 28,
          color: t.fg, letterSpacing: -1, lineHeight: 1,
        }}>
          THANKS FOR <span style={{ color: t.accent }}>WALKING</span>
        </h2>
        <p style={{ margin: '0 auto 18px', fontFamily: F.body, fontSize: size === 'desktop' ? 16 : 13, color: 'rgba(255,255,255,0.75)', maxWidth: 520, lineHeight: 1.5 }}>
          scroll up to walk back. tap the K-logo five times if you're khalil.
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6,
          fontFamily: F.mono, fontSize: size === 'desktop' ? 11 : 9, color: t.accent, letterSpacing: 1.5,
        }}>
          <span>KHALIL // 2026 //</span>
        </div>
      </div>

      {transition && <ModeFlipOverlay from={transition.from} to={transition.to} nonce={transition.nonce} />}
      {boomN > 0 && <Burst key={`b-${boomN}`} x={0.5} y={0.5} count={60} kind={t.burstKind} durationMs={1400} spread={360} />}
    </div>
  );
};

window.TunnelMobile  = () => <TunnelRoot size="phone" />;
window.TunnelTablet  = () => <TunnelRoot size="tablet" />;
window.TunnelDesktop = () => <TunnelRoot size="desktop" />;
})();
