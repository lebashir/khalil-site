'use client';

import type { SiteContent } from '@/lib/content';
import { FIELD_LIMITS } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Panel, editInput } from '../primitives';

interface Props {
  socials: SiteContent['socials'];
  setSocials: (next: SiteContent['socials']) => void;
  hideHeader?: boolean;
}

interface RowDef {
  key: keyof SiteContent['socials'];
  label: string;
  placeholder: string;
  accent: string;
}

const ROWS: RowDef[] = [
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@…', accent: ED.pink },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/…', accent: ED.amber }
];

const Body = ({ socials, setSocials }: Pick<Props, 'socials' | 'setSocials'>) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {ROWS.map(({ key, label, placeholder, accent }) => (
      <div key={key}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: accent,
            letterSpacing: 1.5,
            marginBottom: 4,
            textTransform: 'uppercase'
          }}
        >
          {label}
        </div>
        <input
          type="url"
          value={socials[key]}
          maxLength={FIELD_LIMITS.socialUrl}
          placeholder={placeholder}
          onChange={(e) => setSocials({ ...socials, [key]: e.target.value })}
          style={{ ...editInput, fontSize: 12 }}
        />
      </div>
    ))}
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 9,
        color: ED.inkDim,
        letterSpacing: 1.2,
        marginTop: 2
      }}
    >
      // leave blank to hide a link
    </div>
  </div>
);

export const SocialsModule = ({ socials, setSocials, hideHeader }: Props) => {
  if (hideHeader) return <Body socials={socials} setSocials={setSocials} />;
  return (
    <Panel title="SOCIAL UPLINK" kicker="// footer links" accent={ED.pink}>
      <Body socials={socials} setSocials={setSocials} />
    </Panel>
  );
};
