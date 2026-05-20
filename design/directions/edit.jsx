// KHALIL CONTROL DECK — the edit experience.
// Mission-control aesthetic, not a CMS. The central instrument is the
// MESSAGE LAUNCHER: type the message onto a missile, pick a payload, set a
// fuse, then slam the red plunger. The blast goes off in the LAUNCH WINDOW
// (a CRT-style preview of the homepage) and the message stamps over the
// preview. Around it: dials/switches for subs, status, now-playing, pinned
// video, default mode, and the about copy.
//
// Three sizes (phone / tablet / desktop). Same components, different layouts.
//
// IIFE so internal names don't collide with arena/tunnel.

(function () {
const { useState, useEffect, useRef, useMemo } = React;
const K = window.KHALIL;
const { Burst, useNonce } = window;

const F = {
  display: "'Anton', 'Bungee', 'Russo One', sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'DM Mono', ui-monospace, monospace",
  stencil: "'Bungee', 'Anton', sans-serif",
};

// Bunker palette — instrumented, not branded. Same across modes.
const ED = {
  bg:        '#0a0d0f',
  bgGrid:    '#10141a',
  panel:     '#171c22',
  panel2:    '#1d242b',
  line:      '#2a333d',
  ink:       '#e6f2f6',
  inkDim:    '#92a4ae',
  amber:     '#ffb84d',
  green:     '#3df562',
  red:       '#ff3a3a',
  blue:      '#3ec4ff',
  pink:      '#ff63d6',
  yellow:    '#ffe600',
};

// ════════════════════════════════════════════════════════════════════════
// One-time CSS for the deck (glow, blink, sweep)
// ════════════════════════════════════════════════════════════════════════
if (typeof document !== 'undefined' && !document.getElementById('khalil-edit-css')) {
  const s = document.createElement('style');
  s.id = 'khalil-edit-css';
  s.textContent = `
    @keyframes ed-blink-led { 0%,55%,100% { opacity: 1 } 60%,90% { opacity: .3 } }
    @keyframes ed-blink-slow { 0%,80%,100% { opacity: 1 } 90% { opacity: .25 } }
    @keyframes ed-scan { 0% { transform: translateY(-100%) } 100% { transform: translateY(100%) } }
    @keyframes ed-plunge-down {
      0%   { transform: translateY(0) }
      18%  { transform: translateY(34px) }
      45%  { transform: translateY(34px) }
      100% { transform: translateY(0) }
    }
    @keyframes ed-shake-mini {
      0%,100% { transform: translate(0,0) }
      20% { transform: translate(-2px, 1px) }
      40% { transform: translate(2px, -2px) }
      60% { transform: translate(-1px, 2px) }
      80% { transform: translate(2px, 1px) }
    }
    @keyframes ed-rocket {
      0%   { transform: translate(-50%, 0) scale(1); opacity: 1 }
      40%  { transform: translate(-50%, -260px) scale(.8); opacity: 1 }
      75%  { transform: translate(-50%, -480px) scale(.5); opacity: .9 }
      100% { transform: translate(-50%, -560px) scale(.3); opacity: 0 }
    }
    @keyframes ed-msg-stamp {
      0%   { transform: translate(-50%,-50%) scale(.3) rotate(-6deg); opacity:0; filter: blur(8px) }
      55%  { transform: translate(-50%,-50%) scale(1.15) rotate(2deg); opacity:1; filter: blur(0) }
      72%  { transform: translate(-50%,-50%) scale(.96) rotate(-1deg) }
      100% { transform: translate(-50%,-50%) scale(1) rotate(0); opacity:1 }
    }
    @keyframes ed-shock-ring {
      0%   { transform: translate(-50%,-50%) scale(.2); opacity: .9 }
      100% { transform: translate(-50%,-50%) scale(3); opacity: 0 }
    }
    @keyframes ed-tick { 50% { opacity: 0.4 } }
    .ed-led { animation: ed-blink-led 2.6s ease-in-out infinite }
    .ed-led-slow { animation: ed-blink-slow 3.6s ease-in-out infinite }
    .ed-tick { animation: ed-tick 1s steps(2,end) infinite }
  `;
  document.head.appendChild(s);
}

// ════════════════════════════════════════════════════════════════════════
// SHARED CHROME — the screen frame (top bar, side rivets, CRT background)
// ════════════════════════════════════════════════════════════════════════
const useNow = () => {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return t;
};
const fmt = n => String(n).padStart(2, '0');

const TopBar = ({ size, mode, onExit, onSave, tab, setTab }) => {
  const now = useNow();
  const time = `${fmt(now.getHours())}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())}`;
  const isPhone = size === 'phone';
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      padding: isPhone ? '40px 12px 0' : '12px 20px 0',
      background: `linear-gradient(180deg, ${ED.bg} 30%, ${ED.bg}d0 100%)`,
      backdropFilter: 'blur(6px)',
      borderBottom: `1px solid ${ED.line}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: isPhone ? 26 : 30, height: isPhone ? 26 : 30,
            background: ED.amber, color: '#0a0d0f',
            fontFamily: F.stencil, fontSize: isPhone ? 16 : 18, fontWeight: 700,
            clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
            boxShadow: `0 0 12px ${ED.amber}80`,
          }}>K</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: F.stencil, fontSize: isPhone ? 13 : 16, letterSpacing: 2, color: ED.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              CONTROL DECK
            </div>
            <div style={{ fontFamily: F.mono, fontSize: isPhone ? 8 : 9, letterSpacing: 1.5, color: ED.green }}>
              CLASSIFIED · CLEARANCE GOAT-1
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isPhone ? 6 : 12 }}>
          {!isPhone && (
            <>
              <Pill label="SIG" value="████" color={ED.green} />
              <Pill label="UTC" value={time} color={ED.amber} />
            </>
          )}
          {isPhone && <Pill label="" value={time} color={ED.green} />}
          <BarButton onClick={onSave} color={ED.green}>SAVE</BarButton>
          <BarButton onClick={onExit} color={ED.red}>EXIT</BarButton>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0 }}>
        <Tab id="inline"  active={tab === 'inline'}  onClick={() => setTab('inline')}>
          ✎  ON-SITE EDITOR
        </Tab>
        <Tab id="deck"    active={tab === 'deck'}    onClick={() => setTab('deck')}>
          ⌬  CONTROL DECK
        </Tab>
      </div>
    </div>
  );
};

const Tab = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    position: 'relative',
    padding: '8px 16px',
    background: active ? ED.panel : 'transparent',
    border: `1px solid ${active ? ED.line : 'transparent'}`,
    borderBottom: active ? `1px solid ${ED.bg}` : `1px solid ${ED.line}`,
    marginBottom: -1,
    color: active ? ED.amber : ED.inkDim,
    fontFamily: F.mono, fontSize: 11, letterSpacing: 1.5, fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
  }}>
    {children}
  </button>
);

const BarButton = ({ children, onClick, color = ED.amber }) => (
  <button onClick={onClick} style={{
    fontFamily: F.mono, fontSize: 10, letterSpacing: 1.5, fontWeight: 700,
    color, background: 'transparent',
    border: `1px solid ${color}66`,
    padding: '5px 10px', borderRadius: 3, cursor: 'pointer',
    textTransform: 'uppercase',
  }}>{children}</button>
);

const Pill = ({ label, value, color = ED.green }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '3px 8px',
    background: 'rgba(0,0,0,0.55)',
    border: `1px solid ${color}55`,
    borderRadius: 2,
    fontFamily: F.mono, fontSize: 10, letterSpacing: 1.3, color,
    textTransform: 'uppercase',
  }}>
    {label && <span style={{ opacity: 0.6 }}>{label}</span>}
    <span style={{ fontWeight: 700 }}>{value}</span>
  </span>
);

// Panel chrome — module box with corner LEDs + header
const Panel = ({ title, kicker, accent = ED.amber, children, style, headerRight }) => (
  <div style={{
    position: 'relative',
    background: ED.panel,
    border: `1px solid ${ED.line}`,
    borderRadius: 4,
    padding: 14,
    ...style,
  }}>
    {[0,1,2,3].map(c => {
      const cs = c === 0 ? {top:-3, left:-3} : c === 1 ? {top:-3, right:-3} : c === 2 ? {bottom:-3, left:-3} : {bottom:-3, right:-3};
      return (
        <span key={c} aria-hidden style={{
          position: 'absolute', ...cs, width: 6, height: 6, borderRadius: 999,
          background: accent, boxShadow: `0 0 8px ${accent}`,
        }} className={c === 0 ? 'ed-led' : ''} />
      );
    })}
    {(title || headerRight) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
        <div>
          {title && (
            <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 2, color: accent, textTransform: 'uppercase' }}>
              {title}
            </div>
          )}
          {kicker && (
            <div style={{ fontFamily: F.mono, fontSize: 9, color: ED.inkDim, letterSpacing: 0.5, marginTop: 2 }}>
              {kicker}
            </div>
          )}
        </div>
        {headerRight}
      </div>
    )}
    {children}
  </div>
);

// ════════════════════════════════════════════════════════════════════════
// PAYLOAD PRESETS — fed into <Burst> and used to tint the launch animation
// ════════════════════════════════════════════════════════════════════════
const PAYLOADS = [
  { id: 'confetti', name: 'CONFETTI',    kind: 'paper', color: ED.yellow, emoji: '🎉', desc: 'paper rain' },
  { id: 'gold',     name: 'GOLD SHOWER', kind: 'gold',  color: ED.amber,  emoji: '🪙', desc: 'big day energy' },
  { id: 'neon',     name: 'NEON RAVE',   kind: 'neon',  color: ED.pink,   emoji: '⚡', desc: 'gaming sparks' },
  { id: 'fire',     name: 'FIRE',        kind: 'gold',  color: ED.red,    emoji: '🔥', desc: 'on fire mode' },
  { id: 'goal',     name: 'GOOOAL',      kind: 'gold',  color: ED.green,  emoji: '⚽', desc: 'stadium roar' },
  { id: 'cake',     name: 'BIRTHDAY',    kind: 'paper', color: ED.pink,   emoji: '🎂', desc: 'sprinkle bomb' },
];

const FUSES = [
  { id: 'now',     name: 'NOW',         hint: 'fires on save' },
  { id: 'visit',   name: 'NEXT VISIT',  hint: 'first time' },
  { id: 'refresh', name: 'ON REFRESH',  hint: 'every reload' },
  { id: '1h',      name: '+1 HOUR',     hint: 'one hour from now' },
];

const MOODS = [
  { id: 'online',   label: 'ONLINE',         color: ED.green },
  { id: 'fire',     label: 'ON FIRE',        color: ED.red },
  { id: 'streaming',label: 'STREAMING',      color: ED.pink },
  { id: 'school',   label: 'IN SCHOOL',      color: ED.amber },
  { id: 'sleeping', label: 'SLEEPING',       color: ED.blue },
];

// ════════════════════════════════════════════════════════════════════════
// CENTRAL INSTRUMENT — THE MESSAGE LAUNCHER
// ════════════════════════════════════════════════════════════════════════
const MessageLauncher = ({ size, msg, setMsg, payload, setPayload, fuse, setFuse, onFire, launching }) => {
  const isPhone = size === 'phone';
  const isDesktop = size === 'desktop';
  const p = PAYLOADS.find(x => x.id === payload);

  return (
    <Panel
      title="MESSAGE LAUNCHER"
      kicker="// what visitors see when they hit the site"
      accent={ED.amber}
      style={{ padding: isPhone ? 14 : 20 }}
    >
      {/* Missile body — textarea sits ON the missile */}
      <div style={{
        position: 'relative',
        margin: isPhone ? '8px auto 14px' : '12px auto 18px',
        width: '100%',
        maxWidth: isDesktop ? 520 : 400,
      }}>
        {/* Nose cone */}
        <div aria-hidden style={{
          width: '34%',
          height: 36, margin: '0 auto',
          background: `linear-gradient(180deg, ${ED.red} 0%, ${ED.red}90 100%)`,
          clipPath: 'polygon(50% 0, 100% 100%, 0% 100%)',
          boxShadow: `0 0 22px ${ED.red}88`,
        }} />
        {/* Body cylinder */}
        <div style={{
          position: 'relative',
          background: `linear-gradient(180deg, #2a3038 0%, #14181c 100%)`,
          border: `1px solid ${ED.line}`,
          borderRadius: 8,
          padding: isPhone ? '10px 12px' : '14px 18px',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 20px rgba(0,0,0,0.6)`,
        }}>
          {/* Stripe + warning labels */}
          <div style={{
            position: 'absolute', top: 4, bottom: 4, left: 6,
            width: 4, background: `repeating-linear-gradient(0deg, ${ED.yellow} 0 6px, #000 6px 12px)`,
            borderRadius: 1,
          }} />
          <div style={{
            position: 'absolute', top: 4, bottom: 4, right: 6,
            width: 4, background: `repeating-linear-gradient(0deg, ${ED.yellow} 0 6px, #000 6px 12px)`,
            borderRadius: 1,
          }} />
          <div style={{
            position: 'absolute', top: -10, left: '14%',
            padding: '2px 6px', background: '#000', border: `1px solid ${ED.yellow}`,
            fontFamily: F.mono, fontSize: 8, letterSpacing: 1.5, color: ED.yellow,
          }}>PAYLOAD: {p.name}</div>
          <div style={{
            position: 'absolute', top: -10, right: '14%',
            padding: '2px 6px', background: '#000', border: `1px solid ${ED.amber}`,
            fontFamily: F.mono, fontSize: 8, letterSpacing: 1.5, color: ED.amber,
          }}>MSG-{(msg.length).toString().padStart(3,'0')}/120</div>
          {/* The textarea */}
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value.slice(0, 120))}
            placeholder="TYPE THE MESSAGE THAT WILL EXPLODE ON SCREEN..."
            rows={isPhone ? 3 : 4}
            style={{
              width: '100%', padding: '6px 12px',
              background: 'rgba(0,0,0,0.55)',
              border: `1px dashed ${ED.amber}66`,
              borderRadius: 3,
              color: ED.amber,
              fontFamily: F.stencil, fontSize: isPhone ? 16 : 22,
              letterSpacing: 1, lineHeight: 1.15, textTransform: 'uppercase',
              resize: 'none', outline: 'none',
              textShadow: `0 0 12px ${ED.amber}50`,
            }}
          />
          {/* Fin pair */}
          <div aria-hidden style={{
            position: 'absolute', left: -18, bottom: 6,
            width: 22, height: 30,
            background: ED.red,
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            opacity: 0.85,
          }} />
          <div aria-hidden style={{
            position: 'absolute', right: -18, bottom: 6,
            width: 22, height: 30,
            background: ED.red,
            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
            opacity: 0.85,
          }} />
        </div>
        {/* Exhaust */}
        <div aria-hidden style={{
          width: '20%',
          height: 14, margin: '-2px auto 0',
          background: '#0a0d0f',
          border: `1px solid ${ED.line}`,
          borderBottom: 'none',
          borderRadius: '0 0 4px 4px',
        }} />
      </div>

      {/* Payload picker */}
      <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2, color: ED.inkDim, marginBottom: 5, textTransform: 'uppercase' }}>
        PAYLOAD
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${isPhone ? 3 : 6}, 1fr)`,
        gap: 6, marginBottom: 14,
      }}>
        {PAYLOADS.map(item => {
          const sel = item.id === payload;
          return (
            <button key={item.id} onClick={() => setPayload(item.id)} style={{
              padding: '8px 4px',
              background: sel ? `${item.color}1a` : 'rgba(0,0,0,0.4)',
              border: `1px solid ${sel ? item.color : ED.line}`,
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all .15s',
              boxShadow: sel ? `inset 0 0 12px ${item.color}40` : 'none',
            }}>
              <div style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</div>
              <div style={{ fontFamily: F.mono, fontSize: 8, letterSpacing: 1, color: sel ? item.color : ED.inkDim, marginTop: 3, fontWeight: 700 }}>
                {item.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Fuse picker */}
      <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2, color: ED.inkDim, marginBottom: 5, textTransform: 'uppercase' }}>
        FUSE
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${isPhone ? 2 : 4}, 1fr)`,
        gap: 6, marginBottom: 16,
      }}>
        {FUSES.map(item => {
          const sel = item.id === fuse;
          return (
            <button key={item.id} onClick={() => setFuse(item.id)} style={{
              padding: '7px 6px',
              background: sel ? `${ED.green}1a` : 'rgba(0,0,0,0.4)',
              border: `1px solid ${sel ? ED.green : ED.line}`,
              borderRadius: 3,
              textAlign: 'left',
              cursor: 'pointer',
            }}>
              <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 1, color: sel ? ED.green : ED.ink, fontWeight: 700 }}>
                {item.name}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 8, color: ED.inkDim, marginTop: 1 }}>
                {item.hint}
              </div>
            </button>
          );
        })}
      </div>

      {/* THE PLUNGER */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <Plunger onFire={onFire} firing={launching} disabled={!msg.trim()} />
      </div>
    </Panel>
  );
};

// Big red plunger button — body + handle. Animates on press.
const Plunger = ({ onFire, firing, disabled }) => (
  <div style={{ position: 'relative', textAlign: 'center', userSelect: 'none' }}>
    {/* Handle (the bit that goes down) */}
    <div style={{
      width: 28, height: 38, margin: '0 auto',
      background: `linear-gradient(180deg, #444 0%, #222 100%)`,
      border: `1px solid #555`,
      borderRadius: '4px 4px 0 0',
      animation: firing ? 'ed-plunge-down .9s cubic-bezier(.3,1.4,.4,1) forwards' : undefined,
    }} />
    {/* Plate */}
    <div style={{
      width: 110, height: 12, margin: '-2px auto 0',
      background: 'linear-gradient(180deg, #2a2a2a, #0a0a0a)',
      border: `1px solid #444`,
      borderRadius: 2,
    }} />
    {/* Button cap */}
    <button onClick={!disabled ? onFire : undefined} disabled={disabled} style={{
      position: 'relative',
      marginTop: 4,
      width: 180, padding: '14px 0',
      background: disabled ? '#3a1010' : `radial-gradient(ellipse at 40% 30%, #ff6363 0%, ${ED.red} 60%, #8b0a0a 100%)`,
      border: `2px solid ${disabled ? '#600' : ED.red}`,
      borderRadius: '50%/40%',
      boxShadow: disabled ? 'none' : `0 0 30px ${ED.red}66, inset 0 -8px 16px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)`,
      color: '#fff',
      fontFamily: F.stencil, fontSize: 28, letterSpacing: 4, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    }}>
      LAUNCH
    </button>
    <div style={{
      marginTop: 6, fontFamily: F.mono, fontSize: 9, color: disabled ? ED.inkDim : ED.amber,
      letterSpacing: 2,
    }}>
      {disabled ? '↑ enter a message first' : 'PRESS TO FIRE  ●●●'}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════
// LAUNCH WINDOW — preview of the homepage with explosion overlay
// ════════════════════════════════════════════════════════════════════════
const LaunchWindow = ({ size, mode, setMode, msg, payload, launchNonce, launching }) => {
  const isPhone = size === 'phone';
  const p = PAYLOADS.find(x => x.id === payload);

  // Theme tint based on mode
  const bg = mode === 'gaming'
    ? `radial-gradient(ellipse at 50% 0%, #3a0a5a 0%, #1a0838 35%, #08010c 80%)`
    : `linear-gradient(180deg, #001233 0%, #003366 35%, #0a4a2a 100%)`;

  return (
    <Panel
      title="LAUNCH WINDOW"
      kicker="// preview · what they see on the homepage"
      accent={ED.green}
      headerRight={
        <div style={{ display: 'flex', gap: 4 }}>
          <ToggleChip
            active={mode === 'gaming'}
            color="#ff2bd6"
            onClick={() => setMode('gaming')}
          >🎮 GAMING</ToggleChip>
          <ToggleChip
            active={mode === 'football'}
            color={ED.yellow}
            onClick={() => setMode('football')}
          >⚽ FOOTBALL</ToggleChip>
        </div>
      }
      style={{ padding: isPhone ? 12 : 16 }}
    >
      {/* CRT bezel */}
      <div style={{
        position: 'relative',
        margin: '4px auto',
        aspectRatio: isPhone ? '4/3' : '16/9',
        background: '#000',
        border: `8px solid #1a1d22`,
        borderRadius: 12,
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), 0 0 0 1px #2a2f36',
        overflow: 'hidden',
        animation: launching ? 'ed-shake-mini .6s ease-out' : undefined,
      }}>
        {/* Inner screen */}
        <div style={{
          position: 'absolute', inset: 0,
          background: bg,
        }}>
          <SiteMiniature mode={mode} />
          {/* Scanlines */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
          }} />
          {/* Scan beam */}
          <div aria-hidden style={{
            position: 'absolute', left: 0, right: 0, height: '20%',
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
            animation: 'ed-scan 5s linear infinite',
            pointerEvents: 'none',
          }} />
          {/* THE EXPLOSION */}
          {launchNonce > 0 && (
            <>
              <Burst key={`b-${launchNonce}`} x={0.5} y={0.5} count={48} kind={p.kind} durationMs={1400} spread={size === 'desktop' ? 360 : 240} />
              <div key={`r-${launchNonce}`} aria-hidden style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 160, height: 160, borderRadius: '50%',
                border: `3px solid ${p.color}`, boxShadow: `0 0 30px ${p.color}`,
                animation: 'ed-shock-ring 900ms ease-out forwards',
              }} />
              {msg.trim() && (
                <div key={`m-${launchNonce}`} style={{
                  position: 'absolute', left: '50%', top: '50%',
                  maxWidth: '78%', textAlign: 'center',
                  fontFamily: F.stencil,
                  fontSize: size === 'desktop' ? 36 : size === 'tablet' ? 28 : 18,
                  letterSpacing: 1, lineHeight: 1, textTransform: 'uppercase',
                  color: '#fff',
                  textShadow: `0 0 20px ${p.color}, 0 4px 0 rgba(0,0,0,0.5)`,
                  animation: 'ed-msg-stamp .7s cubic-bezier(.2,1.4,.4,1) both',
                  pointerEvents: 'none',
                }}>{msg}</div>
              )}
            </>
          )}
        </div>
        {/* Bezel HUD */}
        <div style={{
          position: 'absolute', top: 6, left: 8, right: 8,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: F.mono, fontSize: 8, letterSpacing: 1, color: ED.green,
          pointerEvents: 'none', textShadow: '0 0 4px rgba(0,0,0,0.7)',
        }}>
          <span><span className="ed-tick">●</span> REC</span>
          <span>CHANNEL 7 · LIVE</span>
        </div>
      </div>
    </Panel>
  );
};

const ToggleChip = ({ active, color, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '4px 8px',
    background: active ? `${color}1a` : 'transparent',
    border: `1px solid ${active ? color : ED.line}`,
    borderRadius: 3,
    fontFamily: F.mono, fontSize: 9, letterSpacing: 1, fontWeight: 700,
    color: active ? color : ED.inkDim, cursor: 'pointer',
    textTransform: 'uppercase',
  }}>{children}</button>
);

// ── tiny SVG mock of the homepage (mode-dependent) for the launch window ─
const SiteMiniature = ({ mode }) => {
  const accent = mode === 'gaming' ? '#00f0ff' : '#ffd700';
  const accent2 = mode === 'gaming' ? '#ff2bd6' : '#ffffff';
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '8% 5%', fontFamily: F.mono }}>
      {/* fake nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 14, background: `linear-gradient(135deg, ${accent}, ${accent2})`, borderRadius: 2 }} />
          <span style={{ fontSize: 9, color: '#fff', fontFamily: F.stencil, letterSpacing: 1 }}>KHALIL</span>
        </div>
        <span style={{ fontSize: 7, color: accent, letterSpacing: 1 }}>● ONLINE</span>
      </div>
      {/* fake hero */}
      <div style={{ fontFamily: F.stencil, fontSize: 22, color: '#fff', lineHeight: 0.9, letterSpacing: -0.5, textShadow: `0 0 12px ${accent}88` }}>
        KHALIL
      </div>
      <div style={{
        fontFamily: F.stencil, fontSize: 22, lineHeight: 0.9, letterSpacing: -0.5,
        background: `linear-gradient(180deg, ${accent}, ${accent2})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>THE GOAT</div>
      {/* tiles row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: '5%' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            aspectRatio: '16/10',
            background: `linear-gradient(135deg, ${accent}33, ${accent2}33)`,
            border: `1px solid ${accent}66`,
            borderRadius: 2,
          }} />
        ))}
      </div>
      {/* fake CTA */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '8%', transform: 'translateX(-50%)',
        padding: '5px 14px',
        background: `linear-gradient(180deg, ${accent}, ${accent2})`,
        clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
        fontFamily: F.stencil, fontSize: 10, color: '#000',
      }}>▶ SUBSCRIBE</div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════
// INSTRUMENT MODULES — the smaller side panels
// ════════════════════════════════════════════════════════════════════════
const StatusModule = ({ mood, setMood }) => (
  <Panel title="STATUS · MOOD" kicker="// what shows next to your name" accent={ED.green}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {MOODS.map(m => {
        const sel = m.id === mood;
        return (
          <button key={m.id} onClick={() => setMood(m.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 8px',
            background: sel ? `${m.color}1a` : 'rgba(0,0,0,0.4)',
            border: `1px solid ${sel ? m.color : ED.line}`,
            borderRadius: 3, cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: m.color, boxShadow: `0 0 6px ${m.color}`,
            }} />
            <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 1, color: sel ? m.color : ED.ink, fontWeight: 700 }}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  </Panel>
);

const SubsModule = ({ subs, setSubs }) => {
  const pct = (subs / K.subs.goal) * 100;
  const bump = (n) => setSubs(Math.max(0, subs + n));
  return (
    <Panel title="SUBSCRIBERS" kicker={`// goal · ${K.subs.goal}`} accent={ED.pink}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <DialButton onClick={() => bump(-10)} label="−10" />
        <DialButton onClick={() => bump(-1)} label="−1" />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: F.stencil, fontSize: 36, lineHeight: 1, color: ED.ink, letterSpacing: -1 }}>{subs}</div>
          <div style={{ fontFamily: F.mono, fontSize: 8, color: ED.pink, letterSpacing: 1, marginTop: 1 }}>
            / {K.subs.goal} · {pct.toFixed(0)}%
          </div>
        </div>
        <DialButton onClick={() => bump(1)} label="+1" />
        <DialButton onClick={() => bump(10)} label="+10" />
      </div>
      <div style={{ marginTop: 10, height: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 1, overflow: 'hidden', border: `1px solid ${ED.line}` }}>
        <div style={{
          width: `${Math.min(100, pct)}%`, height: '100%',
          background: `linear-gradient(90deg, ${ED.pink}, ${ED.amber})`,
          boxShadow: `0 0 8px ${ED.pink}88`,
        }} />
      </div>
    </Panel>
  );
};

const DialButton = ({ onClick, label }) => (
  <button onClick={onClick} style={{
    width: 30, height: 30,
    background: 'rgba(0,0,0,0.55)',
    border: `1px solid ${ED.line}`,
    borderRadius: 3,
    fontFamily: F.mono, fontSize: 11, fontWeight: 700, color: ED.amber,
    cursor: 'pointer', letterSpacing: 0.5,
  }}>{label}</button>
);

const NowPlayingModule = ({ now, setNow, mode }) => {
  const label = mode === 'gaming' ? 'PLAYING' : 'STARTING XI';
  const presets = mode === 'gaming'
    ? ['Fortnite — Zero Build', 'Roblox', 'Brawl Stars', 'FC 25', 'Minecraft']
    : ['Real Madrid', 'Brazil NT', 'Liverpool', 'Arsenal', 'Vinicius Jr.'];
  return (
    <Panel title={`NOW · ${label}`} kicker={`// current ${mode === 'gaming' ? 'game' : 'team'}`} accent={ED.blue}>
      <input
        value={now}
        onChange={e => setNow(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px',
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${ED.line}`,
          borderRadius: 3, color: ED.ink,
          fontFamily: F.body, fontSize: 13, fontWeight: 500,
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {presets.map(p => (
          <button key={p} onClick={() => setNow(p)} style={{
            padding: '3px 8px',
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${ED.line}`,
            borderRadius: 999,
            fontFamily: F.mono, fontSize: 9, color: ED.blue,
            cursor: 'pointer', letterSpacing: 0.5,
          }}>{p}</button>
        ))}
      </div>
    </Panel>
  );
};

const PinnedVideoModule = ({ pinned, setPinned }) => (
  <Panel title="PINNED REPLAY" kicker="// shows first in REPLAYS." accent={ED.amber}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {K.videos.map(v => {
        const sel = pinned === v.id;
        return (
          <button key={v.id} onClick={() => setPinned(v.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px',
            background: sel ? `${ED.amber}15` : 'rgba(0,0,0,0.4)',
            border: `1px solid ${sel ? ED.amber : ED.line}`,
            borderRadius: 3, cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{
              width: 24, height: 24,
              background: `linear-gradient(135deg, ${v.thumb.from}, ${v.thumb.to})`,
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
            }}>{v.thumb.emoji}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: F.body, fontSize: 11, color: sel ? ED.ink : ED.inkDim, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {v.title}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 8, color: ED.amber, letterSpacing: 0.5, marginTop: 1 }}>
                {v.views} · {v.duration}
              </div>
            </div>
            {sel && (
              <span style={{
                fontFamily: F.mono, fontSize: 8, color: ED.amber, letterSpacing: 1,
                padding: '1px 4px', border: `1px solid ${ED.amber}`, borderRadius: 2,
              }}>PIN</span>
            )}
          </button>
        );
      })}
    </div>
  </Panel>
);

const AboutModule = ({ about, setAbout }) => (
  <Panel title="ABOUT.DAT" kicker="// the bio on /about" accent={ED.amber}>
    {about.map((p, i) => (
      <textarea
        key={i}
        value={p}
        onChange={e => {
          const copy = [...about];
          copy[i] = e.target.value;
          setAbout(copy);
        }}
        rows={i === 0 ? 1 : 3}
        style={{
          width: '100%', padding: '7px 9px',
          marginBottom: 6,
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${ED.line}`, borderRadius: 3,
          color: i === 0 ? ED.amber : ED.ink,
          fontFamily: F.body, fontSize: i === 0 ? 14 : 12,
          fontWeight: i === 0 ? 700 : 400,
          lineHeight: 1.4, resize: 'vertical', outline: 'none',
        }}
      />
    ))}
  </Panel>
);

// ════════════════════════════════════════════════════════════════════════
// INLINE EDITOR — the "on-site" editing experience.
// ════════════════════════════════════════════════════════════════════════
// A live representation of Khalil's homepage with EDIT PINS sitting on top
// of every editable element. Click a pin → a side drawer slides in with
// the right editor for that thing. Same data backing as the Control Deck,
// so changes are persistent across tabs.
//
// Sections rendered as cards stacked vertically. Each card is a miniature
// of the real site section so Khalil can see what he's editing in context.

const SECTIONS = [
  { id: 'hero',    label: 'HERO',         icon: '◆' },
  { id: 'status',  label: 'NOW · STATUS', icon: '●' },
  { id: 'replays', label: 'REPLAYS',      icon: '▶' },
  { id: 'about',   label: 'ABOUT ME',     icon: '§' },
  { id: 'book',    label: 'BOOK',         icon: '📖' },
];

const InlineEditView = ({ size, state, setters }) => {
  const isDesktop = size === 'desktop';
  const isPhone = size === 'phone';
  const [activeSection, setActiveSection] = useState('hero');
  const [openPin, setOpenPin] = useState(null); // pin id

  // Mock mini palette so the inline previews match the real site
  const t = state.mode === 'gaming'
    ? { bg: '#1a0838', bg2: '#3a0a5a', accent: '#00f0ff', accent2: '#ff2bd6', fg: '#fff' }
    : { bg: '#003366', bg2: '#0a4a2a', accent: '#ffd700', accent2: '#ffffff', fg: '#fff' };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isDesktop ? '180px 1fr 320px' : isPhone ? '1fr' : '160px 1fr',
      gap: 12,
    }}>
      {/* Section nav */}
      {!isPhone && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontFamily: F.mono, fontSize: 9, color: ED.inkDim, letterSpacing: 2, marginBottom: 4, padding: '4px 8px' }}>
            SECTIONS
          </div>
          {SECTIONS.map(s => {
            const isActive = activeSection === s.id;
            return (
              <button key={s.id}
                onClick={() => { setActiveSection(s.id); setOpenPin(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px',
                  background: isActive ? `${ED.amber}15` : 'transparent',
                  border: `1px solid ${isActive ? ED.amber : ED.line}`,
                  borderLeft: isActive ? `3px solid ${ED.amber}` : `1px solid ${ED.line}`,
                  borderRadius: 3,
                  fontFamily: F.mono, fontSize: 11, letterSpacing: 1, fontWeight: 700,
                  color: isActive ? ED.amber : ED.ink, cursor: 'pointer',
                  textAlign: 'left',
                }}>
                <span style={{ width: 12, opacity: 0.7 }}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Site preview — the actual section, with edit pins */}
      <div style={{
        position: 'relative',
        background: `radial-gradient(ellipse at 50% 0%, ${t.bg2} 0%, ${t.bg} 60%, #000 100%)`,
        border: `1px solid ${ED.line}`,
        borderRadius: 4,
        overflow: 'hidden',
        minHeight: isDesktop ? 460 : 360,
      }}>
        {/* Browser/iPhone chrome hint */}
        <div style={{
          padding: '6px 10px',
          background: 'rgba(0,0,0,0.6)',
          borderBottom: `1px solid ${ED.line}`,
          fontFamily: F.mono, fontSize: 9, letterSpacing: 1.5, color: ED.inkDim,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>● ● ●  khalil.gg / {activeSection}</span>
          <span style={{ color: ED.green }}>LIVE PREVIEW</span>
        </div>

        <div style={{ padding: isDesktop ? 24 : 14, position: 'relative', minHeight: 400 }}>
          {activeSection === 'hero'    && <HeroPreview    t={t} state={state} openPin={openPin} setOpenPin={setOpenPin} />}
          {activeSection === 'status'  && <StatusPreview  t={t} state={state} openPin={openPin} setOpenPin={setOpenPin} />}
          {activeSection === 'replays' && <ReplaysPreview t={t} state={state} openPin={openPin} setOpenPin={setOpenPin} />}
          {activeSection === 'about'   && <AboutPreview   t={t} state={state} openPin={openPin} setOpenPin={setOpenPin} />}
          {activeSection === 'book'    && <BookPreview    t={t} state={state} openPin={openPin} setOpenPin={setOpenPin} />}
        </div>
      </div>

      {/* Editor drawer (desktop only — on tablet/phone, slides in below) */}
      {isDesktop && (
        <div style={{
          background: ED.panel,
          border: `1px solid ${ED.line}`,
          borderRadius: 4,
          padding: 14,
          minHeight: 460,
        }}>
          <PinEditor
            openPin={openPin}
            state={state} setters={setters}
            onClose={() => setOpenPin(null)}
          />
        </div>
      )}
      {!isDesktop && openPin && (
        <div style={{
          gridColumn: '1 / -1',
          background: ED.panel,
          border: `1px solid ${ED.line}`,
          borderRadius: 4,
          padding: 14,
        }}>
          <PinEditor
            openPin={openPin}
            state={state} setters={setters}
            onClose={() => setOpenPin(null)}
          />
        </div>
      )}
    </div>
  );
};

// ── PIN ─ a small floating "edit me" badge on top of an editable thing.
const EditPin = ({ id, label, openPin, setOpenPin, position = {}, color = ED.amber }) => {
  const isOpen = openPin === id;
  return (
    <button
      onClick={() => setOpenPin(isOpen ? null : id)}
      style={{
        position: 'absolute', ...position,
        zIndex: 5,
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px',
        background: isOpen ? color : 'rgba(0,0,0,0.85)',
        color: isOpen ? '#0a0d0f' : color,
        border: `1.5px solid ${color}`,
        borderRadius: 999,
        fontFamily: F.mono, fontSize: 9, letterSpacing: 1, fontWeight: 700,
        cursor: 'pointer',
        boxShadow: `0 0 12px ${color}66, 0 2px 6px rgba(0,0,0,0.5)`,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 11 }}>✎</span>
      <span>{label}</span>
    </button>
  );
};

// ── PREVIEWS ─ small renditions of each site section with pins
const HeroPreview = ({ t, state, openPin, setOpenPin }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent }} />
      <span style={{ fontFamily: F.mono, fontSize: 10, color: t.accent, letterSpacing: 2 }}>
        {state.mode === 'gaming' ? 'STREAMER · GAMER · GOAT' : 'STRIKER · MADRIDISTA · #7'}
      </span>
    </div>
    <div style={{ position: 'relative' }}>
      <EditPin id="hero.title" label="HEADLINE" openPin={openPin} setOpenPin={setOpenPin} position={{ top: -8, right: 12 }} />
      <h1 style={{ margin: 0, fontFamily: F.stencil, fontSize: 56, lineHeight: 0.88, letterSpacing: -1, color: '#fff', textShadow: `0 0 24px ${t.accent}88` }}>
        KHALIL
      </h1>
      <h1 style={{
        margin: 0, fontFamily: F.stencil, fontSize: 44, lineHeight: 0.88, letterSpacing: -1,
        background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {state.mode === 'gaming' ? 'THE GOAT' : 'NO. 7'}
      </h1>
    </div>
    <div style={{ position: 'relative', marginTop: 16 }}>
      <EditPin id="hero.bio" label="BIO" openPin={openPin} setOpenPin={setOpenPin} position={{ top: -8, right: 12 }} color={ED.blue} />
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5, maxWidth: 380 }}>
        {state.about[1]?.slice(0, 140)}…
      </p>
    </div>
    <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center', position: 'relative' }}>
      <EditPin id="hero.mood" label={`MOOD · ${state.mood.toUpperCase()}`} openPin={openPin} setOpenPin={setOpenPin} position={{ top: -16, left: 0 }} color={ED.green} />
      <div style={{ padding: '6px 12px', background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`, color: '#000', fontFamily: F.stencil, fontSize: 13, letterSpacing: 1.5, clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
        ▶ SUBSCRIBE
      </div>
      <span style={{ fontFamily: F.mono, fontSize: 10, color: t.accent, letterSpacing: 1.5 }}>● {state.mood.toUpperCase()}</span>
    </div>
  </div>
);

const StatusPreview = ({ t, state, openPin, setOpenPin }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'relative', padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${t.accent}44`, borderRadius: 8 }}>
      <EditPin id="status.subs" label="SUBS COUNT" openPin={openPin} setOpenPin={setOpenPin} position={{ top: -10, right: 12 }} color={ED.pink} />
      <div style={{ fontFamily: F.mono, fontSize: 10, color: t.accent, letterSpacing: 2 }}>SUBSCRIBERS · {K.subs.goal} GOAL</div>
      <div style={{ fontFamily: F.stencil, fontSize: 44, color: '#fff', lineHeight: 1 }}>{state.subs}<span style={{ fontSize: 16, color: t.accent }}> / {K.subs.goal}</span></div>
      <div style={{ marginTop: 8, height: 6, background: 'rgba(0,0,0,0.5)', border: `1px solid ${t.accent}55`, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, (state.subs / K.subs.goal) * 100)}%`, height: '100%', background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }} />
      </div>
    </div>
    <div style={{ position: 'relative', marginTop: 14, padding: 14, background: 'rgba(0,0,0,0.4)', border: `1px solid ${t.accent}44`, borderRadius: 8 }}>
      <EditPin id="status.now" label="NOW PLAYING" openPin={openPin} setOpenPin={setOpenPin} position={{ top: -10, right: 12 }} color={ED.blue} />
      <div style={{ fontFamily: F.mono, fontSize: 10, color: t.accent, letterSpacing: 2 }}>
        {state.mode === 'gaming' ? 'EQUIPPED · THIS WEEK' : 'STARTING XI · THIS WEEK'}
      </div>
      <div style={{ fontFamily: F.stencil, fontSize: 22, color: '#fff', marginTop: 4 }}>{state.now}</div>
    </div>
  </div>
);

const ReplaysPreview = ({ t, state, openPin, setOpenPin }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ fontFamily: F.stencil, fontSize: 28, color: '#fff', letterSpacing: 0.5, marginBottom: 10 }}>
      REPLAYS<span style={{ color: t.accent }}>.</span>
    </div>
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <EditPin id="replays.pinned" label="PIN A VIDEO" openPin={openPin} setOpenPin={setOpenPin} position={{ top: -10, right: 12 }} color={ED.amber} />
      {K.videos.slice(0, 4).map((v, i) => {
        const isPinned = v.id === state.pinned;
        return (
          <div key={v.id} style={{
            position: 'relative', aspectRatio: '16/10', background: `linear-gradient(135deg, ${v.thumb.from}, ${v.thumb.to})`,
            border: `1px solid ${isPinned ? ED.amber : t.accent + '55'}`, borderRadius: 4, overflow: 'hidden',
            boxShadow: isPinned ? `0 0 16px ${ED.amber}66` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            {v.thumb.emoji}
            {isPinned && (
              <div style={{
                position: 'absolute', top: 4, left: 4,
                padding: '2px 6px', background: ED.amber, color: '#0a0d0f',
                fontFamily: F.mono, fontSize: 8, fontWeight: 700, letterSpacing: 1,
              }}>📌 PINNED</div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const AboutPreview = ({ t, state, openPin, setOpenPin }) => (
  <div style={{ position: 'relative' }}>
    <EditPin id="about.copy" label="EDIT BIO" openPin={openPin} setOpenPin={setOpenPin} position={{ top: -8, right: 12 }} color={ED.blue} />
    <div style={{ fontFamily: F.mono, fontSize: 10, color: t.accent, letterSpacing: 2 }}>§ ABOUT.SYS</div>
    <h2 style={{ margin: '4px 0 14px', fontFamily: F.stencil, fontSize: 32, color: '#fff', lineHeight: 0.95 }}>
      PROFILE.<span style={{ color: t.accent }}>DAT</span>
    </h2>
    {state.about.map((p, i) => (
      <p key={i} style={{
        fontFamily: F.body, fontSize: i === 0 ? 14 : 12,
        color: i === 0 ? '#fff' : 'rgba(255,255,255,0.75)',
        fontWeight: i === 0 ? 700 : 400,
        lineHeight: 1.5, margin: '0 0 8px',
      }}>{p}</p>
    ))}
  </div>
);

const BookPreview = ({ t, state, openPin, setOpenPin }) => (
  <div style={{ position: 'relative' }}>
    <EditPin id="book.cover" label="REPLACE COVER" openPin={openPin} setOpenPin={setOpenPin} position={{ top: 10, left: 14 }} color={ED.pink} />
    <EditPin id="book.copy" label="EDIT BLURB" openPin={openPin} setOpenPin={setOpenPin} position={{ top: 10, right: 14 }} color={ED.blue} />
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 14, background: '#fef9e6', borderRadius: 4 }}>
      <div style={{ flexShrink: 0, width: 100, height: 140, background: `linear-gradient(135deg, ${t.bg2}, ${t.bg})`, borderRadius: '2px 6px 6px 2px', padding: 8, transform: 'rotate(-4deg)', boxShadow: '-6px 8px 18px rgba(0,0,0,0.5)' }}>
        <div style={{ fontFamily: F.mono, fontSize: 7, color: t.accent, letterSpacing: 1.5 }}>VOL.1</div>
        <div style={{ marginTop: 50, fontFamily: F.stencil, fontSize: 13, color: '#fff', lineHeight: 0.95 }}>THE GOAT<br/>CHRONICLES</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Permanent Marker', cursive", fontSize: 28, color: '#1a1310', lineHeight: 0.95 }}>
          writing<br />a book.
        </div>
        <p style={{ margin: '8px 0 0', fontFamily: "'Caveat', cursive", fontSize: 16, color: '#3a2a14', lineHeight: 1.2, fontWeight: 600 }}>
          grandma started it last christmas. now i'm finishing it.
        </p>
      </div>
    </div>
  </div>
);

// ── PIN EDITOR ─ what shows in the drawer when a pin is clicked
const PinEditor = ({ openPin, state, setters, onClose }) => {
  if (!openPin) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10, color: ED.inkDim,
      }}>
        <div style={{ fontSize: 32, opacity: 0.4 }}>✎</div>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: 1.5, maxWidth: 200 }}>
          Tap any <span style={{ color: ED.amber }}>edit pin</span> on the preview to change something
        </div>
        <div style={{ marginTop: 12, padding: '6px 10px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${ED.line}`, fontFamily: F.mono, fontSize: 9, letterSpacing: 1, color: ED.green }}>
          ✓ AUTOSAVE ON
        </div>
      </div>
    );
  }
  const [section, key] = openPin.split('.');
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: -4, right: -4,
        background: 'transparent', border: 'none', color: ED.inkDim,
        cursor: 'pointer', fontSize: 18, padding: 4,
      }}>×</button>
      <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2, color: ED.amber, textTransform: 'uppercase', marginBottom: 4 }}>
        EDITING · {section}
      </div>
      <div style={{ fontFamily: F.stencil, fontSize: 18, color: ED.ink, letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' }}>
        {openPin === 'hero.title'    && 'Hero headline'}
        {openPin === 'hero.bio'      && 'Hero bio copy'}
        {openPin === 'hero.mood'     && 'Mood / status'}
        {openPin === 'status.subs'   && 'Subscriber count'}
        {openPin === 'status.now'    && (state.mode === 'gaming' ? 'Currently playing' : 'Currently watching')}
        {openPin === 'replays.pinned'&& 'Pin a replay'}
        {openPin === 'about.copy'    && 'About me'}
        {openPin === 'book.cover'    && 'Book cover'}
        {openPin === 'book.copy'     && 'Book blurb'}
      </div>

      {/* The editor body — switches per pin */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(openPin === 'hero.title') && (
          <>
            <Field label="text">
              <input value={state.heroTitle} onChange={e => setters.setHeroTitle(e.target.value)}
                style={editInput} />
            </Field>
            <Field label="bottom line (gradient)">
              <input value={state.heroTitleB} onChange={e => setters.setHeroTitleB(e.target.value)}
                style={editInput} />
            </Field>
          </>
        )}
        {(openPin === 'hero.bio' || openPin === 'about.copy') && (
          <>
            {state.about.map((p, i) => (
              <Field key={i} label={i === 0 ? 'opener' : `paragraph ${i + 1}`}>
                <textarea
                  value={p}
                  onChange={e => { const c = [...state.about]; c[i] = e.target.value; setters.setAbout(c); }}
                  rows={i === 0 ? 2 : 4}
                  style={{ ...editInput, fontSize: i === 0 ? 13 : 12, fontWeight: i === 0 ? 700 : 400 }}
                />
              </Field>
            ))}
          </>
        )}
        {openPin === 'hero.mood' && (
          <Field label="mood (shows next to your name)">
            <StatusModule mood={state.mood} setMood={setters.setMood} />
          </Field>
        )}
        {openPin === 'status.subs' && (
          <Field label="manual subscriber count">
            <SubsModule subs={state.subs} setSubs={setters.setSubs} />
          </Field>
        )}
        {openPin === 'status.now' && (
          <Field label={state.mode === 'gaming' ? 'currently playing' : 'currently following'}>
            <NowPlayingModule now={state.now} setNow={setters.setNow} mode={state.mode} />
          </Field>
        )}
        {openPin === 'replays.pinned' && (
          <PinnedVideoModule pinned={state.pinned} setPinned={setters.setPinned} />
        )}
        {openPin === 'book.cover' && (
          <>
            <Field label="cover image">
              <ImageDropzone label="drop a photo of the book cover" />
            </Field>
            <Field label="cover title (max 2 lines)">
              <input value={state.bookTitle} onChange={e => setters.setBookTitle(e.target.value)} style={editInput} />
            </Field>
          </>
        )}
        {openPin === 'book.copy' && (
          <Field label="blurb">
            <textarea value={state.bookBlurb} onChange={e => setters.setBookBlurb(e.target.value)} rows={4} style={editInput} />
          </Field>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <div style={{ fontFamily: F.mono, fontSize: 9, color: ED.inkDim, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
    {children}
  </div>
);

const editInput = {
  width: '100%', padding: '8px 10px',
  background: 'rgba(0,0,0,0.55)',
  border: `1px solid ${ED.line}`,
  borderRadius: 3,
  color: ED.ink,
  fontFamily: F.body, fontSize: 13, fontWeight: 500,
  lineHeight: 1.4, resize: 'vertical', outline: 'none',
};

const ImageDropzone = ({ label = 'drop image here' }) => (
  <div style={{
    padding: 18, textAlign: 'center',
    background: 'rgba(0,0,0,0.4)',
    border: `2px dashed ${ED.line}`,
    borderRadius: 4, cursor: 'pointer',
  }}>
    <div style={{ fontSize: 28, color: ED.amber, opacity: 0.6 }}>📷</div>
    <div style={{ fontFamily: F.mono, fontSize: 10, color: ED.inkDim, letterSpacing: 1, marginTop: 4 }}>{label}</div>
    <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 9, color: ED.amber }}>or paste a URL</div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════
// ROOT — assembles everything responsively.
// ════════════════════════════════════════════════════════════════════════
const EditRoot = ({ size = 'phone' }) => {
  // === state ===
  const [tab, setTab] = useState('inline');
  const [msg, setMsg] = useState('1K SUBS PARTY · FRIDAY 7PM');
  const [payload, setPayload] = useState('confetti');
  const [fuse, setFuse] = useState('visit');
  const [mode, setMode] = useState('gaming');
  const [mood, setMood] = useState('online');
  const [subs, setSubs] = useState(K.subs.current);
  const [now, setNow] = useState(K.now.gaming.playing);
  const [pinned, setPinned] = useState('v1');
  const [about, setAbout] = useState(K.about);

  // Inline-edit fields not in the deck modules
  const [heroTitle, setHeroTitle] = useState('KHALIL');
  const [heroTitleB, setHeroTitleB] = useState('THE GOAT');
  const [bookTitle, setBookTitle] = useState('THE GOAT CHRONICLES');
  const [bookBlurb, setBookBlurb] = useState("grandma started it last christmas. now i'm finishing it myself — stories, drawings, and the funniest stuff that happens at school.");

  const state = { msg, payload, fuse, mode, mood, subs, now, pinned, about, heroTitle, heroTitleB, bookTitle, bookBlurb };
  const setters = { setMsg, setPayload, setFuse, setMode, setMood, setSubs, setNow, setPinned, setAbout, setHeroTitle, setHeroTitleB, setBookTitle, setBookBlurb };

  const [launchNonce, fire] = useNonce();
  const [launching, setLaunching] = useState(false);

  const onFire = () => {
    if (!msg.trim() || launching) return;
    setLaunching(true);
    fire();
    setTimeout(() => setLaunching(false), 1500);
  };

  const isDesktop = size === 'desktop';
  const isTablet  = size === 'tablet';
  const isPhone   = size === 'phone';

  return (
    <div style={{
      position: 'relative',
      width: '100%', minHeight: '100%',
      background: ED.bg,
      backgroundImage: `
        linear-gradient(${ED.bgGrid} 1px, transparent 1px),
        linear-gradient(90deg, ${ED.bgGrid} 1px, transparent 1px)
      `,
      backgroundSize: '32px 32px',
      color: ED.ink,
      fontFamily: F.body,
    }}>
      <TopBar size={size} mode={mode} onExit={() => {}} onSave={() => {}} tab={tab} setTab={setTab} />

      <div style={{
        padding: isDesktop ? '20px 24px 40px' : isTablet ? '14px 16px 28px' : '12px 12px 24px',
      }}>
        {tab === 'inline' && (
          <InlineEditView size={size} state={state} setters={setters} />
        )}

        {tab === 'deck' && (
          <div style={{
            display: 'grid',
            gap: isDesktop ? 16 : 12,
            gridTemplateColumns: isDesktop ? '1.15fr 1fr' : '1fr',
            alignItems: 'start',
          }}>
            {/* LEFT: launcher */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 16 : 12 }}>
              <MessageLauncher
                size={size}
                msg={msg} setMsg={setMsg}
                payload={payload} setPayload={setPayload}
                fuse={fuse} setFuse={setFuse}
                onFire={onFire}
                launching={launching}
              />
              <LaunchWindow
                size={size}
                mode={mode} setMode={setMode}
                msg={msg} payload={payload}
                launchNonce={launchNonce} launching={launching}
              />
            </div>

            {/* RIGHT: instruments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 14 : 12 }}>
              <StatusModule mood={mood} setMood={setMood} />
              <SubsModule subs={subs} setSubs={setSubs} />
              <NowPlayingModule now={now} setNow={setNow} mode={mode} />
              <PinnedVideoModule pinned={pinned} setPinned={setPinned} />
              {(isDesktop || isTablet) && <AboutModule about={about} setAbout={setAbout} />}
            </div>

            {/* On phone, About goes at the bottom across full width */}
            {isPhone && (
              <AboutModule about={about} setAbout={setAbout} />
            )}
          </div>
        )}
      </div>

      {/* Footer reading */}
      <div style={{
        padding: isPhone ? '8px 12px 22px' : '16px 24px',
        borderTop: `1px solid ${ED.line}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: F.mono, fontSize: 9, letterSpacing: 1.5, color: ED.inkDim,
      }}>
        <span>SYS · v0.8 · {tab.toUpperCase()} · build {String(launchNonce).padStart(3,'0')}</span>
        <span>{isPhone ? '' : 'TAP THE K-LOGO 5× TO RE-ENTER THE DECK · '} KHALIL // GOAT-1</span>
      </div>
    </div>
  );
};

window.EditMobile  = () => <EditRoot size="phone" />;
window.EditTablet  = () => <EditRoot size="tablet" />;
window.EditDesktop = () => <EditRoot size="desktop" />;
})();
