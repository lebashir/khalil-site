'use client';

import { motion, type MotionStyle } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsNarrow } from '@/hooks/useIsNarrow';
import { useParallaxTransform } from '@/hooks/useParallaxTransform';
import { AmbientParticles } from './AmbientParticles';

// 3D-layered stadium environment. Three depth bands compose into a single 3D
// scene; mouse parallax shifts each band by an amount inversely proportional to
// its z-distance, so the background drifts least and the foreground drifts most.

const STADIUM_BG = 'radial-gradient(ellipse 90% 55% at 50% 110%, #0d2960 0%, #051540 45%, #02081f 100%)';

const STARS = Array.from({ length: 32 }, (_, i) => ({
  cx: (i * 53) % 100,
  cy: ((i * 31) % 60) + 2,
  r: 0.4 + (i % 4) * 0.25,
  delay: (i * 0.37) % 6
}));

const BOKEH = Array.from({ length: 14 }, (_, i) => ({
  left: ((i * 71) % 100),
  top: 58 + ((i * 13) % 20),
  size: 10 + ((i * 7) % 18),
  delay: (i * 0.6) % 5,
  hue: i % 2 === 0 ? '#fff5b8' : '#cfe0ff'
}));

const GRASS_BLADES = Array.from({ length: 60 }, (_, i) => ({
  left: (i * 1.67) % 100,
  height: 14 + ((i * 13) % 16),
  delay: (i * 0.07) % 3,
  hueShift: (i % 5) * 4
}));

interface Props {
  active: boolean;
}

export const FootballEnvironment = ({ active }: Props) => {
  const reduced = useReducedMotion();
  const narrow = useIsNarrow();
  const heavy = !narrow && !reduced;

  // Parallax amounts (px) per the v2 brief.
  const bgX = useParallaxTransform('x', 5);
  const bgY = useParallaxTransform('y', 5);
  const midX = useParallaxTransform('x', 15);
  const midY = useParallaxTransform('y', 15);
  const fgX = useParallaxTransform('x', 40);
  const fgY = useParallaxTransform('y', 40);

  // perspective(1500) projects translateZ values smaller as they recede; scale
  // each layer up to compensate so its content still fills the section edge-to-edge.
  const bgStyle: MotionStyle = reduced
    ? { transform: 'translateZ(-400px) scale(1.27)' }
    : { x: bgX, y: bgY, translateZ: -400, scale: 1.27 };
  const midStyle: MotionStyle = reduced
    ? { transform: 'translateZ(-150px) scale(1.10)' }
    : { x: midX, y: midY, translateZ: -150, scale: 1.10 };
  const fgStyle: MotionStyle = reduced
    ? { transform: 'translateZ(80px) scale(0.95)' }
    : { x: fgX, y: fgY, translateZ: 80, scale: 0.95 };

  return (
    <div
      className="football-env pointer-events-none absolute inset-0"
      style={{
        background: STADIUM_BG,
        transformStyle: 'preserve-3d',
        opacity: active ? 1 : 0,
        transition: 'opacity 350ms ease-out'
      }}
      aria-hidden
    >
      {/* BACKGROUND ─ sky + stars + far stadium tier + bokeh stand lights */}
      <motion.div className="absolute inset-0" style={{ ...bgStyle, transformStyle: 'preserve-3d' }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#ffffff"
              style={{
                opacity: 0.55,
                animation: heavy ? `star-twinkle 4.5s ease-in-out ${s.delay}s infinite` : undefined
              }}
            />
          ))}
        </svg>

        {/* Far stadium tier silhouette */}
        <div
          className="absolute inset-x-0 bottom-0 h-[36%]"
          style={{
            background:
              'linear-gradient(to top, #04143a 0%, #04143a 35%, transparent 100%)',
            maskImage:
              'linear-gradient(to top, black 50%, transparent 100%), repeating-linear-gradient(to right, black 0 8px, transparent 8px 10px)',
            WebkitMaskImage:
              'linear-gradient(to top, black 50%, transparent 100%), repeating-linear-gradient(to right, black 0 8px, transparent 8px 10px)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in'
          }}
        />

        {/* Bokeh stand lights — small soft-glow dots, slow drift */}
        {heavy &&
          BOKEH.map((b, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: b.size,
                height: b.size,
                background: `radial-gradient(circle, ${b.hue} 0%, transparent 70%)`,
                filter: 'blur(2px)',
                opacity: 0.7,
                animation: `bokeh-drift 7s ease-in-out ${b.delay}s infinite`
              }}
            />
          ))}
      </motion.div>

      {/* MIDGROUND ─ floodlight glare overlays + scoreboard + dust beams */}
      <motion.div className="absolute inset-0" style={{ ...midStyle, transformStyle: 'preserve-3d' }}>
        {/* Two giant floodlight beams from upper edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 8% -10%, rgba(255,245,200,0.45) 0%, transparent 32%), radial-gradient(circle at 92% -10%, rgba(255,245,200,0.45) 0%, transparent 32%)',
            animation: heavy ? 'floodlight-pulse 5.4s ease-in-out infinite' : undefined
          }}
        />

        {/* Floodlight masts (left + right) */}
        <svg
          className="absolute left-[4%] top-0 h-[55%] w-[40px]"
          viewBox="0 0 40 200"
          preserveAspectRatio="xMidYMin meet"
          aria-hidden
        >
          <rect x="18" y="28" width="4" height="172" fill="#0e1a3a" />
          <rect x="6" y="10" width="28" height="20" rx="3" fill="#0e1a3a" />
          {[0, 1, 2, 3].map(c =>
            [0, 1, 2].map(r => (
              <rect
                key={`${c}-${r}`}
                x={8 + c * 6}
                y={12 + r * 6}
                width="4"
                height="4"
                fill="#fff5b8"
                style={{ opacity: 0.85 }}
              />
            ))
          )}
        </svg>
        <svg
          className="absolute right-[4%] top-0 h-[55%] w-[40px]"
          viewBox="0 0 40 200"
          preserveAspectRatio="xMidYMin meet"
          aria-hidden
        >
          <rect x="18" y="28" width="4" height="172" fill="#0e1a3a" />
          <rect x="6" y="10" width="28" height="20" rx="3" fill="#0e1a3a" />
          {[0, 1, 2, 3].map(c =>
            [0, 1, 2].map(r => (
              <rect
                key={`${c}-${r}`}
                x={8 + c * 6}
                y={12 + r * 6}
                width="4"
                height="4"
                fill="#fff5b8"
                style={{ opacity: 0.85 }}
              />
            ))
          )}
        </svg>

        {/* Scoreboard at upper-right */}
        <div
          className="absolute right-[7%] top-[12%] hidden rounded-lg border border-amber-300/40 bg-[#031044]/70 px-3 py-1.5 font-display text-[10px] uppercase tracking-widest text-amber-200 shadow-[0_0_24px_rgba(255,215,0,0.25)] backdrop-blur-sm sm:block"
          style={{ textShadow: '0 0 6px rgba(255,215,0,0.7)' }}
        >
          <div className="text-[8px] tracking-[0.35em] text-white/60">live</div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-amber-200">KHALIL</span>
            <span className="text-white">7</span>
            <span className="text-white/40">·</span>
            <span className="text-white">0</span>
            <span className="text-white/60">RIVALS</span>
          </div>
        </div>

        {/* Dust beams cutting down from each floodlight */}
        {heavy && (
          <>
            <div
              className="absolute left-[6%] top-0 h-full w-[18%] origin-top"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,245,200,0.18) 0%, rgba(255,245,200,0.04) 60%, transparent 100%)',
                transform: 'skewX(10deg)',
                animation: 'beam-pulse 6s ease-in-out infinite'
              }}
            />
            <div
              className="absolute right-[6%] top-0 h-full w-[18%] origin-top"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,245,200,0.18) 0%, rgba(255,245,200,0.04) 60%, transparent 100%)',
                transform: 'skewX(-10deg)',
                animation: 'beam-pulse 6s ease-in-out 1.5s infinite'
              }}
            />
          </>
        )}
      </motion.div>

      {/* FOREGROUND ─ turf, grass, banners, soccer ball */}
      <motion.div className="absolute inset-0" style={{ ...fgStyle, transformStyle: 'preserve-3d' }}>
        {/* Turf base */}
        <div
          className="absolute inset-x-0 bottom-0 h-[26%]"
          style={{
            background:
              'linear-gradient(to top, #0b3d1b 0%, #135827 45%, rgba(19,88,39,0.4) 100%)',
            boxShadow: 'inset 0 30px 60px rgba(0,0,0,0.45)'
          }}
        />

        {/* Stadium center-circle hint */}
        <div
          className="absolute left-1/2 bottom-[2%] h-[10%] w-[44%] -translate-x-1/2 rounded-[50%] border border-white/30"
          style={{ transform: 'translateX(-50%) perspective(420px) rotateX(72deg)' }}
        />

        {/* Grass blade row along the turf top */}
        <div className="absolute inset-x-0 bottom-[20%] flex h-[8%] items-end">
          {GRASS_BLADES.map((g, i) => (
            <span
              key={i}
              className="origin-bottom"
              style={{
                position: 'absolute',
                left: `${g.left}%`,
                width: 2,
                height: `${g.height}px`,
                background: `linear-gradient(to top, #0e4d22, hsl(${110 + g.hueShift} 60% 45%))`,
                borderRadius: '1px 1px 0 0',
                transformOrigin: 'bottom center',
                animation: heavy ? `grass-sway 3.8s ease-in-out ${g.delay}s infinite` : undefined
              }}
            />
          ))}
        </div>

        {/* Flag pennants at edges */}
        <div
          className="absolute left-3 top-[32%] h-[28%] w-1 bg-white/40"
          style={{ animation: heavy ? 'pennant-sway 5s ease-in-out infinite' : undefined, transformOrigin: 'bottom center' }}
        >
          <span
            className="absolute -right-[18px] top-0 block h-[14px] w-[18px]"
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #b08400 100%)',
              clipPath: 'polygon(0 0, 100% 50%, 0 100%)'
            }}
          />
        </div>
        <div
          className="absolute right-3 top-[36%] h-[24%] w-1 bg-white/40"
          style={{ animation: heavy ? 'pennant-sway 5s ease-in-out -1.5s infinite' : undefined, transformOrigin: 'bottom center' }}
        >
          <span
            className="absolute -left-[18px] top-0 block h-[14px] w-[18px]"
            style={{
              background: 'linear-gradient(225deg, #ffffff 0%, #cfe0ff 100%)',
              clipPath: 'polygon(100% 0, 0 50%, 100% 100%)'
            }}
          />
        </div>

        {/* Soccer ball at character's feet — idle rocking */}
        <div
          className="absolute left-1/2 bottom-[18%] -translate-x-1/2"
          style={{ animation: heavy ? 'ball-rock 3.2s ease-in-out infinite' : undefined, transformOrigin: 'center bottom' }}
        >
          <div
            className="h-9 w-9 rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 30%, #fff 40%, #d8d8d8 50%, #fff 70%), conic-gradient(from 0deg, #000 0 12deg, transparent 12deg 60deg, #000 60deg 72deg, transparent 72deg 120deg, #000 120deg 132deg, transparent 132deg 180deg, #000 180deg 192deg, transparent 192deg 240deg, #000 240deg 252deg, transparent 252deg 300deg, #000 300deg 312deg, transparent 312deg 360deg)',
              backgroundBlendMode: 'multiply'
            }}
          />
        </div>
      </motion.div>

      {/* Near-camera ambient particles — gold dust + flutters.
          Only mount when this environment is the active one, so we don't pay
          for off-screen canvas work on the inactive mode. */}
      {heavy && active && <AmbientParticles mode="football" />}
    </div>
  );
};
