'use client';

import { ED, FONT, FUSES, PAYLOADS, type FuseId, type PayloadId } from './constants';
import { Panel } from './primitives';
import { Plunger } from './Plunger';

const MSG_MAX = 120;

interface Props {
  msg: string;
  setMsg: (m: string) => void;
  payload: PayloadId;
  setPayload: (p: PayloadId) => void;
  fuse: FuseId;
  setFuse: (f: FuseId) => void;
  onFire: () => void;
  launching: boolean;
  isPhone: boolean;
  isDesktop: boolean;
}

// The central instrument — write a message, pick a payload + fuse,
// slam the plunger. In step 6 firing only triggers the LaunchWindow's
// in-deck explosion; step 7 wires it to site-wide announcements.
export const MessageLauncher = ({
  msg,
  setMsg,
  payload,
  setPayload,
  fuse,
  setFuse,
  onFire,
  launching,
  isPhone,
  isDesktop
}: Props) => {
  const p = PAYLOADS.find((x) => x.id === payload) ?? PAYLOADS[0]!;

  return (
    <Panel
      title="MESSAGE LAUNCHER"
      kicker="// what visitors see when they hit the site"
      accent={ED.amber}
      style={{ padding: isPhone ? 14 : 20 }}
    >
      {/* Missile body */}
      <div
        style={{
          position: 'relative',
          margin: isPhone ? '8px auto 14px' : '12px auto 18px',
          width: '100%',
          maxWidth: isDesktop ? 520 : 400
        }}
      >
        {/* Nose cone */}
        <div
          aria-hidden
          style={{
            width: '34%',
            height: 36,
            margin: '0 auto',
            background: `linear-gradient(180deg, ${ED.red} 0%, ${ED.red}90 100%)`,
            clipPath: 'polygon(50% 0, 100% 100%, 0% 100%)',
            boxShadow: `0 0 22px ${ED.red}88`
          }}
        />
        {/* Body cylinder */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #2a3038 0%, #14181c 100%)',
            border: `1px solid ${ED.line}`,
            borderRadius: 8,
            padding: isPhone ? '10px 12px' : '14px 18px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 20px rgba(0,0,0,0.6)'
          }}
        >
          {/* Hazard stripes */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 6,
              width: 4,
              background: `repeating-linear-gradient(0deg, ${ED.yellow} 0 6px, #000 6px 12px)`,
              borderRadius: 1
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              right: 6,
              width: 4,
              background: `repeating-linear-gradient(0deg, ${ED.yellow} 0 6px, #000 6px 12px)`,
              borderRadius: 1
            }}
          />
          {/* Warning labels */}
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: '14%',
              padding: '2px 6px',
              background: '#000',
              border: `1px solid ${ED.yellow}`,
              fontFamily: FONT.mono,
              fontSize: 8,
              letterSpacing: 1.5,
              color: ED.yellow
            }}
          >
            PAYLOAD: {p.name}
          </div>
          <div
            style={{
              position: 'absolute',
              top: -10,
              right: '14%',
              padding: '2px 6px',
              background: '#000',
              border: `1px solid ${ED.amber}`,
              fontFamily: FONT.mono,
              fontSize: 8,
              letterSpacing: 1.5,
              color: ED.amber
            }}
          >
            MSG-{String(msg.length).padStart(3, '0')}/{MSG_MAX}
          </div>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value.slice(0, MSG_MAX))}
            placeholder="TYPE THE MESSAGE THAT WILL EXPLODE ON SCREEN..."
            rows={isPhone ? 3 : 4}
            style={{
              width: '100%',
              padding: '6px 12px',
              background: 'rgba(0,0,0,0.55)',
              border: `1px dashed ${ED.amber}66`,
              borderRadius: 3,
              color: ED.amber,
              fontFamily: FONT.stencil,
              fontSize: isPhone ? 16 : 22,
              letterSpacing: 1,
              lineHeight: 1.15,
              textTransform: 'uppercase',
              resize: 'none',
              outline: 'none',
              textShadow: `0 0 12px ${ED.amber}50`
            }}
          />
          {/* Fins */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: -18,
              bottom: 6,
              width: 22,
              height: 30,
              background: ED.red,
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              opacity: 0.85
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              right: -18,
              bottom: 6,
              width: 22,
              height: 30,
              background: ED.red,
              clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
              opacity: 0.85
            }}
          />
        </div>
        {/* Exhaust */}
        <div
          aria-hidden
          style={{
            width: '20%',
            height: 14,
            margin: '-2px auto 0',
            background: ED.bg,
            border: `1px solid ${ED.line}`,
            borderBottom: 'none',
            borderRadius: '0 0 4px 4px'
          }}
        />
      </div>

      {/* Payload picker */}
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          letterSpacing: 2,
          color: ED.inkDim,
          marginBottom: 5,
          textTransform: 'uppercase'
        }}
      >
        PAYLOAD
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${isPhone ? 3 : 6}, 1fr)`,
          gap: 6,
          marginBottom: 14
        }}
      >
        {PAYLOADS.map((item) => {
          const sel = item.id === payload;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPayload(item.id)}
              style={{
                padding: '8px 4px',
                background: sel ? `${item.color}1a` : 'rgba(0,0,0,0.4)',
                border: `1px solid ${sel ? item.color : ED.line}`,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all .15s',
                boxShadow: sel ? `inset 0 0 12px ${item.color}40` : 'none'
              }}
            >
              <div style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  letterSpacing: 1,
                  color: sel ? item.color : ED.inkDim,
                  marginTop: 3,
                  fontWeight: 700
                }}
              >
                {item.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Fuse picker */}
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          letterSpacing: 2,
          color: ED.inkDim,
          marginBottom: 5,
          textTransform: 'uppercase'
        }}
      >
        FUSE
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${isPhone ? 2 : 4}, 1fr)`,
          gap: 6,
          marginBottom: 16
        }}
      >
        {FUSES.map((item) => {
          const sel = item.id === fuse;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFuse(item.id)}
              style={{
                padding: '7px 6px',
                background: sel ? `${ED.green}1a` : 'rgba(0,0,0,0.4)',
                border: `1px solid ${sel ? ED.green : ED.line}`,
                borderRadius: 3,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  letterSpacing: 1,
                  color: sel ? ED.green : ED.ink,
                  fontWeight: 700
                }}
              >
                {item.name}
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 8, color: ED.inkDim, marginTop: 1 }}>
                {item.hint}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <Plunger onFire={onFire} firing={launching} disabled={!msg.trim() || launching} />
      </div>
    </Panel>
  );
};
