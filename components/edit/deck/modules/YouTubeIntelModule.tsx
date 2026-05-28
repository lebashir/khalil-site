'use client';

import { useCallback, useState } from 'react';
import type { ChannelStats } from '@/lib/youtube-channel';
import { ED, FONT } from '../constants';
import { Panel } from '../primitives';

interface Props {
  initial: ChannelStats | null;
}

const relTime = (iso: string): string => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const sec = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  return `${Math.round(sec / 3600)}h ago`;
};

export const YouTubeIntelModule = ({ initial }: Props) => {
  const [stats, setStats] = useState<ChannelStats | null>(initial);
  const [loading, setLoading] = useState(false);
  type ErrorState = 'no_stats' | 'fetch_failed' | null;
  const [error, setError] = useState<ErrorState>(initial ? null : 'no_stats');
  const [bioExpanded, setBioExpanded] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/channel-stats?bust=1', { cache: 'no-store' });
      if (!res.ok) {
        setError('fetch_failed');
        return;
      }
      const data = (await res.json()) as ChannelStats;
      setStats(data);
    } catch {
      setError('fetch_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const synced = stats ? relTime(stats.fetchedAt) : '';
  const bio = stats?.description ?? '';
  const showBio = bioExpanded || bio.length <= 200;
  const bioPreview = showBio ? bio : `${bio.slice(0, 200)}…`;

  return (
    <Panel
      title="YOUTUBE INTEL"
      kicker={synced ? `// synced ${synced}` : '// unavailable'}
      accent={ED.pink}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              color: ED.inkDim,
              letterSpacing: 1.4,
              textTransform: 'uppercase'
            }}
          >
            {stats?.title || '— channel —'}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{
              cursor: loading ? 'wait' : 'pointer',
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${ED.pink}`,
              color: ED.pink,
              fontFamily: FONT.mono,
              fontSize: 9,
              letterSpacing: 1.4,
              padding: '4px 10px',
              textTransform: 'uppercase'
            }}
          >
            {loading ? '…' : 'refresh'}
          </button>
        </div>
        {error === 'no_stats' && (
          <div style={{ color: ED.red, fontFamily: FONT.mono, fontSize: 10 }}>
            ⚠ no YOUTUBE_API_KEY set — add it to .env.local
          </div>
        )}
        {error === 'fetch_failed' && (
          <div style={{ color: ED.red, fontFamily: FONT.mono, fontSize: 10 }}>
            ⚠ couldn't reach YouTube — try refresh
          </div>
        )}
        {stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <Stat label="SUBS" value={stats.hidden ? '—' : (stats.subscriberCount ?? '—')} note={stats.hidden ? 'hidden' : undefined} />
              <Stat label="VIEWS" value={stats.viewCount ?? '—'} />
              <Stat label="VIDEOS" value={stats.videoCount ?? '—'} />
            </div>
            {bio && (
              <div
                style={{
                  padding: 8,
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${ED.line}`,
                  borderRadius: 2,
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  color: ED.inkDim,
                  letterSpacing: 0.2,
                  whiteSpace: 'pre-wrap'
                }}
              >
                <div style={{ color: ED.amber, marginBottom: 4 }}>// channel bio</div>
                {bioPreview}
                {bio.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded(v => !v)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: ED.pink,
                      cursor: 'pointer',
                      marginLeft: 6,
                      fontFamily: FONT.mono,
                      fontSize: 10
                    }}
                  >
                    [{bioExpanded ? 'collapse' : 'show more'}]
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
};

const Stat = ({ label, value, note }: { label: string; value: number | string; note?: string }) => (
  <div
    style={{
      padding: 8,
      background: 'rgba(0,0,0,0.4)',
      border: `1px solid ${ED.line}`,
      borderRadius: 2,
      textAlign: 'center'
    }}
  >
    <div style={{ fontFamily: FONT.mono, fontSize: 8, color: ED.amber, letterSpacing: 1.4 }}>
      {label}
    </div>
    <div style={{ fontFamily: FONT.stencil, fontSize: 18, color: ED.ink, marginTop: 2 }}>
      {value}
    </div>
    {note && (
      <div style={{ fontFamily: FONT.mono, fontSize: 7, color: ED.inkDim, marginTop: 2 }}>
        ({note})
      </div>
    )}
  </div>
);
