'use client';

import type { Mode, Mood, NowBlock, SiteContent } from '@/lib/content';
import { ED, FONT, MOOD_OPTIONS } from '../constants';
import { EditPin } from './EditPin';

interface StatusPreviewProps {
  mode: Mode;
  mood: Mood;
  now: NowBlock;
  subs: SiteContent['subs'];
  onEdit: (key: 'mood' | 'now' | 'subs') => void;
}

const NOW_FIELDS: Array<{ key: keyof NowBlock; label: string }> = [
  { key: 'playing', label: 'Playing' },
  { key: 'watching', label: 'Watching' },
  { key: 'reading', label: 'Reading' },
  { key: 'listening', label: 'Listening' }
];

const PREVIEW_BG = 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))';

// Mini-mockup of the status block. Three pins: MOOD, NOW, SUBS.
export const StatusPreview = ({ mode, mood, now, subs, onEdit }: StatusPreviewProps) => {
  // MOOD_OPTIONS always has at least one entry; the fallback is defensive
  const moodOpt = MOOD_OPTIONS.find((m) => m.id === mood) ?? MOOD_OPTIONS[0]!;
  const pct = (subs.current / Math.max(1, subs.goal)) * 100;
  return (
    <div
      style={{
        position: 'relative',
        padding: 18,
        backgroundImage: PREVIEW_BG,
        border: `1px solid ${ED.line}`,
        borderRadius: 5,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }}
    >
      {/* Mood card */}
      <div
        style={{
          position: 'relative',
          padding: 12,
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${ED.line}`,
          borderRadius: 4,
          paddingRight: 90
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.inkDim,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 6
          }}
        >
          status · mood
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <span
            style={{
              fontFamily: FONT.stencil,
              fontSize: 18,
              color: moodOpt.color,
              letterSpacing: 1,
              fontWeight: 700
            }}
          >
            {moodOpt.label}
          </span>
        </div>
        <EditPin
          label="MOOD"
          accent={ED.green}
          onClick={() => onEdit('mood')}
          style={{ top: 8, right: 8 }}
        />
      </div>

      {/* Subs card */}
      <div
        style={{
          position: 'relative',
          padding: 12,
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${ED.line}`,
          borderRadius: 4,
          paddingRight: 90
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.inkDim,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 6
          }}
        >
          subscribers
        </div>
        <div
          style={{
            fontFamily: FONT.stencil,
            fontSize: 22,
            color: ED.ink,
            lineHeight: 1,
            letterSpacing: -1
          }}
        >
          {subs.current}
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.pink,
              letterSpacing: 1,
              marginLeft: 8
            }}
          >
            / {subs.goal} · {pct.toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            height: 4,
            background: 'rgba(0,0,0,0.6)',
            borderRadius: 1,
            overflow: 'hidden',
            border: `1px solid ${ED.line}`
          }}
        >
          <div
            style={{
              width: `${Math.min(100, pct)}%`,
              height: '100%',
              backgroundImage: `linear-gradient(90deg, ${ED.pink}, ${ED.amber})`
            }}
          />
        </div>
        <EditPin
          label="SUBS"
          accent={ED.pink}
          onClick={() => onEdit('subs')}
          style={{ top: 8, right: 8 }}
        />
      </div>

      {/* Now playing card — spans both columns */}
      <div
        style={{
          position: 'relative',
          gridColumn: '1 / -1',
          padding: 12,
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${ED.line}`,
          borderRadius: 4,
          paddingRight: 90
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: ED.inkDim,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 8
          }}
        >
          now · {mode === 'gaming' ? 'equipped' : 'starting xi'}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8
          }}
        >
          {NOW_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  color: ED.blue,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase'
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: FONT.body,
                  fontSize: 12,
                  color: ED.ink,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {now[key] || '—'}
              </div>
            </div>
          ))}
        </div>
        <EditPin
          label="NOW"
          accent={ED.blue}
          onClick={() => onEdit('now')}
          style={{ top: 8, right: 8 }}
        />
      </div>
    </div>
  );
};
