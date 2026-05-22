'use client';

import { ED, FONT } from './constants';
import { BarButton, Pill, Tab } from './primitives';
import { pad2, useNow } from './useNow';

export type DeckTab = 'inline' | 'deck';

interface Props {
  tab: DeckTab;
  setTab: (t: DeckTab) => void;
  onExit: () => void;
  onSave: () => void;
  saving?: boolean;
  isPhone: boolean;
}

// Sticky mission-control header. Doubles as the editor's nav (tabs) and
// the place where Save fires. Live UTC clock pill renders only after
// client mount so SSR + CSR agree.
export const TopBar = ({ tab, setTab, onExit, onSave, saving, isPhone }: Props) => {
  const now = useNow();
  const time = now
    ? `${pad2(now.getUTCHours())}:${pad2(now.getUTCMinutes())}:${pad2(now.getUTCSeconds())}`
    : '—:—:—';

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: isPhone ? '12px 12px 0' : '12px 20px 0',
        background: `linear-gradient(180deg, ${ED.bg} 30%, ${ED.bg}d0 100%)`,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderBottom: `1px solid ${ED.line}`
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 10,
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isPhone ? 26 : 30,
              height: isPhone ? 26 : 30,
              background: ED.amber,
              color: ED.bg,
              fontFamily: FONT.stencil,
              fontSize: isPhone ? 16 : 18,
              fontWeight: 700,
              clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
              boxShadow: `0 0 12px ${ED.amber}80`
            }}
          >
            K
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: FONT.stencil,
                fontSize: isPhone ? 13 : 16,
                letterSpacing: 2,
                color: ED.ink,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              CONTROL DECK
            </div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: isPhone ? 8 : 9,
                letterSpacing: 1.5,
                color: ED.green
              }}
            >
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
          {isPhone && <Pill value={time} color={ED.green} />}
          <a
            href="/manual"
            target="_blank"
            rel="noopener"
            aria-label="Open operator manual in a new tab"
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              letterSpacing: 1.5,
              fontWeight: 700,
              color: ED.blue,
              background: 'transparent',
              border: `1px solid ${ED.blue}66`,
              padding: '5px 10px',
              borderRadius: 3,
              cursor: 'pointer',
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {isPhone ? '📖' : '📖 Manual'}
          </a>
          <BarButton onClick={onSave} disabled={saving} color={ED.green}>
            {saving ? 'Saving…' : 'Save'}
          </BarButton>
          <BarButton onClick={onExit} color={ED.red}>
            Exit
          </BarButton>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        <Tab active={tab === 'deck'} onClick={() => setTab('deck')}>
          ⌬ MISSION CONTROL
        </Tab>
        <Tab active={tab === 'inline'} onClick={() => setTab('inline')}>
          ✎ ON-SITE EDITOR
        </Tab>
      </div>
    </div>
  );
};
