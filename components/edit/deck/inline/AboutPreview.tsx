'use client';

import { ED, FONT } from '../constants';
import { EditPin } from './EditPin';

interface AboutPreviewProps {
  about: string[];
  onEdit: (key: 'about') => void;
}

const PREVIEW_BG = 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))';

// Mini-mockup of the About section. Shows the bio paragraphs as they appear
// on the homepage: first paragraph emphasized (amber/bold), rest dimmer.
export const AboutPreview = ({ about, onEdit }: AboutPreviewProps) => {
  const paragraphs = about.length === 0 ? ['(no about paragraphs yet)'] : about;
  return (
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
          fontFamily: FONT.mono,
          fontSize: 10,
          color: ED.amber,
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 10,
          paddingRight: 110
        }}
      >
        about.dat
      </div>
      <div
        style={{
          padding: 12,
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${ED.line}`,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: FONT.body,
              fontSize: i === 0 ? 14 : 12,
              color: i === 0 ? ED.amber : ED.ink,
              fontWeight: i === 0 ? 700 : 400,
              lineHeight: 1.45,
              margin: 0,
              opacity: i === 0 ? 1 : 0.85
            }}
          >
            {p}
          </p>
        ))}
      </div>
      <EditPin
        label="ABOUT"
        accent={ED.amber}
        onClick={() => onEdit('about')}
        style={{ top: 10, right: 10 }}
      />
    </div>
  );
};
