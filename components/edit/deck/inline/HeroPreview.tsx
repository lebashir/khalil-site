'use client';

import type { Mode, ModeHeroCopy, ModeStats, Mood } from '@/lib/content';
import { ED, FONT, MOOD_OPTIONS } from '../constants';
import { EditPin } from './EditPin';

interface HeroPreviewProps {
  mode: Mode;
  handle: string;
  hero: ModeHeroCopy;
  stats: ModeStats;
  mood: Mood;
  onEdit: (key: 'handle' | 'hero' | 'stats') => void;
}

const PREVIEW_BG = 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))';

// Mini-mockup of the homepage hero. Three pins map to:
//   • HANDLE (top, near @name)
//   • HERO (right of tagline + bio + CTA + vibe)
//   • STATS (right of 4-cell stats grid)
export const HeroPreview = ({
  mode,
  handle,
  hero,
  stats,
  mood,
  onEdit
}: HeroPreviewProps) => {
  // MOOD_OPTIONS always has at least one entry; the fallback is defensive
  const moodOpt = MOOD_OPTIONS.find((m) => m.id === mood) ?? MOOD_OPTIONS[0]!;
  return (
    <div
      style={{
        position: 'relative',
        padding: 18,
        backgroundImage: PREVIEW_BG,
        border: `1px solid ${ED.line}`,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}
    >
      {/* Handle row */}
      <div style={{ position: 'relative', paddingRight: 110 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            aria-hidden
            className="ed-led"
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: moodOpt.color,
              boxShadow: `0 0 10px ${moodOpt.color}`
            }}
          />
          <div
            style={{
              fontFamily: FONT.stencil,
              fontSize: 32,
              color: ED.ink,
              letterSpacing: -1,
              lineHeight: 1
            }}
          >
            @{handle.replace(/^@/, '')}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.inkDim,
            letterSpacing: 1.4,
            marginTop: 6,
            textTransform: 'uppercase'
          }}
        >
          mode · {mode}
        </div>
        <EditPin label="HANDLE" onClick={() => onEdit('handle')} style={{ top: 0, right: 0 }} />
      </div>

      {/* Tagline + bio + cta + vibe block */}
      <div
        style={{
          position: 'relative',
          padding: 14,
          background: 'rgba(0,0,0,0.45)',
          border: `1px solid ${ED.line}`,
          borderRadius: 4,
          paddingRight: 110
        }}
      >
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 18,
            color: ED.amber,
            fontWeight: 800,
            lineHeight: 1.2
          }}
        >
          {hero.tagline}
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 12,
            color: ED.inkDim,
            marginTop: 6,
            lineHeight: 1.4
          }}
        >
          {hero.bio}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 10,
            flexWrap: 'wrap'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: `${ED.amber}22`,
              border: `1px solid ${ED.amber}`,
              borderRadius: 3,
              fontFamily: FONT.mono,
              fontSize: 10,
              color: ED.amber,
              letterSpacing: 1.5,
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            {hero.cta}
          </span>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.blue,
              letterSpacing: 1.2,
              textTransform: 'uppercase'
            }}
          >
            // {hero.vibe}
          </span>
        </div>
        <EditPin label="HERO" onClick={() => onEdit('hero')} style={{ top: 8, right: 8 }} />
      </div>

      {/* Stats grid */}
      <div
        style={{
          position: 'relative',
          paddingRight: 110
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6
          }}
        >
          {stats.values.map((value, i) => (
            <div
              key={i}
              style={{
                padding: '8px 6px',
                background: 'rgba(0,0,0,0.55)',
                border: `1px solid ${ED.line}`,
                borderRadius: 3,
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontFamily: FONT.stencil,
                  fontSize: 16,
                  color: ED.ink,
                  lineHeight: 1
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  color: ED.inkDim,
                  letterSpacing: 1,
                  marginTop: 3,
                  textTransform: 'uppercase'
                }}
              >
                {stats.labels[i]}
              </div>
            </div>
          ))}
        </div>
        <EditPin label="STATS" onClick={() => onEdit('stats')} style={{ top: -8, right: 0 }} />
      </div>
    </div>
  );
};
