'use client';

import type { SiteContent } from '@/lib/content';
import { ED, FONT } from '../constants';
import { EditPin } from './EditPin';

interface FooterPreviewProps {
  socials: SiteContent['socials'];
  onEdit: (key: 'socials') => void;
}

const PREVIEW_BG = 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))';

// Mini-mockup of the footer / socials strip. SOCIALS pin opens the URL editors.
export const FooterPreview = ({ socials, onEdit }: FooterPreviewProps) => (
  <div
    style={{
      position: 'relative',
      padding: 18,
      backgroundImage: PREVIEW_BG,
      border: `1px solid ${ED.line}`,
      borderRadius: 5
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingRight: 110
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: ED.pink,
          letterSpacing: 2,
          textTransform: 'uppercase'
        }}
      >
        footer
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          color: ED.inkDim,
          letterSpacing: 1.2
        }}
      >
        social uplink
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <SocialCard label="TikTok" url={socials.tiktok} accent={ED.pink} emoji="🎵" />
      <SocialCard label="Instagram" url={socials.instagram} accent={ED.amber} emoji="📷" />
    </div>

    <EditPin
      label="SOCIALS"
      accent={ED.pink}
      onClick={() => onEdit('socials')}
      style={{ top: 10, right: 10 }}
    />
  </div>
);

const SocialCard = ({
  label,
  url,
  accent,
  emoji
}: {
  label: string;
  url: string;
  accent: string;
  emoji: string;
}) => {
  const isSet = url.trim().length > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        background: 'rgba(0,0,0,0.5)',
        border: `1px solid ${isSet ? accent : ED.line}`,
        borderRadius: 3
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: 3,
          background: isSet ? `${accent}22` : 'rgba(0,0,0,0.4)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16
        }}
      >
        {emoji}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: isSet ? accent : ED.inkDim,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            fontWeight: 700
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: isSet ? ED.ink : ED.inkDim,
            opacity: isSet ? 1 : 0.6,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {isSet ? url : '— not set —'}
        </div>
      </div>
    </div>
  );
};
