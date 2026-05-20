'use client';

import type { Mode, NowBlock } from '@/lib/content';
import { ED, FONT, NOW_PLAYING_PRESETS } from '../constants';
import { Panel, editInput } from '../primitives';

interface Props {
  mode: Mode;
  now: NowBlock;
  setNow: (next: NowBlock) => void;
  hideHeader?: boolean;
}

const FIELDS: Array<{ key: keyof NowBlock; label: string }> = [
  { key: 'playing', label: 'Playing' },
  { key: 'watching', label: 'Watching' },
  { key: 'reading', label: 'Reading' },
  { key: 'listening', label: 'Listening' }
];

const Body = ({ mode, now, setNow }: Pick<Props, 'mode' | 'now' | 'setNow'>) => {
  const presets = NOW_PLAYING_PRESETS[mode];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {FIELDS.map(({ key, label }) => (
        <div key={key}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.blue,
              letterSpacing: 1.5,
              marginBottom: 3,
              textTransform: 'uppercase'
            }}
          >
            {label}
          </div>
          <input
            value={now[key]}
            onChange={(e) => setNow({ ...now, [key]: e.target.value })}
            style={{ ...editInput, fontSize: 12, padding: '6px 8px' }}
          />
          {key === 'playing' && presets.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNow({ ...now, playing: p })}
                  style={{
                    padding: '3px 8px',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${ED.line}`,
                    borderRadius: 999,
                    fontFamily: FONT.mono,
                    fontSize: 9,
                    color: ED.blue,
                    cursor: 'pointer',
                    letterSpacing: 0.5
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const NowPlayingModule = ({ mode, now, setNow, hideHeader }: Props) => {
  if (hideHeader) return <Body mode={mode} now={now} setNow={setNow} />;
  return (
    <Panel
      title={`NOW · ${mode === 'gaming' ? 'EQUIPPED' : 'STARTING XI'}`}
      kicker={`// this week's ${mode}`}
      accent={ED.blue}
    >
      <Body mode={mode} now={now} setNow={setNow} />
    </Panel>
  );
};
