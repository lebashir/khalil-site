'use client';

import { motion, type MotionStyle } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsNarrow } from '@/hooks/useIsNarrow';
import { useParallaxTransform } from '@/hooks/useParallaxTransform';
import { AmbientParticles } from './AmbientParticles';

// Deep purple bedroom + glowing monitor bank + LAN-party energy.
// Same depth bands as the football env so mouse parallax feels consistent
// across mode switches.

const ROOM_BG =
  'radial-gradient(ellipse 90% 60% at 50% 100%, #2a0f5a 0%, #1a0a3a 45%, #0a0420 100%)';

const POSTERS = [
  { x: 12, y: 14, w: 16, h: 22, color: '#ff2bd6', tilt: -4 },
  { x: 72, y: 10, w: 14, h: 19, color: '#00b8ff', tilt: 3 },
  { x: 40, y: 8,  w: 20, h: 12, color: '#b026ff', tilt: -1 }
];

const PIXEL_NOISE = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 17) % 100),
  y: ((i * 23) % 70),
  size: 1 + (i % 3),
  hue: i % 3 === 0 ? '#00b8ff' : i % 3 === 1 ? '#ff2bd6' : '#b026ff',
  delay: (i * 0.27) % 4
}));

interface Props {
  active: boolean;
}

export const GamingEnvironment = ({ active }: Props) => {
  const reduced = useReducedMotion();
  const narrow = useIsNarrow();
  const heavy = !narrow && !reduced;

  const bgX = useParallaxTransform('x', 5);
  const bgY = useParallaxTransform('y', 5);
  const midX = useParallaxTransform('x', 15);
  const midY = useParallaxTransform('y', 15);
  const fgX = useParallaxTransform('x', 40);
  const fgY = useParallaxTransform('y', 40);

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
      className="gaming-env pointer-events-none absolute inset-0"
      style={{
        background: ROOM_BG,
        transformStyle: 'preserve-3d',
        opacity: active ? 1 : 0,
        transition: 'opacity 350ms ease-out'
      }}
      aria-hidden
    >
      {/* BACKGROUND ─ room wall + pixel noise + abstract posters */}
      <motion.div className="absolute inset-0" style={{ ...bgStyle, transformStyle: 'preserve-3d' }}>
        {/* Pixel-noise texture */}
        {heavy &&
          PIXEL_NOISE.map((p, i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: p.hue,
                opacity: 0.18,
                animation: `pixel-blink 3.2s steps(2) ${p.delay}s infinite`
              }}
            />
          ))}

        {/* Posters */}
        {POSTERS.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-sm border border-white/15"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.w}%`,
              height: `${p.h}%`,
              transform: `rotate(${p.tilt}deg)`,
              background: `linear-gradient(135deg, ${p.color}33 0%, ${p.color}10 60%, transparent 100%)`,
              boxShadow: `0 0 18px ${p.color}22`
            }}
          />
        ))}
      </motion.div>

      {/* MIDGROUND ─ monitor bank + glow + scanlines */}
      <motion.div className="absolute inset-0" style={{ ...midStyle, transformStyle: 'preserve-3d' }}>
        {/* Monitor bank — three screens behind the character */}
        <div className="absolute inset-x-0 top-[20%] flex justify-center gap-[1.5%]">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="relative"
              style={{
                width: i === 1 ? '28%' : '20%',
                aspectRatio: '16 / 10',
                transform: `perspective(800px) rotateY(${i === 0 ? 14 : i === 2 ? -14 : 0}deg)`
              }}
            >
              {/* Monitor frame */}
              <div
                className="absolute inset-0 rounded-md border border-white/15 bg-[#04081f]"
                style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.05)' }}
              />
              {/* Screen glow */}
              <div
                className="absolute inset-[6px] rounded-sm overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, var(--mon-from, #00b8ff) 0%, var(--mon-to, #b026ff) 100%)',
                  animation: heavy ? `monitor-cycle 6.5s ease-in-out ${i * 1.2}s infinite` : undefined,
                  filter: 'saturate(1.1)'
                }}
              />
              {/* Scanlines */}
              {heavy && (
                <div
                  className="absolute inset-[6px] rounded-sm"
                  style={{
                    background:
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px)',
                    mixBlendMode: 'screen',
                    animation: 'scanline-drift 2.4s linear infinite'
                  }}
                />
              )}
              {/* Fan glow ring */}
              <div
                className="absolute -inset-[6px] rounded-md pointer-events-none"
                style={{
                  boxShadow: '0 0 24px 2px rgba(176,38,255,0.35), 0 0 60px 6px rgba(0,184,255,0.18)',
                  animation: heavy ? 'fan-glow 4.5s ease-in-out infinite' : undefined
                }}
              />
            </div>
          ))}
        </div>

        {/* Cyan/magenta floor uplight reflecting the monitors */}
        <div
          className="absolute inset-x-0 bottom-0 h-[40%]"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(0,184,255,0.18) 0%, rgba(176,38,255,0.12) 35%, transparent 75%)'
          }}
        />
      </motion.div>

      {/* FOREGROUND ─ desk surface, controller, headset, RGB strip */}
      <motion.div className="absolute inset-0" style={{ ...fgStyle, transformStyle: 'preserve-3d' }}>
        {/* Desk surface */}
        <div
          className="absolute inset-x-0 bottom-0 h-[22%]"
          style={{
            background:
              'linear-gradient(to top, #050315 0%, #0b0628 60%, rgba(11,6,40,0.5) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 14px 30px rgba(0,184,255,0.08)'
          }}
        />

        {/* RGB strip along the back of the desk */}
        {heavy && (
          <div
            className="absolute inset-x-[10%] bottom-[22%] h-[3px] rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #00b8ff 0%, #b026ff 50%, #ff2bd6 100%)',
              filter: 'blur(1px)',
              opacity: 0.85,
              animation: 'rgb-shift 6s linear infinite'
            }}
          />
        )}

        {/* Controller on the desk (left) with blinking LED */}
        <svg
          className="absolute bottom-[6%] left-[14%] w-[80px] sm:w-[110px]"
          viewBox="0 0 110 60"
          aria-hidden
        >
          <defs>
            <linearGradient id="ctrl-body" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1c1640" />
              <stop offset="100%" stopColor="#080419" />
            </linearGradient>
          </defs>
          <path
            d="M14 16 Q4 20 4 36 Q4 52 18 52 L34 52 Q42 38 55 38 Q68 38 76 52 L92 52 Q106 52 106 36 Q106 20 96 16 Q86 12 76 18 L55 22 L34 18 Q24 12 14 16 Z"
            fill="url(#ctrl-body)"
            stroke="rgba(176,38,255,0.4)"
            strokeWidth="1"
          />
          <circle cx="28" cy="30" r="3" fill="#00b8ff" opacity="0.85" />
          <circle cx="82" cy="30" r="3" fill="#ff2bd6" opacity="0.85" />
          <circle cx="55" cy="28" r="2.4" fill="#b026ff">
            {!reduced && (
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
            )}
          </circle>
        </svg>

        {/* Headset on the desk (right) */}
        <svg
          className="absolute bottom-[8%] right-[12%] w-[68px] sm:w-[90px]"
          viewBox="0 0 90 70"
          aria-hidden
        >
          <path
            d="M10 38 Q10 12 45 12 Q80 12 80 38"
            stroke="#1a1240"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="4" y="34" width="16" height="26" rx="6" fill="#1a1240" stroke="rgba(255,43,214,0.5)" />
          <rect x="70" y="34" width="16" height="26" rx="6" fill="#1a1240" stroke="rgba(0,184,255,0.5)" />
          <circle cx="12" cy="46" r="3" fill="#ff2bd6">
            {!reduced && (
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="78" cy="46" r="3" fill="#00b8ff" />
        </svg>
      </motion.div>

      {/* Only mount the canvas system when this env is active — saves ~1.5ms/frame
          on the inactive mode. */}
      {heavy && active && <AmbientParticles mode="gaming" />}
    </div>
  );
};
