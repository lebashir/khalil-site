'use client';

import { ED, FONT } from '../constants';
import { Panel } from '../primitives';

interface Props {
  about: string[];
  setAbout: (next: string[]) => void;
  hideHeader?: boolean;
}

const Body = ({ about, setAbout }: Pick<Props, 'about' | 'setAbout'>) => {
  const rows = about.length === 0 ? [''] : about;
  const update = (i: number, value: string) => {
    const next = [...rows];
    next[i] = value;
    setAbout(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map((p, i) => (
        <textarea
          key={i}
          value={p}
          onChange={(e) => update(i, e.target.value)}
          rows={i === 0 ? 2 : 3}
          style={{
            width: '100%',
            padding: '7px 9px',
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${ED.line}`,
            borderRadius: 3,
            color: i === 0 ? ED.amber : ED.ink,
            fontFamily: FONT.body,
            fontSize: i === 0 ? 14 : 12,
            fontWeight: i === 0 ? 700 : 400,
            lineHeight: 1.4,
            resize: 'vertical',
            outline: 'none'
          }}
        />
      ))}
    </div>
  );
};

export const AboutModule = ({ about, setAbout, hideHeader }: Props) => {
  if (hideHeader) return <Body about={about} setAbout={setAbout} />;
  return (
    <Panel title="ABOUT.DAT" kicker="// the bio on the homepage" accent={ED.amber}>
      <Body about={about} setAbout={setAbout} />
    </Panel>
  );
};
