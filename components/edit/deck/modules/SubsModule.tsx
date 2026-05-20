'use client';

import type { SiteContent } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Panel, DialButton } from '../primitives';

interface Props {
  subs: SiteContent['subs'];
  setSubs: (next: SiteContent['subs']) => void;
  hideHeader?: boolean;
}

const Body = ({ subs, setSubs }: Pick<Props, 'subs' | 'setSubs'>) => {
  const pct = (subs.current / Math.max(1, subs.goal)) * 100;
  const bump = (n: number) =>
    setSubs({ ...subs, current: Math.max(0, subs.current + n) });
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <DialButton onClick={() => bump(-10)} label="−10" />
        <DialButton onClick={() => bump(-1)} label="−1" />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: FONT.stencil,
              fontSize: 36,
              lineHeight: 1,
              color: ED.ink,
              letterSpacing: -1
            }}
          >
            {subs.current}
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 8,
              color: ED.pink,
              letterSpacing: 1,
              marginTop: 1
            }}
          >
            / {subs.goal} · {pct.toFixed(0)}%
          </div>
        </div>
        <DialButton onClick={() => bump(1)} label="+1" />
        <DialButton onClick={() => bump(10)} label="+10" />
      </div>
      <div
        style={{
          marginTop: 10,
          height: 6,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 1,
          overflow: 'hidden',
          border: `1px solid ${ED.line}`
        }}
      >
        <div
          style={{
            width: `${Math.min(100, pct)}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${ED.pink}, ${ED.amber})`,
            boxShadow: `0 0 8px ${ED.pink}88`
          }}
        />
      </div>
    </>
  );
};

export const SubsModule = ({ subs, setSubs, hideHeader }: Props) => {
  if (hideHeader) return <Body subs={subs} setSubs={setSubs} />;
  return (
    <Panel
      title="SUBSCRIBERS"
      kicker={`// goal · ${subs.goal}`}
      accent={ED.pink}
    >
      <Body subs={subs} setSubs={setSubs} />
    </Panel>
  );
};
