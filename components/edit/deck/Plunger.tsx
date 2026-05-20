'use client';

import { ED, FONT } from './constants';

interface Props {
  onFire: () => void;
  firing: boolean;
  disabled: boolean;
}

// The giant red plunger button. Press = animates handle plunging down,
// fires the launcher. CSS-only — no SVG. Re-enables after the .9s
// animation completes (the parent toggles `firing`).
export const Plunger = ({ onFire, firing, disabled }: Props) => (
  <div style={{ position: 'relative', textAlign: 'center', userSelect: 'none' }}>
    {/* Handle (the bit that goes down) */}
    <div
      aria-hidden
      style={{
        width: 28,
        height: 38,
        margin: '0 auto',
        background: 'linear-gradient(180deg, #444 0%, #222 100%)',
        border: '1px solid #555',
        borderRadius: '4px 4px 0 0',
        animation: firing ? 'ed-plunge-down .9s cubic-bezier(.3,1.4,.4,1) forwards' : undefined
      }}
    />
    {/* Plate */}
    <div
      aria-hidden
      style={{
        width: 110,
        height: 12,
        margin: '-2px auto 0',
        background: 'linear-gradient(180deg, #2a2a2a, #0a0a0a)',
        border: '1px solid #444',
        borderRadius: 2
      }}
    />
    {/* Button cap */}
    <button
      type="button"
      onClick={!disabled ? onFire : undefined}
      disabled={disabled}
      style={{
        position: 'relative',
        marginTop: 4,
        width: 180,
        padding: '14px 0',
        background: disabled
          ? '#3a1010'
          : `radial-gradient(ellipse at 40% 30%, #ff6363 0%, ${ED.red} 60%, #8b0a0a 100%)`,
        border: `2px solid ${disabled ? '#600' : ED.red}`,
        borderRadius: '50%/40%',
        boxShadow: disabled
          ? 'none'
          : `0 0 30px ${ED.red}66, inset 0 -8px 16px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)`,
        color: '#fff',
        fontFamily: FONT.stencil,
        fontSize: 28,
        letterSpacing: 4,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}
    >
      LAUNCH
    </button>
    <div
      style={{
        marginTop: 6,
        fontFamily: FONT.mono,
        fontSize: 9,
        color: disabled ? ED.inkDim : ED.amber,
        letterSpacing: 2
      }}
    >
      {disabled ? '↑ enter a message first' : 'PRESS TO FIRE  ●●●'}
    </div>
  </div>
);
