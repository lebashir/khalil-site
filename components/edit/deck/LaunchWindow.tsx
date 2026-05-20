'use client';

import type { Mode } from '@/lib/content';
import { ED, FONT, PAYLOADS, type PayloadId } from './constants';
import { Panel, ToggleChip } from './primitives';
import { SiteMiniature } from './SiteMiniature';
import { Burst } from './Burst';

interface Props {
  mode: Mode;
  setMode: (m: Mode) => void;
  msg: string;
  payload: PayloadId;
  launchNonce: number;
  launching: boolean;
  isPhone: boolean;
  isDesktop: boolean;
}

// CRT preview screen. Renders a mini homepage that swaps per mode, and
// fires the Burst + shock ring + message stamp when launchNonce bumps.
export const LaunchWindow = ({
  mode,
  setMode,
  msg,
  payload,
  launchNonce,
  launching,
  isPhone,
  isDesktop
}: Props) => {
  const p = PAYLOADS.find((x) => x.id === payload) ?? PAYLOADS[0]!;
  const bg =
    mode === 'gaming'
      ? 'radial-gradient(ellipse at 50% 0%, #3a0a5a 0%, #1a0838 35%, #08010c 80%)'
      : 'linear-gradient(180deg, #001233 0%, #003366 35%, #0a4a2a 100%)';

  return (
    <Panel
      title="LAUNCH WINDOW"
      kicker="// preview · what they see on the homepage"
      accent={ED.green}
      headerRight={
        <div style={{ display: 'flex', gap: 4 }}>
          <ToggleChip active={mode === 'gaming'} color="#ff2bd6" onClick={() => setMode('gaming')}>
            🎮 GAMING
          </ToggleChip>
          <ToggleChip active={mode === 'football'} color={ED.yellow} onClick={() => setMode('football')}>
            ⚽ FOOTBALL
          </ToggleChip>
        </div>
      }
      style={{ padding: isPhone ? 12 : 16 }}
    >
      <div
        style={{
          position: 'relative',
          margin: '4px auto',
          aspectRatio: isPhone ? '4/3' : '16/9',
          background: '#000',
          border: '8px solid #1a1d22',
          borderRadius: 12,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), 0 0 0 1px #2a2f36',
          overflow: 'hidden',
          animation: launching ? 'ed-shake-mini .6s ease-out' : undefined
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: bg }}>
          <SiteMiniature mode={mode} />
          {/* Scanlines */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)'
            }}
          />
          {/* Scan beam */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '20%',
              background:
                'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
              animation: 'ed-scan 5s linear infinite',
              pointerEvents: 'none'
            }}
          />
          {launchNonce > 0 && (
            <>
              <Burst
                key={`b-${launchNonce}`}
                x={0.5}
                y={0.5}
                count={48}
                kind={p.kind}
                durationMs={1400}
                spread={isDesktop ? 360 : 240}
              />
              <div
                key={`r-${launchNonce}`}
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  border: `3px solid ${p.color}`,
                  boxShadow: `0 0 30px ${p.color}`,
                  animation: 'ed-shock-ring 900ms ease-out forwards'
                }}
              />
              {msg.trim() && (
                <div
                  key={`m-${launchNonce}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    maxWidth: '78%',
                    textAlign: 'center',
                    fontFamily: FONT.stencil,
                    fontSize: isDesktop ? 36 : isPhone ? 18 : 28,
                    letterSpacing: 1,
                    lineHeight: 1,
                    textTransform: 'uppercase',
                    color: '#fff',
                    textShadow: `0 0 20px ${p.color}, 0 4px 0 rgba(0,0,0,0.5)`,
                    animation: 'ed-msg-stamp .7s cubic-bezier(.2,1.4,.4,1) both',
                    pointerEvents: 'none'
                  }}
                >
                  {msg}
                </div>
              )}
            </>
          )}
        </div>
        {/* Bezel HUD */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: FONT.mono,
            fontSize: 8,
            letterSpacing: 1,
            color: ED.green,
            pointerEvents: 'none',
            textShadow: '0 0 4px rgba(0,0,0,0.7)'
          }}
        >
          <span>
            <span className="ed-tick">●</span> REC
          </span>
          <span>CHANNEL 7 · LIVE</span>
        </div>
      </div>
    </Panel>
  );
};
