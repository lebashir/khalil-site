// Direction C — Arena
// Full-bleed dual-mode environment. Gaming = neon HUD bunker. Football = night
// stadium. Same content, three sizes (phone/tablet/desktop) — layouts adapt.
//
// Wrapped in IIFE so internal section names don't collide.

(function () {
const { useState, useEffect } = React;
const K = window.KHALIL;
const { useInView, Burst, useNonce, useModeFlip, TopBarMode, ModeFlipOverlay } = window;

const F = {
  display: "'Anton', 'Bungee', 'Russo One', sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'DM Mono', ui-monospace, monospace",
};

const THEMES = {
  gaming: {
    bgA: '#08010c', bgB: '#1a0838', bgC: '#3a0a5a',
    fg: '#ffffff',
    accent: '#00f0ff',
    accent2: '#ff2bd6',
    accent3: '#ffe600',
    line: 'rgba(0,240,255,0.15)',
    card: 'rgba(60,30,120,0.45)',
    cardBorder: 'rgba(0,240,255,0.4)',
    ctaA: '#ff2bd6', ctaB: '#9a0096',
    label: 'LOADOUT',
    role: 'STREAMER', role2: 'GAMER', role3: 'GOAT',
    statLabel: ['K/D', 'WINS', 'STREAK', 'RANK'],
    statValue: ['4.2', '128', '11', 'GOAT'],
    burstKind: 'neon',
    titleA: 'KHALIL', titleB: 'THE GOAT',
    coverA: '#3a0a5a', coverB: '#1a0838',
  },
  football: {
    bgA: '#001233', bgB: '#003366', bgC: '#0a4a2a',
    fg: '#ffffff',
    accent: '#ffd700',
    accent2: '#ffffff',
    accent3: '#4d8fff',
    line: 'rgba(255,215,0,0.18)',
    card: 'rgba(0,30,90,0.55)',
    cardBorder: 'rgba(255,215,0,0.5)',
    ctaA: '#ffd700', ctaB: '#b58a00',
    label: 'LINEUP',
    role: 'STRIKER', role2: 'MADRIDISTA', role3: 'FOREVER 7',
    statLabel: ['GOALS', 'CAPS', 'TROPHIES', 'XG'],
    statValue: ['27', '34', '6', '0.71'],
    burstKind: 'gold',
    titleA: 'KHALIL', titleB: 'THE GOAT',
    coverA: '#003366', coverB: '#001233',
  },
};

// ── Background scenes (one per mode) ──────────────────────────────────────
const GamingBG = ({ t, size }) => (
  <>
    <div aria-hidden style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse at 50% 0%, ${t.bgC} 0%, ${t.bgB} 35%, ${t.bgA} 80%)`,
      transition: 'background .8s ease',
    }} />
    <div aria-hidden style={{
      position: 'absolute', inset: 0,
      backgroundImage: `linear-gradient(${t.line} 1px, transparent 1px), linear-gradient(90deg, ${t.line} 1px, transparent 1px)`,
      backgroundSize: size === 'desktop' ? '64px 64px' : '40px 40px',
      maskImage: 'linear-gradient(180deg, black, transparent 85%)',
      WebkitMaskImage: 'linear-gradient(180deg, black, transparent 85%)',
      opacity: 0.5,
    }} />
    <svg viewBox="0 0 400 800" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '60%', opacity: 0.4, pointerEvents: 'none' }} preserveAspectRatio="none">
      {[0.2, 0.3, 0.45, 0.62, 0.82].map((y, i) => (
        <line key={i} x1={-100 + i * 60} y1={y * 800} x2={500 - i * 60} y2={y * 800} stroke={t.accent} strokeWidth={0.6} opacity={0.4 + i * 0.1} />
      ))}
      {[-2, -1, 0, 1, 2].map((i) => (
        <line key={i} x1={200 + i * 20} y1={160} x2={200 + i * 400} y2={800} stroke={t.accent2} strokeWidth={0.6} opacity={0.3} />
      ))}
    </svg>
    <div aria-hidden style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)',
      mixBlendMode: 'overlay',
    }} />
    {Array.from({ length: size === 'desktop' ? 22 : 14 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        left: `${(i * 73) % 100}%`,
        bottom: -10, width: 3, height: 3, borderRadius: '50%',
        background: i % 3 === 0 ? t.accent2 : t.accent,
        boxShadow: `0 0 8px ${i % 3 === 0 ? t.accent2 : t.accent}`,
        animation: `k-rise-fade ${4 + (i % 4)}s linear ${i * 0.4}s infinite`,
        opacity: 0.85,
      }} />
    ))}
  </>
);

const FootballBG = ({ t, size }) => (
  <>
    <div aria-hidden style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(180deg, ${t.bgA} 0%, ${t.bgB} 35%, #0e2a55 65%, ${t.bgC} 100%)`,
      transition: 'background .8s ease',
    }} />
    <svg viewBox="0 0 400 800" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`cone1-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={t.accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`cone2-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="60,0 -80,800 200,800" fill={`url(#cone1-${size})`} />
      <polygon points="340,0 480,800 200,800" fill={`url(#cone2-${size})`} />
      <polygon points="200,0 100,800 300,800" fill={`url(#cone1-${size})`} opacity="0.5" />
    </svg>
    <div aria-hidden style={{
      position: 'absolute', left: 0, right: 0, top: '32%', height: 24,
      background: `radial-gradient(circle at 6px 12px, ${t.bgA} 5px, transparent 5px) 0 0/12px 24px, linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7))`,
      opacity: 0.6,
    }} />
    <div aria-hidden style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%',
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 24px, transparent 24px 48px)',
    }} />
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute', left: `${(i * 81) % 100}%`, top: -8,
        width: 4, height: 6,
        background: i % 2 === 0 ? t.accent : '#fff',
        animation: `k-rise-fade ${6 + (i % 3)}s linear ${i * 0.7}s infinite`,
        animationDirection: 'reverse',
        opacity: 0.6,
      }} />
    ))}
  </>
);

// ── Toggle ──────────────────────────────────────────────────────────────
const ArenaToggle = ({ mode, onFlip, t, size }) => {
  const isGaming = mode === 'gaming';
  const big = size === 'desktop';
  return (
    <button
      onClick={onFlip}
      style={{
        position: 'relative', display: 'inline-flex', padding: 4,
        background: 'rgba(0,0,0,0.5)',
        border: `1.5px solid ${t.cardBorder}`,
        borderRadius: 999,
        boxShadow: `0 0 14px ${t.accent}40, inset 0 0 8px rgba(0,0,0,0.6)`,
        cursor: 'pointer',
      }}
    >
      <span style={{
        position: 'absolute', top: 4, bottom: 4,
        left: isGaming ? 4 : 'calc(50% + 0px)',
        width: 'calc(50% - 4px)', borderRadius: 999,
        background: `linear-gradient(180deg, ${t.accent} 0%, ${t.accent2} 100%)`,
        boxShadow: `0 0 14px ${t.accent}, 0 2px 4px rgba(0,0,0,0.5)`,
        transition: 'left .4s cubic-bezier(.5,1.7,.3,1), background .6s ease',
      }} />
      <span style={{
        position: 'relative', zIndex: 1, padding: big ? '8px 16px' : '6px 11px',
        fontFamily: F.body, fontSize: big ? 13 : 11, fontWeight: 800, letterSpacing: 1,
        color: isGaming ? '#0a0420' : '#fff',
        textShadow: !isGaming ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
        transition: 'color .3s',
      }}>🎮 GAMING</span>
      <span style={{
        position: 'relative', zIndex: 1, padding: big ? '8px 16px' : '6px 11px',
        fontFamily: F.body, fontSize: big ? 13 : 11, fontWeight: 800, letterSpacing: 1,
        color: !isGaming ? '#001233' : '#fff',
        textShadow: isGaming ? '0 0 8px rgba(0,240,255,0.5)' : 'none',
        transition: 'color .3s',
      }}>⚽ FOOTBALL</span>
    </button>
  );
};

// ── Common primitives ────────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, style }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      animation: inView ? `k-pop-in .5s cubic-bezier(.2,1.3,.4,1) ${delay}ms both` : 'none',
      opacity: inView ? 1 : 0, ...style,
    }}>{children}</div>
  );
};

const HudCard = ({ children, t, style }) => (
  <div style={{
    position: 'relative',
    background: t.card,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 12,
    padding: 16,
    backdropFilter: 'blur(8px)',
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 28px rgba(0,0,0,0.5)`,
    transition: 'background .6s ease, border-color .6s ease',
    ...style,
  }}>
    {[0,1,2,3].map(c => {
      const cs = c === 0 ? { top: -1, left: -1 } : c === 1 ? { top: -1, right: -1 } : c === 2 ? { bottom: -1, left: -1 } : { bottom: -1, right: -1 };
      return (
        <span key={c} aria-hidden style={{
          position: 'absolute', ...cs, width: 10, height: 10,
          borderTop: c < 2 ? `2px solid ${t.accent}` : 'none',
          borderBottom: c >= 2 ? `2px solid ${t.accent}` : 'none',
          borderLeft: c % 2 === 0 ? `2px solid ${t.accent}` : 'none',
          borderRight: c % 2 === 1 ? `2px solid ${t.accent}` : 'none',
          transition: 'border-color .6s ease',
        }} />
      );
    })}
    {children}
  </div>
);

const HudLabel = ({ children, t, style }) => (
  <div style={{
    fontFamily: F.mono, fontSize: 10, fontWeight: 500,
    color: t.accent, letterSpacing: 2, textTransform: 'uppercase',
    transition: 'color .6s ease', ...style,
  }}>{children}</div>
);

// ── PolaroidStack ─ chunky character card stack ─────────────────────────
// Replaces the old iridescent orb. Three layered "cards" that swap content
// per mode (gaming = gamer card / squad polaroid / handwritten note,
// football = jersey card / pitch polaroid / cleats-tied-up note). Each card
// is angled, taped, and drops a long shadow so the whole stack looks like
// something pinned to a corkboard.
const PolaroidStack = ({ mode, t, size }) => {
  const isDesktop = size === 'desktop';
  const w = isDesktop ? 240 : size === 'tablet' ? 200 : 160;
  const h = isDesktop ? 300 : size === 'tablet' ? 250 : 200;

  // Per-mode card content
  const backCard = mode === 'gaming'
    ? { kind: 'big7', label: 'GAMERTAG', sub: '@khalilgaming2020', accent: t.accent }
    : { kind: 'big7', label: 'JERSEY',   sub: 'HOME · #7',         accent: t.accent };
  const midCard = mode === 'gaming'
    ? { kind: 'portrait', icon: '🎮', label: 'KHALIL · LVL 10', sub: '744 SUBS · ONLINE' }
    : { kind: 'portrait', icon: '⚽', label: 'KHALIL · NO. 7',  sub: 'STRIKER · LATE EQUALIZER GUY' };
  const frontCard = mode === 'gaming'
    ? { kind: 'note', text: "i'm khalil.\nand yeah i\nactually carry." }
    : { kind: 'note', text: "i'm khalil.\nthe ball does\nwhat i tell it." };

  // Stack container: explicit relative positioning so absolute children land
  // at known offsets. We pin each card via top/left + translate offset.
  return (
    <div style={{
      position: 'relative',
      width: w * 1.5, height: h * 1.45,
    }}>
      {/* Back card — tilted left, the "7" / gamertag emblem */}
      <CardEmblem
        card={backCard} mode={mode} t={t}
        style={{
          width: w, height: h,
          top: 0, left: 0,
          transform: `rotate(-9deg)`,
          zIndex: 1,
        }}
        size={size}
      />
      {/* Middle card — portrait, tilted right */}
      <CardPortrait
        card={midCard} mode={mode} t={t}
        style={{
          width: w, height: h,
          top: '8%', left: '30%',
          transform: `rotate(7deg)`,
          zIndex: 2,
        }}
        size={size}
      />
      {/* Front card — handwritten note, slight left tilt */}
      <CardNote
        card={frontCard} mode={mode} t={t}
        style={{
          width: w * 0.82, height: h * 0.5,
          top: '70%', left: '12%',
          transform: `rotate(-4deg)`,
          zIndex: 3,
        }}
        size={size}
      />
    </div>
  );
};

// Common chrome — the polaroid frame, tape, shadow. wraps children.
const Polaroid = ({ children, t, style, tapeColor = '#ffe48f', shadow = true }) => (
  <div style={{
    position: 'absolute',
    background: '#f3ede0',
    padding: 10,
    boxShadow: shadow ? '0 18px 38px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.3)' : 'none',
    transformOrigin: '50% 50%',
    transition: 'transform .6s cubic-bezier(.4,1.2,.4,1)',
    animation: 'k-bob 5s ease-in-out infinite',
    ...style,
  }}>
    {/* Tape — two strips on top corners */}
    <span aria-hidden style={{
      position: 'absolute', top: -8, left: '12%',
      width: 44, height: 16,
      background: tapeColor, opacity: 0.85,
      transform: 'rotate(-6deg)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }} />
    <span aria-hidden style={{
      position: 'absolute', top: -8, right: '12%',
      width: 44, height: 16,
      background: tapeColor, opacity: 0.85,
      transform: 'rotate(7deg)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }} />
    {children}
  </div>
);

// Big "7" emblem card — gradient bg + giant number
const CardEmblem = ({ card, mode, t, style, size }) => {
  const isDesktop = size === 'desktop';
  return (
    <Polaroid t={t} style={style} tapeColor="#a9d4ff">
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        background: mode === 'gaming'
          ? `linear-gradient(135deg, #1a0838 0%, #3a0a5a 50%, #ff2bd6 130%)`
          : `linear-gradient(135deg, #001233 0%, #003366 60%, #ffd700 140%)`,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* radial highlight */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 25% 20%, ${t.accent}55 0%, transparent 60%)`,
        }} />
        {/* halftone dots */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, ${t.accent}33 1.2px, transparent 1.5px)`,
          backgroundSize: '8px 8px',
          opacity: 0.5, mixBlendMode: 'screen',
        }} />
        <div style={{
          fontFamily: F.display,
          fontSize: isDesktop ? 240 : size === 'tablet' ? 180 : 140,
          color: '#fff',
          lineHeight: 0.85,
          textShadow: `0 0 30px ${t.accent}, 0 6px 0 rgba(0,0,0,0.5), 0 10px 24px rgba(0,0,0,0.6)`,
          letterSpacing: -8,
        }}>7</div>
        {/* Corner brackets */}
        {[
          { c: 'tl', t: 6, l: 6 },
          { c: 'tr', t: 6, r: 6 },
          { c: 'bl', b: 6, l: 6 },
          { c: 'br', b: 6, r: 6 },
        ].map(c => (
          <span key={c.c} aria-hidden style={{
            position: 'absolute', top: c.t, bottom: c.b, left: c.l, right: c.r,
            width: 14, height: 14,
            borderTop: c.t !== undefined ? `2px solid ${t.accent}` : 'none',
            borderBottom: c.b !== undefined ? `2px solid ${t.accent}` : 'none',
            borderLeft: c.l !== undefined ? `2px solid ${t.accent}` : 'none',
            borderRight: c.r !== undefined ? `2px solid ${t.accent}` : 'none',
          }} />
        ))}
      </div>
      <div style={{
        marginTop: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: F.mono, fontSize: 9, color: '#3a2a14', letterSpacing: 1.5,
      }}>
        <span>{card.label}</span>
        <span>{card.sub}</span>
      </div>
    </Polaroid>
  );
};

// Portrait card — colored bg + emoji "face" placeholder
const CardPortrait = ({ card, mode, t, style, size }) => {
  const isDesktop = size === 'desktop';
  return (
    <Polaroid t={t} style={style} tapeColor="#ffb8b8">
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        background: mode === 'gaming'
          ? `radial-gradient(ellipse at 50% 30%, ${t.accent}55 0%, #1a0838 70%)`
          : `radial-gradient(ellipse at 50% 30%, ${t.accent}40 0%, #001233 70%)`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Portrait "frame" — circle ring */}
        <div style={{
          width: '60%', aspectRatio: '1',
          borderRadius: '50%',
          background: mode === 'gaming'
            ? `linear-gradient(180deg, #0e0625 0%, #2a0f5a 100%)`
            : `linear-gradient(180deg, #0a4a6a 0%, #002a55 100%)`,
          border: `3px solid ${t.accent}`,
          boxShadow: `0 0 24px ${t.accent}, inset 0 0 16px rgba(0,0,0,0.5)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isDesktop ? 90 : size === 'tablet' ? 70 : 60,
        }}>{card.icon}</div>
        {/* Caption strip */}
        <div style={{
          marginTop: 12,
          padding: '4px 10px',
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${t.cardBorder}`,
          fontFamily: F.mono, fontSize: isDesktop ? 11 : 9,
          color: t.accent, letterSpacing: 1.5,
        }}>{card.sub}</div>
        {/* Scanline overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)',
          pointerEvents: 'none',
        }} />
      </div>
      {/* Polaroid bottom caption */}
      <div style={{
        marginTop: 8,
        fontFamily: F.body, fontSize: isDesktop ? 14 : 12,
        color: '#3a2a14', fontWeight: 700,
        textAlign: 'center',
      }}>{card.label}</div>
    </Polaroid>
  );
};

// Handwritten note card — paper texture + scribbled marker
const CardNote = ({ card, t, mode, style, size }) => {
  const isDesktop = size === 'desktop';
  return (
    <Polaroid t={t} style={{ ...style, padding: 14, background: '#fef9e6' }} tapeColor="#7ec6c2" shadow>
      {/* Lined paper */}
      <div aria-hidden style={{
        position: 'absolute', inset: 14,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 18px, rgba(120,90,40,0.18) 18px 19px)',
        pointerEvents: 'none',
      }} />
      {/* Red margin line */}
      <div aria-hidden style={{
        position: 'absolute', top: 14, bottom: 14, left: 32,
        width: 1, background: '#d44545', opacity: 0.5,
      }} />
      <div style={{
        position: 'relative',
        padding: '4px 4px 4px 28px',
        fontFamily: "'Caveat', 'Bradley Hand', cursive, sans-serif",
        fontSize: isDesktop ? 26 : size === 'tablet' ? 22 : 18,
        lineHeight: 1.15,
        color: '#1a1310', fontWeight: 700,
        whiteSpace: 'pre-line',
        transform: 'rotate(-1deg)',
      }}>{card.text}</div>
      {/* Signature swoosh */}
      <svg viewBox="0 0 80 30" style={{
        position: 'absolute', bottom: 16, right: 16,
        width: 70, height: 26, transform: 'rotate(4deg)',
      }}>
        <path d="M2 18 Q 12 4, 24 16 T 50 14 Q 60 8, 76 22"
          fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </Polaroid>
  );
};

// FloatingTag — small ID-card style chip pinned at corner of hero
const FloatingTag = ({ label, value, t, position, delay }) => (
  <div style={{
    position: 'absolute', ...position,
    background: 'rgba(0,0,0,0.7)',
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 4,
    padding: '6px 10px 6px 26px',
    backdropFilter: 'blur(6px)',
    animation: `k-bob-s 4s ease-in-out ${delay} infinite`,
    transition: 'border-color .6s ease',
    zIndex: 10,
  }}>
    {/* Lanyard hole + tag-clip */}
    <span aria-hidden style={{
      position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
      width: 8, height: 8, borderRadius: '50%',
      border: `1.5px solid ${t.accent}`,
      background: 'rgba(0,0,0,0.7)',
      boxShadow: `0 0 6px ${t.accent}`,
      transition: 'border-color .6s ease, box-shadow .6s ease',
    }} />
    <div style={{ fontFamily: F.mono, fontSize: 9, color: t.accent, letterSpacing: 1.5, transition: 'color .6s ease' }}>{label}</div>
    <div style={{ fontFamily: F.display, fontSize: 22, color: '#fff', lineHeight: 1 }}>{value}</div>
  </div>
);

// ── Hero (responsive) ────────────────────────────────────────────────────
const Hero = ({ mode, t, size, onBoom }) => {
  const m = K.modes[mode];
  const isDesktop = size === 'desktop';
  const isTablet  = size === 'tablet';

  // Sizing
  const titleA = isDesktop ? 200 : isTablet ? 140 : 80;
  const titleB = isDesktop ? 160 : isTablet ? 112 : 64;
  const bioSize = isDesktop ? 20 : isTablet ? 17 : 14;

  // Layout: desktop puts character on right; phone/tablet stack
  const characterPanel = (
    <div style={{
      position: 'relative',
      width: isDesktop ? 400 : '100%',
      minHeight: isDesktop ? 480 : (isTablet ? 380 : 280),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: isDesktop ? 0 : '24px 0 0',
    }}>
      {/* Polaroid stack — three crooked cards layered up. Replaces the
          generic iridescent orb with something that feels like a kid's
          collage. Each card is mode-aware: gamertag / portrait / handwritten
          note. */}
      <PolaroidStack mode={mode} t={t} size={size} />

      {/* Floating stat bubbles — kept but pushed further out and styled as
          ID-card tags */}
      <FloatingTag
        label="SUBS"
        value={K.subs.current}
        t={t}
        position={{ right: isDesktop ? -16 : isTablet ? 24 : 8, top: isDesktop ? 28 : isTablet ? 16 : 4 }}
        delay="0s"
      />
      <FloatingTag
        label="RANK"
        value="GOAT"
        t={t}
        position={{ left: isDesktop ? -16 : isTablet ? 24 : 8, bottom: isDesktop ? 70 : isTablet ? 30 : 14 }}
        delay=".8s"
      />
    </div>
  );

  const textPanel = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, boxShadow: `0 0 8px ${t.accent}`, transition: 'background .6s ease, box-shadow .6s ease' }} />
          <span style={{ fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, color: t.accent, letterSpacing: 2.5, textTransform: 'uppercase', transition: 'color .6s ease' }}>
            {t.role} · {t.role2} · {t.role3}
          </span>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <h1 style={{
          margin: 0, fontFamily: F.display, color: t.fg,
          fontSize: titleA, lineHeight: 0.86, letterSpacing: -1,
          textShadow: `0 0 32px ${t.accent}60, 0 4px 24px rgba(0,0,0,0.6)`,
          transition: 'text-shadow .6s ease',
        }}>{t.titleA}</h1>
      </Reveal>
      <Reveal delay={180}>
        <h1 style={{
          margin: 0, fontFamily: F.display,
          fontSize: titleB, lineHeight: 0.86, letterSpacing: -1,
          background: `linear-gradient(180deg, ${t.accent} 0%, ${t.accent2} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          filter: `drop-shadow(0 0 18px ${t.accent}80)`,
          transition: 'filter .6s ease',
        }}>{t.titleB}</h1>
      </Reveal>

      <Reveal delay={280}>
        <p key={mode + '-bio'} style={{
          margin: isDesktop ? '24px 0 26px' : '12px 0 16px',
          maxWidth: isDesktop ? 520 : 'none',
          fontFamily: F.body, fontSize: bioSize, lineHeight: 1.5,
          color: 'rgba(255,255,255,0.85)',
          animation: 'k-stamp-in .5s cubic-bezier(.2,1.2,.4,1) both',
        }}>{m.bio}</p>
      </Reveal>

      <Reveal delay={380}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onBoom} style={{
            position: 'relative',
            fontFamily: F.display, fontSize: isDesktop ? 24 : 18, letterSpacing: 1,
            color: mode === 'gaming' ? '#0a0420' : '#001233',
            background: `linear-gradient(180deg, ${t.ctaA} 0%, ${t.ctaB} 100%)`,
            padding: isDesktop ? '18px 32px' : '14px 24px',
            border: 'none',
            clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
            boxShadow: `0 0 24px ${t.accent}50`,
            cursor: 'pointer',
            transition: 'background .6s ease, box-shadow .6s ease',
          }}>▶ SUBSCRIBE</button>
          <button style={{
            fontFamily: F.display, fontSize: isDesktop ? 18 : 14, letterSpacing: 1, color: t.fg,
            background: 'transparent',
            border: `1.5px solid ${t.accent}`,
            padding: isDesktop ? '14px 22px' : '10px 16px',
            clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
            cursor: 'pointer',
            transition: 'border-color .6s ease',
          }}>WATCH →</button>
        </div>
      </Reveal>

      <Reveal delay={460}>
        <div key={mode + '-stats'} style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
          marginTop: isDesktop ? 36 : 22,
        }}>
          {t.statLabel.map((l, i) => (
            <div key={l} style={{
              padding: isDesktop ? '14px 8px' : '8px 6px',
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 6,
              textAlign: 'center',
              animation: `k-pop-in .4s cubic-bezier(.2,1.4,.4,1) ${i * 60}ms both`,
            }}>
              <div style={{ fontFamily: F.mono, fontSize: isDesktop ? 10 : 8, color: t.accent, letterSpacing: 1.5, transition: 'color .6s ease' }}>{l}</div>
              <div style={{ fontFamily: F.display, fontSize: isDesktop ? 36 : 22, color: t.fg, lineHeight: 1, marginTop: 2 }}>{t.statValue[i]}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );

  if (isDesktop) {
    return (
      <div style={{
        position: 'relative', padding: '40px 64px 0',
        display: 'grid', gridTemplateColumns: '1fr 360px', gap: 60, alignItems: 'center',
      }}>
        {textPanel}
        {characterPanel}
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', padding: isTablet ? '24px 32px 16px' : '8px 14px 16px' }}>
      {textPanel}
      {characterPanel}
    </div>
  );
};

// ── Sub HUD ──────────────────────────────────────────────────────────────
const SubsHud = ({ t, size }) => {
  const pct = (K.subs.current / K.subs.goal) * 100;
  const isDesktop = size === 'desktop';
  return (
    <div style={{ padding: isDesktop ? '24px 64px 0' : '4px 14px 14px' }}>
      <Reveal>
        <HudCard t={t} style={{ padding: isDesktop ? 24 : 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <HudLabel t={t}>SUBSCRIBERS · GOAL</HudLabel>
            <span style={{ fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, color: t.accent2, letterSpacing: 1, transition: 'color .6s ease' }}>{(100 - pct).toFixed(0)}% TO GO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
            <span style={{ fontFamily: F.display, fontSize: isDesktop ? 72 : 44, color: t.fg, lineHeight: 1, letterSpacing: -1 }}>{K.subs.current}</span>
            <span style={{ fontFamily: F.display, fontSize: isDesktop ? 24 : 16, color: t.accent, transition: 'color .6s ease' }}>/ {K.subs.goal}</span>
          </div>
          <div style={{ marginTop: 10, height: isDesktop ? 12 : 8, background: 'rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden', border: `1px solid ${t.cardBorder}`, transition: 'border-color .6s ease' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})`,
              boxShadow: `0 0 10px ${t.accent}`,
              transition: 'background .6s ease, box-shadow .6s ease',
            }} />
          </div>
        </HudCard>
      </Reveal>
    </div>
  );
};

// ── Now / Status dock ────────────────────────────────────────────────────
const NowDock = ({ mode, t, size }) => {
  const n = K.now[mode];
  const items = [
    { l: mode === 'gaming' ? 'EQUIPPED' : 'STARTING XI', v: n.playing },
    { l: mode === 'gaming' ? 'WATCHING' : 'POST-MATCH', v: n.watching },
    { l: 'READING', v: n.reading },
    { l: mode === 'gaming' ? 'OST' : 'WALKOUT MUSIC', v: n.listening },
  ];
  const isDesktop = size === 'desktop';
  return (
    <div style={{ padding: isDesktop ? '24px 64px 0' : '0 14px 14px' }}>
      <Reveal>
        <HudCard t={t} style={{ padding: isDesktop ? 24 : 16 }}>
          <HudLabel t={t}>{t.label} · THIS WEEK</HudLabel>
          <div key={mode} style={{
            marginTop: 12,
            display: isDesktop ? 'grid' : 'flex',
            flexDirection: isDesktop ? undefined : 'column',
            gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined,
            gap: isDesktop ? 14 : 8,
          }}>
            {items.map((it, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', gap: 10,
                paddingBottom: 6,
                borderBottom: !isDesktop && i < items.length - 1 ? `1px dashed ${t.cardBorder}` : 'none',
                animation: `k-stamp-in .4s cubic-bezier(.2,1.2,.4,1) ${i * 70}ms both`,
              }}>
                <span style={{ fontFamily: F.mono, fontSize: isDesktop ? 10 : 9, color: t.accent, letterSpacing: 1.5, minWidth: isDesktop ? 110 : 80, transition: 'color .6s ease' }}>{it.l}</span>
                <span style={{ fontFamily: F.body, fontSize: isDesktop ? 15 : 13, color: t.fg, fontWeight: 500 }}>{it.v}</span>
              </div>
            ))}
          </div>
        </HudCard>
      </Reveal>
    </div>
  );
};

// ── Videos ───────────────────────────────────────────────────────────────
// Trading-card style: holographic shimmer, rarity tag, sharp die-cut frame.
// Each video gets a tier — first one LEGENDARY, then EPIC/RARE/COMMON.
const TIERS = ['LEGENDARY', 'EPIC', 'RARE', 'EPIC', 'COMMON'];
const TIER_COLORS = { LEGENDARY: ['#ffd700', '#ff8a00'], EPIC: ['#ff2bd6', '#7a26ff'], RARE: ['#00f0ff', '#4d8fff'], COMMON: ['#9ab1bd', '#5a6a78'] };

const VideoTile = ({ video, t, big, tier = 'COMMON' }) => {
  const tc = TIER_COLORS[tier];
  return (
    <div style={{
      position: 'relative',
      borderRadius: 4, overflow: 'hidden',
      aspectRatio: big ? '16/10' : '16/12',
      // Sharp die-cut polygon corners — sports card silhouette
      clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)',
      background: `linear-gradient(135deg, ${video.thumb.from}, ${video.thumb.to})`,
      boxShadow: `0 12px 24px rgba(0,0,0,0.55), 0 0 0 1px ${tc[0]}55, 0 0 24px ${tc[0]}33`,
      transition: 'transform .2s, box-shadow .2s',
    }}>
      {/* Tier frame inset */}
      <div aria-hidden style={{
        position: 'absolute', inset: 4,
        border: `1.5px solid ${tc[0]}`,
        borderRadius: 2,
        boxShadow: `inset 0 0 12px ${tc[0]}44`,
        clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
      {/* Holographic foil sheen */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(115deg, transparent 30%, ${tc[0]}33 45%, ${tc[1]}44 50%, ${tc[0]}33 55%, transparent 70%)`,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        opacity: 0.7,
      }} />
      {/* Big emoji */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: big ? 110 : 60, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }}>
        {video.thumb.emoji}
      </div>
      {/* Scanlines */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px)', pointerEvents: 'none' }} />
      {/* Top-left: rarity tag */}
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 3,
        padding: '3px 8px',
        background: `linear-gradient(180deg, ${tc[0]} 0%, ${tc[1]} 100%)`,
        color: '#0a0420', fontFamily: F.display, fontSize: 9, letterSpacing: 1.5,
        clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
        boxShadow: `0 2px 8px ${tc[0]}88`,
      }}>{tier}</div>
      {/* Top-right: duration */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 3,
        padding: '3px 8px',
        background: 'rgba(0,0,0,0.8)', color: '#fff',
        fontFamily: F.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
      }}>{video.duration}</div>
      {/* Stats badge — bottom right */}
      <div style={{
        position: 'absolute', top: big ? 38 : 30, right: 10, zIndex: 3,
        padding: '2px 6px',
        background: 'rgba(0,0,0,0.65)',
        border: `1px solid ${tc[0]}`,
        fontFamily: F.mono, fontSize: 8, letterSpacing: 1, color: tc[0],
      }}>{video.tag.toUpperCase()}</div>
      {/* Play */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: big ? 64 : 36, height: big ? 64 : 36, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, #fff 0%, ${tc[0]} 30%, ${tc[1]} 100%)`,
        boxShadow: `0 0 22px ${tc[0]}, 0 4px 10px rgba(0,0,0,0.5)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#0a0420', fontSize: big ? 22 : 13, fontWeight: 900,
        zIndex: 3,
      }}>▶</div>
      {/* Bottom info plate */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 12px 12px', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.9))', zIndex: 3 }}>
        <div style={{ fontFamily: F.body, fontSize: big ? 15 : 11, fontWeight: 700, color: '#fff', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
          {video.title}
        </div>
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: tc[0], letterSpacing: 0.5, fontWeight: 700 }}>
            ▸ {video.views}
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
            {video.ago}
          </span>
        </div>
      </div>
    </div>
  );
};

const Videos = ({ t, size }) => {
  const isDesktop = size === 'desktop';
  const isTablet  = size === 'tablet';
  return (
    <div style={{ padding: isDesktop ? '32px 64px 0' : '4px 14px 14px' }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: isDesktop ? 18 : 10 }}>
          <h2 style={{ margin: 0, fontFamily: F.display, fontSize: isDesktop ? 64 : 32, color: t.fg, letterSpacing: 0.5, lineHeight: 1 }}>
            REPLAYS<span style={{ color: t.accent, transition: 'color .6s ease' }}>.</span>
          </h2>
          <span style={{ fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, color: t.accent, letterSpacing: 2, transition: 'color .6s ease' }}>SEE ALL →</span>
        </div>
      </Reveal>
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <Reveal><VideoTile video={K.videos[0]} t={t} big tier={TIERS[0]} /></Reveal>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 14 }}>
            {K.videos.slice(1, 3).map((v, i) => (
              <Reveal key={v.id} delay={(i + 1) * 60}><VideoTile video={v} t={t} tier={TIERS[i + 1]} /></Reveal>
            ))}
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {K.videos.slice(3).map((v, i) => (
              <Reveal key={v.id} delay={(i + 3) * 60}><VideoTile video={v} t={t} tier={TIERS[i + 3]} /></Reveal>
            ))}
          </div>
        </div>
      ) : isTablet ? (
        <>
          <Reveal><div style={{ marginBottom: 10 }}><VideoTile video={K.videos[0]} t={t} big tier={TIERS[0]} /></div></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {K.videos.slice(1).map((v, i) => (
              <Reveal key={v.id} delay={(i + 1) * 60}><VideoTile video={v} t={t} tier={TIERS[i + 1]} /></Reveal>
            ))}
          </div>
        </>
      ) : (
        <>
          <Reveal delay={80}><div style={{ marginBottom: 8 }}><VideoTile video={K.videos[0]} t={t} big tier={TIERS[0]} /></div></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {K.videos.slice(1).map((v, i) => (
              <Reveal key={v.id} delay={(i + 1) * 60}><VideoTile video={v} t={t} tier={TIERS[i + 1]} /></Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── About ───────────────────────────────────────────────────────────────
const About = ({ t, size }) => {
  const isDesktop = size === 'desktop';
  return (
    <div style={{ padding: isDesktop ? '32px 64px 0' : '4px 14px 14px' }}>
      <Reveal>
        <HudCard t={t} style={{ padding: isDesktop ? 32 : 16 }}>
          <HudLabel t={t}>§ ABOUT.SYS</HudLabel>
          <h2 style={{ margin: '6px 0 14px', fontFamily: F.display, fontSize: isDesktop ? 56 : 36, color: t.fg, lineHeight: 0.95, letterSpacing: -0.5 }}>
            PROFILE.<span style={{ color: t.accent, transition: 'color .6s ease' }}>DAT</span>
          </h2>
          <div style={{ maxWidth: isDesktop ? 720 : 'none' }}>
            {K.about.map((p, i) => (
              <p key={i} style={{ fontFamily: F.body, fontSize: isDesktop ? 17 : 14, lineHeight: 1.55, color: i === 0 ? t.fg : 'rgba(255,255,255,0.78)', margin: '0 0 10px', fontWeight: i === 0 ? 600 : 400 }}>
                {p}
              </p>
            ))}
          </div>
        </HudCard>
      </Reveal>
    </div>
  );
};

// ── Book ────────────────────────────────────────────────────────────────
// "Sacred / handmade" treatment. The book sits on a piece of notebook paper
// (lined, with the red margin) inside the dark hud card — like khalil
// ripped a page out and pinned it to his wall. Title is marker handwriting.
const Book = ({ t, size }) => {
  const isDesktop = size === 'desktop';
  return (
    <div style={{ padding: isDesktop ? '32px 64px 32px' : '4px 14px 16px' }}>
      <Reveal>
        <HudCard t={t} style={{ padding: isDesktop ? 32 : 16 }}>
          <HudLabel t={t}>UNLOCK · {K.book.chapter.toUpperCase()}</HudLabel>
          {/* Inner "paper" */}
          <div style={{
            position: 'relative',
            marginTop: 12,
            background: '#fef9e6',
            padding: isDesktop ? '28px 32px' : '20px 14px',
            borderRadius: 4,
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), 0 14px 28px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            transform: 'rotate(-0.4deg)',
          }}>
            {/* Notebook lines */}
            <div aria-hidden style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 24px, rgba(100,80,40,0.18) 24px 25px)',
              pointerEvents: 'none',
            }} />
            {/* Red margin line */}
            <div aria-hidden style={{
              position: 'absolute', top: 0, bottom: 0,
              left: isDesktop ? 60 : 36,
              width: 1, background: '#d44545', opacity: 0.45,
            }} />
            {/* Three torn-paper holes on the left, casual */}
            {[0.18, 0.5, 0.82].map((y, i) => (
              <span key={i} aria-hidden style={{
                position: 'absolute', left: 14, top: `${y * 100}%`,
                width: 12, height: 12, borderRadius: '50%',
                background: '#0a0420',
                boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.6)',
              }} />
            ))}
            {/* Tape — top right */}
            <span aria-hidden style={{
              position: 'absolute', top: -10, right: 24,
              width: 70, height: 22,
              background: 'rgba(126,198,194,0.65)',
              transform: 'rotate(8deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }} />
            {/* Tape — bottom left */}
            <span aria-hidden style={{
              position: 'absolute', bottom: -10, left: '38%',
              width: 60, height: 18,
              background: 'rgba(255,184,184,0.65)',
              transform: 'rotate(-6deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }} />

            <div style={{
              position: 'relative',
              paddingLeft: isDesktop ? 60 : 44,
              display: 'flex', gap: isDesktop ? 28 : 14, alignItems: 'center',
            }}>
              {/* The book — chunky, with a real spine + raised cover */}
              <div style={{
                position: 'relative', flexShrink: 0,
                width: isDesktop ? 200 : 100,
                height: isDesktop ? 280 : 138,
                transform: 'rotate(-5deg)',
              }}>
                {/* Stacked-pages shadow underneath */}
                <div aria-hidden style={{
                  position: 'absolute', inset: 0,
                  background: '#f5ecd3',
                  transform: 'translate(6px, 6px)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                }} />
                <div aria-hidden style={{
                  position: 'absolute', inset: 0,
                  background: '#ede1c2',
                  transform: 'translate(3px, 3px)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                }} />
                {/* Cover */}
                <div style={{
                  position: 'relative',
                  width: '100%', height: '100%',
                  borderRadius: '2px 6px 6px 2px',
                  background: `linear-gradient(135deg, ${t.coverA} 0%, ${t.coverB} 100%)`,
                  boxShadow: `-12px 14px 30px rgba(0,0,0,0.5), inset 4px 0 0 rgba(0,0,0,0.45), 0 0 30px ${t.accent}50`,
                  padding: isDesktop ? 20 : 11,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  overflow: 'hidden',
                  transition: 'background .6s ease, box-shadow .6s ease',
                }}>
                  {/* Cover halftone */}
                  <div aria-hidden style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `radial-gradient(circle, ${t.accent}40 1px, transparent 1.5px)`,
                    backgroundSize: '6px 6px',
                    opacity: 0.4, mixBlendMode: 'screen',
                  }} />
                  <div style={{ position: 'relative', fontFamily: F.mono, fontSize: isDesktop ? 10 : 7, color: t.accent, letterSpacing: 2 }}>
                    VOL.1 · GRANDMA + KHALIL
                  </div>
                  <div style={{ position: 'relative', fontFamily: F.display, fontSize: isDesktop ? 32 : 15, color: '#fff', lineHeight: 0.95, letterSpacing: -0.5 }}>
                    THE GOAT<br />CHRONICLES
                  </div>
                  <div style={{ position: 'relative', fontFamily: F.body, fontSize: isDesktop ? 11 : 8, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>
                    A KID'S BOOK<br />ABOUT EVERYTHING
                  </div>
                </div>
                {/* Bookmark ribbon */}
                <div aria-hidden style={{
                  position: 'absolute', top: -2, right: 18,
                  width: 12, height: isDesktop ? 100 : 60,
                  background: '#d44545',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                }} />
              </div>

              {/* Right column: handwritten title + body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Permanent Marker', 'Caveat', cursive",
                  fontSize: isDesktop ? 60 : 36,
                  color: '#1a1310',
                  lineHeight: 0.9, letterSpacing: -1,
                  textShadow: '0 1px 0 rgba(0,0,0,0.1)',
                  transform: 'rotate(-1deg)',
                }}>
                  writing
                  <br />
                  <span style={{
                    background: `linear-gradient(180deg, ${t.coverA} 0%, ${t.coverB} 100%)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    transition: 'background .6s ease',
                  }}>a book.</span>
                </div>
                <p style={{
                  margin: '14px 0 0',
                  fontFamily: "'Caveat', 'Bradley Hand', cursive",
                  fontSize: isDesktop ? 22 : 15,
                  color: '#3a2a14', lineHeight: 1.25,
                  maxWidth: isDesktop ? 460 : 'none',
                  fontWeight: 600,
                }}>
                  grandma started it last christmas.
                  <br />
                  now i'm finishing it myself — stories, drawings,
                  and the funniest stuff that happens at school.
                </p>
                {/* Underline scribble */}
                <svg viewBox="0 0 200 12" style={{ width: '60%', height: isDesktop ? 12 : 8, marginTop: 6, opacity: 0.7 }}>
                  <path d="M2 6 Q 30 -2, 60 6 T 120 6 T 198 6"
                    fill="none" stroke="#d44545" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {/* "Status" stamps */}
                <div style={{
                  marginTop: 16,
                  display: 'flex', flexDirection: isDesktop ? 'row' : 'column',
                  gap: isDesktop ? 10 : 4,
                  flexWrap: 'wrap',
                }}>
                  <Stamp t={t} text={K.book.chapter.toUpperCase()} color="#3a8a4a" />
                  <Stamp t={t} text="DROPS SOON" color="#d44545" rot={2} />
                  <Stamp t={t} text="SIGNED COPIES" color="#1a3a8a" rot={-3} />
                </div>
              </div>
            </div>
          </div>
        </HudCard>
      </Reveal>
    </div>
  );
};

// Inky stamp — small rotated label with rough edges
const Stamp = ({ text, color = '#d44545', rot = 0, t }) => (
  <span style={{
    display: 'inline-block',
    padding: '5px 10px',
    border: `2px solid ${color}`,
    color,
    fontFamily: F.display, fontSize: 12, letterSpacing: 1.5,
    transform: `rotate(${rot}deg)`,
    background: 'transparent',
    opacity: 0.85,
    textShadow: `0 0 1px ${color}`,
  }}>{text}</span>
);

// ── Nav + Foot ───────────────────────────────────────────────────────────
// Nav now lives BELOW the full-width TopBarMode (see ArenaRoot). It's just
// the K-logo + page links — no mode toggle here.
const Nav = ({ t, size }) => {
  const isPhone = size === 'phone';
  const isDesktop = size === 'desktop';
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30,
      padding: isPhone ? '14px 14px 8px' : isDesktop ? '16px 64px' : '14px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: isDesktop ? 40 : 30, height: isDesktop ? 40 : 30, borderRadius: 6,
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
          color: '#0a0420', fontFamily: F.display, fontSize: isDesktop ? 22 : 18, fontWeight: 400,
          boxShadow: `0 0 14px ${t.accent}80`,
          transition: 'background .6s ease, box-shadow .6s ease',
        }}>K</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: F.display, color: t.fg, fontSize: isDesktop ? 22 : 16, lineHeight: 1, letterSpacing: 1 }}>KHALIL</span>
          <span style={{ fontFamily: F.mono, color: t.accent, fontSize: isDesktop ? 11 : 9, letterSpacing: 1.5, marginTop: 1, transition: 'color .6s ease' }}>● ONLINE</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: isDesktop ? 24 : 14, fontFamily: F.mono, fontSize: isDesktop ? 12 : 10, letterSpacing: 2, color: 'rgba(255,255,255,0.7)' }}>
        {(isDesktop ? ['REPLAYS', 'PROFILE', 'BOOK', 'SUBS'] : ['REPLAYS', 'BOOK', 'SUBS']).map(l => (
          <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>
        ))}
      </div>
    </div>
  );
};

const Foot = ({ t, size }) => {
  const isDesktop = size === 'desktop';
  return (
    <div style={{ padding: isDesktop ? '24px 64px 32px' : '0 14px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {['YT', 'TT', 'IG'].map((s) => (
          <span key={s} style={{
            width: isDesktop ? 40 : 30, height: isDesktop ? 40 : 30, borderRadius: 6,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${t.cardBorder}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F.display, fontSize: isDesktop ? 14 : 12, color: t.fg, letterSpacing: 1,
            transition: 'border-color .6s ease',
          }}>{s}</span>
        ))}
      </div>
      <span style={{ fontFamily: F.mono, fontSize: isDesktop ? 11 : 9, color: t.accent, letterSpacing: 1, opacity: 0.7, transition: 'color .6s ease' }}>
        KHALIL // 2026 //
      </span>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════
// Root — accepts `size` ∈ {phone, tablet, desktop}
// ════════════════════════════════════════════════════════════════════════
const ArenaRoot = ({ size = 'phone' }) => {
  const [mode, flip, transition] = useModeFlip('gaming');
  const [boomN, fireBoom] = useNonce();
  const t = THEMES[mode];
  const transitioning = !!transition;

  return (
    <div style={{
      position: 'relative', width: '100%', minHeight: '100%', overflow: 'hidden',
      background: '#000',
    }}>
      {mode === 'gaming' ? <GamingBG t={t} size={size} /> : <FootballBG t={t} size={size} />}

      <div style={{ position: 'relative' }}>
        {/* Full-width mode toggle takes the whole top row */}
        <TopBarMode mode={mode} onFlip={flip} size={size} transitioning={transitioning} />
        {/* Regular nav sits below it */}
        <Nav t={t} size={size} />
        <Hero mode={mode} t={t} size={size} onBoom={fireBoom} />
        <SubsHud t={t} size={size} />
        <NowDock mode={mode} t={t} size={size} />
        <Videos t={t} size={size} />
        <About t={t} size={size} />
        <Book t={t} size={size} />
        <Foot t={t} size={size} />
      </div>

      {/* Cinematic flip overlay */}
      {transition && <ModeFlipOverlay from={transition.from} to={transition.to} nonce={transition.nonce} />}

      {boomN > 0 && (
        <Burst key={`b-${boomN}`} x={size === 'desktop' ? 0.2 : 0.5} y={0.5} count={44} kind={t.burstKind} durationMs={1200} spread={340} />
      )}
    </div>
  );
};

window.ArenaMobile = () => <ArenaRoot size="phone" />;
window.ArenaTablet = () => <ArenaRoot size="tablet" />;
window.ArenaDesktop = () => <ArenaRoot size="desktop" />;
})();
