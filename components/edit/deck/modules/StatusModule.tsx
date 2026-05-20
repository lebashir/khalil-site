'use client';

import type { Mood } from '@/lib/content';
import { ED, FONT, MOOD_OPTIONS } from '../constants';
import { Panel } from '../primitives';

interface Props {
  mood: Mood;
  setMood: (m: Mood) => void;
  hideHeader?: boolean;
}

const Buttons = ({ mood, setMood }: Pick<Props, 'mood' | 'setMood'>) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
    {MOOD_OPTIONS.map((m) => {
      const sel = m.id === mood;
      return (
        <button
          key={m.id}
          type="button"
          onClick={() => setMood(m.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 8px',
            background: sel ? `${m.color}1a` : 'rgba(0,0,0,0.4)',
            border: `1px solid ${sel ? m.color : ED.line}`,
            borderRadius: 3,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: m.color,
              boxShadow: `0 0 6px ${m.color}`
            }}
          />
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              letterSpacing: 1,
              color: sel ? m.color : ED.ink,
              fontWeight: 700
            }}
          >
            {m.label}
          </span>
        </button>
      );
    })}
  </div>
);

export const StatusModule = ({ mood, setMood, hideHeader }: Props) => {
  if (hideHeader) return <Buttons mood={mood} setMood={setMood} />;
  return (
    <Panel title="STATUS · MOOD" kicker="// what shows next to your name" accent={ED.green}>
      <Buttons mood={mood} setMood={setMood} />
    </Panel>
  );
};
