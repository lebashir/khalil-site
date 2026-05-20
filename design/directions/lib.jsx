// Shared bits across all three mobile directions:
// - GLOBAL CSS keyframes injected once
// - useInView hook (triggers entrance animation when an element scrolls in)
// - <Burst> particle component (tap-to-pop confetti / shards / sparkles)
// - <RaisedHand> ambient micro-bg helper

(function () {
  const { useEffect, useRef, useState } = React;

  // ── Global keyframes — injected once. Used by all directions. ─────────
  if (typeof document !== 'undefined' && !document.getElementById('khalil-anim')) {
    const s = document.createElement('style');
    s.id = 'khalil-anim';
    s.textContent = `
      @keyframes k-bob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes k-bob-s { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      @keyframes k-spin  { to { transform: rotate(360deg) } }
      @keyframes k-spin-slow { to { transform: rotate(360deg) } }
      @keyframes k-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
      @keyframes k-pulse-glow { 0%,100%{filter:drop-shadow(0 0 0 currentColor)} 50%{filter:drop-shadow(0 0 18px currentColor)} }
      @keyframes k-pop-in {
        0%   { transform: scale(.3) rotate(-8deg); opacity: 0 }
        60%  { transform: scale(1.08) rotate(2deg); opacity: 1 }
        100% { transform: scale(1) rotate(var(--rot,0deg)) }
      }
      @keyframes k-stamp-in {
        0%   { transform: translateY(-30px) scale(.4); opacity: 0; filter: blur(4px) }
        70%  { transform: translateY(2px) scale(1.05); opacity: 1; filter: blur(0) }
        85%  { transform: translateY(-2px) scale(0.98) }
        100% { transform: translateY(0) scale(1) }
      }
      @keyframes k-drop-in {
        0%   { transform: translateY(-80vh) rotate(-15deg); opacity: 0 }
        60%  { transform: translateY(10px) rotate(2deg); opacity: 1 }
        100% { transform: translateY(0) rotate(var(--rot,0deg)) }
      }
      @keyframes k-tape-down {
        0% { transform: scaleX(0) rotate(var(--rot,0deg)); opacity:0 }
        100% { transform: scaleX(1) rotate(var(--rot,0deg)); opacity:1 }
      }
      @keyframes k-highlight-sweep {
        0% { transform: scaleX(0); transform-origin: left }
        100% { transform: scaleX(1); transform-origin: left }
      }
      @keyframes k-blink { 0%,92%,100% { transform: scaleY(1) } 96% { transform: scaleY(.1) } }
      @keyframes k-drift-x {
        0%,100% { transform: translateX(0) }
        50%     { transform: translateX(8px) }
      }
      @keyframes k-flash {
        0% { opacity: 0 }
        20% { opacity: 1 }
        100% { opacity: 0 }
      }
      @keyframes k-shake {
        0%,100% { transform: translate(0,0) }
        20% { transform: translate(-4px, 2px) }
        40% { transform: translate(3px, -3px) }
        60% { transform: translate(-2px, 3px) }
        80% { transform: translate(3px, 1px) }
      }
      @keyframes k-rise-fade {
        0% { transform: translateY(0); opacity: 1 }
        100% { transform: translateY(-260px); opacity: 0 }
      }
      @keyframes k-confetti {
        0%   { transform: translate(0,0) rotate(0); opacity:1 }
        100% { transform: translate(var(--dx),var(--dy)) rotate(var(--dr)); opacity:0 }
      }
      @keyframes k-scanline {
        0% { transform: translateY(-100%) } 100% { transform: translateY(100vh) }
      }
      @keyframes k-glow-pulse {
        0%,100% { box-shadow: 0 0 0 0 var(--glow-c, rgba(255,255,255,0.4)) }
        50%     { box-shadow: 0 0 30px 4px var(--glow-c, rgba(255,255,255,0.5)) }
      }
      @keyframes k-ring-out {
        0% { transform: scale(.5); opacity: .7 }
        100% { transform: scale(3); opacity: 0 }
      }
      @keyframes k-cursor-blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
      @keyframes k-counter-ticker { 0% { transform: translateY(0) } 100% { transform: translateY(-100%) } }
      @keyframes k-marker-write {
        0% { stroke-dashoffset: 1000 }
        100% { stroke-dashoffset: 0 }
      }
      .k-bob     { animation: k-bob 3.4s ease-in-out infinite }
      .k-bob-s   { animation: k-bob-s 2.6s ease-in-out infinite }
      .k-spin-s  { animation: k-spin-slow 40s linear infinite }
      .k-shimmer { background-size: 200% 100%; animation: k-shimmer 4s linear infinite }
      .k-blink   { animation: k-blink 4s ease-in-out infinite; transform-origin: center }
      .k-drift   { animation: k-drift-x 6s ease-in-out infinite }
      .k-stamp-in { animation: k-stamp-in .55s cubic-bezier(.2,1.2,.4,1) backwards }
      .k-pop-in  { animation: k-pop-in .5s cubic-bezier(.2,1.4,.4,1) backwards }
      .k-drop-in { animation: k-drop-in .7s cubic-bezier(.3,1.2,.4,1) backwards }
    `;
    document.head.appendChild(s);
  }

  // ── useInView ──────────────────────────────────────────────────────────
  // Returns [ref, inView]. Once true, stays true (so animations don't replay).
  window.useInView = (opts = {}) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
      const node = ref.current;
      if (!node || typeof IntersectionObserver === 'undefined') {
        setInView(true);
        return;
      }
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              setInView(true);
              obs.disconnect();
            }
          });
        },
        { threshold: opts.threshold ?? 0.15, root: opts.root ?? null }
      );
      obs.observe(node);
      return () => obs.disconnect();
    }, []);
    return [ref, inView];
  };

  // ── <Burst> — confetti/sparks particle component ───────────────────────
  // Render with key={nonce} to fire a new burst.
  window.Burst = ({ x = 0.5, y = 0.5, count = 20, kind = 'confetti', colors, durationMs = 900, spread = 220, onDone }) => {
    const [parts] = useState(() => {
      const palette = colors ?? (
        kind === 'gold' ? ['#ffd700', '#ffb35a', '#ffe48f', '#fff7c2'] :
        kind === 'neon' ? ['#00f0ff', '#b026ff', '#ff2bd6', '#ffe600'] :
        kind === 'paper' ? ['#ec5b3f', '#fde26a', '#7ec6c2', '#3aa867', '#9b6dc4', '#ec9b9b'] :
        kind === 'glass' ? ['#a9d4ff', '#f0c2ff', '#b9ffe0', '#ffd6a8', '#ffc4d8'] :
        ['#fff', '#ddd']
      );
      return Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = spread * (0.4 + Math.random() * 0.7);
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - spread * 0.3, // bias up
          dr: (Math.random() - 0.5) * 720,
          size: 4 + Math.random() * (kind === 'confetti' || kind === 'paper' ? 8 : 6),
          color: palette[Math.floor(Math.random() * palette.length)],
          delay: Math.random() * 120,
          shape: Math.random() < 0.4 ? 'rect' : 'circ',
        };
      });
    });

    useEffect(() => {
      if (!onDone) return;
      const t = setTimeout(onDone, durationMs + 200);
      return () => clearTimeout(t);
    }, []);

    return (
      <div style={{
        position: 'absolute',
        left: `${x * 100}%`, top: `${y * 100}%`,
        pointerEvents: 'none', zIndex: 90,
        width: 0, height: 0,
      }}>
        {parts.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: -p.size / 2, top: -p.size / 2,
            width: p.size, height: p.size * (p.shape === 'rect' ? 0.5 : 1),
            background: p.color,
            borderRadius: p.shape === 'circ' ? '50%' : 2,
            '--dx': p.dx + 'px', '--dy': p.dy + 'px', '--dr': p.dr + 'deg',
            animation: `k-confetti ${durationMs}ms cubic-bezier(.25,.7,.45,1) ${p.delay}ms both`,
          }} />
        ))}
      </div>
    );
  };

  // ── <Ripple> — circular wave ring (e.g. behind toggle when it fires) ───
  window.Ripple = ({ color = 'rgba(255,255,255,0.5)', size = 80 }) => (
    <span style={{
      position: 'absolute',
      left: '50%', top: '50%',
      width: size, height: size,
      marginLeft: -size / 2, marginTop: -size / 2,
      borderRadius: '50%',
      border: `2px solid ${color}`,
      animation: 'k-ring-out 700ms ease-out forwards',
      pointerEvents: 'none',
    }} />
  );

  // ── Helper: bump a nonce to retrigger a burst ──────────────────────────
  window.useNonce = () => {
    const [n, setN] = useState(0);
    return [n, () => setN(x => x + 1)];
  };

  // ── <Defer ms placeholder> — mounts children after `ms` ms.
  // Used to stagger heavy artboard renders so the main thread stays
  // responsive during initial page load (otherwise 6 prototypes mount in
  // one synchronous burst and the page hangs).
  window.Defer = ({ ms = 0, placeholder = null, children }) => {
    const [ready, setReady] = useState(ms === 0);
    useEffect(() => {
      if (ms === 0) return;
      const t = setTimeout(() => setReady(true), ms);
      return () => clearTimeout(t);
    }, [ms]);
    return ready ? children : placeholder;
  };

  // ── Standard "loading" placeholder shown by Defer slots. ───────────────
  window.LoadingPanel = ({ label = 'LOADING' }) => (
    React.createElement('div', {
      style: {
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0420 0%, #1a0838 60%, #2a0a4a 100%)',
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.7)',
      }
    },
      React.createElement('div', {
        style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }
      },
        React.createElement('div', {
          style: {
            width: 36, height: 36, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            borderTopColor: '#00f0ff',
            animation: 'k-spin 1s linear infinite',
          }
        }),
        React.createElement('div', null, label)
      )
    )
  );

  // ── useScrollProgress — track scroll progress through a wrapper element. ─
  // Returns ref + progress in [0,1]. Looks up the nearest scrollable ancestor
  // and listens to its scroll events. Progress is computed from the wrapper's
  // bounding rect relative to the scroll container's viewport, so it works
  // both at window level and inside the iOS frame's internal scroll.
  window.useScrollProgress = () => {
    const ref = useRef(null);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      let parent = el.parentElement;
      while (parent) {
        const oy = getComputedStyle(parent).overflowY;
        if (oy === 'auto' || oy === 'scroll') break;
        parent = parent.parentElement;
      }
      const target = parent || window;
      const compute = () => {
        const rect = el.getBoundingClientRect();
        const pRect = parent
          ? parent.getBoundingClientRect()
          : { top: 0, height: window.innerHeight };
        const wrapperTop = rect.top - pRect.top;
        const denom = Math.max(1, rect.height - pRect.height);
        const p = Math.max(0, Math.min(1, -wrapperTop / denom));
        setProgress(p);
      };
      target.addEventListener('scroll', compute, { passive: true });
      window.addEventListener('resize', compute);
      compute();
      return () => {
        target.removeEventListener('scroll', compute);
        window.removeEventListener('resize', compute);
      };
    }, []);
    return [ref, progress];
  };

  // ── useScrollHero — like useScrollProgress, but ALSO returns the height of
  // the nearest scrolling container. Use this to size a sticky stage and its
  // tall scroll-track wrapper in actual pixels (vh and % don't work right
  // inside small nested frames).
  // Returns [ref, progress, containerHeight].
  //
  // Throttled with rAF (max one update per frame) and bails out if progress
  // hasn't changed meaningfully — guards against the obvious re-render loop
  // where setState({…}) creates a new object each call.
  window.useScrollHero = () => {
    const ref = useRef(null);
    const [progress, setProgress] = useState(0);
    const [h, setH] = useState(600);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      let parent = el.parentElement;
      while (parent) {
        const oy = getComputedStyle(parent).overflowY;
        if (oy === 'auto' || oy === 'scroll') break;
        parent = parent.parentElement;
      }
      const getH = () => parent ? parent.clientHeight : window.innerHeight;
      const target = parent || window;

      let rafId = null;
      let lastP = -1;
      let lastH = -1;
      const compute = () => {
        rafId = null;
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const ph = getH();
        const pRect = parent ? parent.getBoundingClientRect() : { top: 0 };
        const wrapperTop = rect.top - pRect.top;
        const denom = Math.max(1, rect.height - ph);
        const p = Math.max(0, Math.min(1, -wrapperTop / denom));
        // Bail out unless something actually changed (avoid re-render loop).
        if (Math.abs(p - lastP) > 0.001) { lastP = p; setProgress(p); }
        if (ph !== lastH) { lastH = ph; setH(ph); }
      };
      const schedule = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(compute);
      };

      target.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      // Single initial measurement — no ResizeObserver (scroll container is
      // fixed-size in our nested-frame setup; observing it caused render loops).
      compute();
      // Re-measure once after first paint in case fonts/layout settled later.
      const t = setTimeout(compute, 60);

      return () => {
        target.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        if (rafId !== null) cancelAnimationFrame(rafId);
        clearTimeout(t);
      };
    }, []);
    return [ref, progress, h];
  };

  // ── interpolate helper ─────────────────────────────────────────────────
  window.lerp = (a, b, t) => a + (b - a) * t;
  window.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  // Map progress p ∈ [0,1] from sub-range [from,to] to [0,1]; clamped.
  window.range = (p, from, to) => {
    if (to === from) return 0;
    return Math.max(0, Math.min(1, (p - from) / (to - from)));
  };
})();
