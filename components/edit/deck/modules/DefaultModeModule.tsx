'use client';

import type { Mode } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Panel } from '../primitives';

interface Props {
  defaultMode: Mode;
  setDefaultMode: (m: Mode) => void;
  hideHeader?: boolean;
}

const OPTIONS: Array<{ id: Mode; label: string; emoji: string; color: string }> = [
  { id: 'gaming', label: 'GAMING', emoji: '🎮', color: '#ff2bd6' },
  { id: 'football', label: 'FOOTBALL', emoji: '⚽', color: ED.yellow }
];

const Body = ({ defaultMode, setDefaultMode }: Pick<Props, 'defaultMode' | 'setDefaultMode'>) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
    {OPTIONS.map((opt) => {
      const sel = opt.id === defaultMode;
      return (
        <button
          key={opt.id}
          type="button"
          onClick={() => setDefaultMode(opt.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            background: sel ? `${opt.color}1f` : 'rgba(0,0,0,0.4)',
            border: `1px solid ${sel ? opt.color : ED.line}`,
            borderRadius: 3,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <span style={{ fontSize: 18 }}>{opt.emoji}</span>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: 1.5,
              fontWeight: 700,
              color: sel ? opt.color : ED.ink
            }}
          >
            {opt.label}
          </span>
        </button>
      );
    })}
  </div>
);

// Default mode = which mode loads on a visitor's first arrival. After
// they flip the TopBar toggle once, that choice is remembered in their
// own cookie, so this only ever affects fresh visitors.
export const DefaultModeModule = ({ defaultMode, setDefaultMode, hideHeader }: Props) => {
  if (hideHeader) return <Body defaultMode={defaultMode} setDefaultMode={setDefaultMode} />;
  return (
    <Panel title="BOOT MODE" kicker="// what fresh visitors see first" accent={ED.amber}>
      <Body defaultMode={defaultMode} setDefaultMode={setDefaultMode} />
    </Panel>
  );
};
