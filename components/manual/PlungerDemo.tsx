'use client';

import { useRef, useState, type CSSProperties } from 'react';
import type { ArenaTheme } from '@/components/arena/theme';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import { PAYLOADS, FUSES, type PayloadId, type FuseId } from '@/components/edit/deck/constants';

interface Props {
  theme: ArenaTheme;
  size: ArenaSize;
}

const FONT_DISPLAY = "'Anton', sans-serif";
const FONT_MONO = "'DM Mono', ui-monospace, monospace";

const DEMO_MESSAGE = '1K SUBS PARTY · FRIDAY 7PM';
const CONFETTI_COLORS = ['#ff2bd6', '#00f0ff', '#ffe600', '#3df562', '#ffd700', '#ff6a6a'];

// Standalone interactive plunger toy embedded in Part 6. NOT wired to
// any real announcement — it just demonstrates the picker UI and fires
// a confetti burst on press. Source of truth for payload/fuse options
// is the shared constants file so this stays in sync with the real
// MessageLauncher in /edit.
export const PlungerDemo = ({ theme, size }: Props) => {
  const isPhone = size === 'phone';
  const [payload, setPayload] = useState<PayloadId>('confetti');
  const [fuse, setFuse] = useState<FuseId>('now');
  const [firing, setFiring] = useState(false);
  const burstRef = useRef<HTMLButtonElement | null>(null);

  const selectedPayload = PAYLOADS.find((p) => p.id === payload) ?? PAYLOADS[0]!;
  const selectedFuse = FUSES.find((f) => f.id === fuse) ?? FUSES[0]!;

  const fire = () => {
    setFiring(true);
    window.setTimeout(() => setFiring(false), 600);
    burst();
  };

  // Confetti burst — spawn 28 colored squares at the plunger center,
  // animate them outward via the shared k-confetti keyframe (which reads
  // --dx, --dy, --dr CSS vars), then remove from the DOM after the
  // animation finishes.
  const burst = () => {
    const host = burstRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 28; i++) {
      const el = document.createElement('div');
      const dx = (Math.random() * 300 - 150).toFixed(0);
      const dy = (-150 - Math.random() * 200).toFixed(0);
      const dr = (Math.random() * 720 - 360).toFixed(0);
      el.style.position = 'fixed';
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? '#fff';
      el.style.borderRadius = '2px';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '999';
      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.style.setProperty('--dr', `${dr}deg`);
      el.style.animation = 'k-confetti 1.2s cubic-bezier(.2,.7,.4,1) forwards';
      document.body.appendChild(el);
      window.setTimeout(() => el.remove(), 1300);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr',
        gap: 20,
        margin: '20px 0'
      }}
    >
      {/* CRT-style live preview */}
      <div
        style={{
          background: '#0a0d0f',
          border: `2px solid ${theme.accent}`,
          borderRadius: 8,
          padding: 22,
          boxShadow: `0 0 32px ${theme.accent}40, inset 0 0 24px rgba(0,0,0,0.7)`,
          position: 'relative',
          overflow: 'hidden',
          animation: firing ? 'k-stamp-in .55s cubic-bezier(.2,1.2,.4,1)' : 'none'
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: 2,
            color: theme.accent,
            textTransform: 'uppercase',
            marginBottom: 14
          }}
        >
          ◇ LAUNCH WINDOW · LIVE PREVIEW
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 28,
            lineHeight: 1.05,
            color: theme.fg,
            textShadow: `0 0 14px ${theme.accent}`,
            marginBottom: 14
          }}
        >
          {DEMO_MESSAGE}
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: 1.5,
            color: theme.accent2,
            textTransform: 'uppercase'
          }}
        >
          PAYLOAD: {selectedPayload.emoji} {selectedPayload.name} · FUSE: {selectedFuse.name}
        </div>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Controls — payload + fuse pickers + the FIRE plunger */}
      <div>
        <PickerLabel theme={theme}>PAYLOAD</PickerLabel>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 14
          }}
        >
          {PAYLOADS.map((p) => (
            <PickerBtn
              key={p.id}
              active={p.id === payload}
              theme={theme}
              onClick={() => setPayload(p.id)}
            >
              {p.emoji} {p.name}
            </PickerBtn>
          ))}
        </div>

        <PickerLabel theme={theme}>FUSE</PickerLabel>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 18
          }}
        >
          {FUSES.map((f) => (
            <PickerBtn
              key={f.id}
              active={f.id === fuse}
              theme={theme}
              onClick={() => setFuse(f.id)}
            >
              {f.name}
            </PickerBtn>
          ))}
        </div>

        <button
          ref={burstRef}
          onClick={fire}
          style={{
            width: '100%',
            padding: '20px 0',
            background: 'linear-gradient(180deg, #ff3a3a 0%, #a01010 100%)',
            color: '#fff',
            fontFamily: FONT_DISPLAY,
            fontSize: 28,
            letterSpacing: 3,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255,58,58,0.45), inset 0 -4px 0 rgba(0,0,0,0.3)',
            transform: firing ? 'translateY(8px)' : 'translateY(0)',
            transition: 'transform .12s ease-out'
          }}
        >
          ▼ FIRE
        </button>
        <div
          style={{
            marginTop: 8,
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: 2,
            color: theme.accent,
            textAlign: 'center',
            opacity: 0.7
          }}
        >
          PRESS TO FIRE · KA-CHUNK
        </div>
      </div>
    </div>
  );
};

// ── helpers ────────────────────────────────────────────────────────────

const PickerLabel = ({ theme, children }: { theme: ArenaTheme; children: string }) => (
  <div
    style={{
      fontFamily: FONT_MONO,
      fontSize: 10,
      letterSpacing: 2,
      color: theme.accent,
      textTransform: 'uppercase',
      marginBottom: 8
    }}
  >
    {children}
  </div>
);

interface PickerBtnProps {
  active: boolean;
  theme: ArenaTheme;
  onClick: () => void;
  children: React.ReactNode;
}

const PickerBtn = ({ active, theme, onClick, children }: PickerBtnProps) => {
  const base: CSSProperties = {
    padding: '8px 12px',
    background: active ? `${theme.accent}25` : 'rgba(0,0,0,0.4)',
    border: `1px solid ${active ? theme.accent : 'rgba(255,255,255,0.15)'}`,
    color: active ? theme.accent : 'rgba(255,255,255,0.7)',
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: 1.5,
    cursor: 'pointer',
    borderRadius: 3,
    textTransform: 'uppercase',
    transition: 'all .15s ease',
    boxShadow: active ? `0 0 12px ${theme.accent}50` : 'none'
  };
  return (
    <button type="button" onClick={onClick} style={base}>
      {children}
    </button>
  );
};
