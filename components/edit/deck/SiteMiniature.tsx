import type { Mode } from '@/lib/content';
import { FONT } from './constants';

interface Props {
  mode: Mode;
}

// Tiny faux-homepage rendered inside the CRT bezel so Khalil can see
// approximately what visitors see when the launcher fires.
export const SiteMiniature = ({ mode }: Props) => {
  const accent = mode === 'gaming' ? '#00f0ff' : '#ffd700';
  const accent2 = mode === 'gaming' ? '#ff2bd6' : '#ffffff';
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '8% 5%', fontFamily: FONT.mono }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 14,
              height: 14,
              background: `linear-gradient(135deg, ${accent}, ${accent2})`,
              borderRadius: 2
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: '#fff',
              fontFamily: FONT.stencil,
              letterSpacing: 1
            }}
          >
            KHALIL
          </span>
        </div>
        <span style={{ fontSize: 7, color: accent, letterSpacing: 1 }}>● ONLINE</span>
      </div>
      <div
        style={{
          fontFamily: FONT.stencil,
          fontSize: 22,
          color: '#fff',
          lineHeight: 0.9,
          letterSpacing: -0.5,
          textShadow: `0 0 12px ${accent}88`
        }}
      >
        KHALIL
      </div>
      <div
        style={{
          fontFamily: FONT.stencil,
          fontSize: 22,
          lineHeight: 0.9,
          letterSpacing: -0.5,
          backgroundImage: `linear-gradient(180deg, ${accent}, ${accent2})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        THE GOAT
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
          marginTop: '5%'
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              aspectRatio: '16/10',
              background: `linear-gradient(135deg, ${accent}33, ${accent2}33)`,
              border: `1px solid ${accent}66`,
              borderRadius: 2
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '8%',
          transform: 'translateX(-50%)',
          padding: '5px 14px',
          background: `linear-gradient(180deg, ${accent}, ${accent2})`,
          clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
          fontFamily: FONT.stencil,
          fontSize: 10,
          color: '#000'
        }}
      >
        ▶ SUBSCRIBE
      </div>
    </div>
  );
};
