'use client';

import type { DesignThumb, SiteContent, VideoTier } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Panel, ToggleChip, editInput } from '../primitives';

interface Props {
  videos: SiteContent['videos'];
  setVideos: (next: SiteContent['videos']) => void;
  hideHeader?: boolean;
}

const TIERS: VideoTier[] = ['LEGENDARY', 'EPIC', 'RARE', 'COMMON'];
const TIER_COLORS: Record<VideoTier, string> = {
  LEGENDARY: ED.amber,
  EPIC: ED.pink,
  RARE: ED.blue,
  COMMON: ED.inkDim
};

const DEFAULT_THUMB: DesignThumb = { from: '#5b3aa6', to: '#1a0a3a', emoji: '🎮' };

const Body = ({ videos, setVideos }: Pick<Props, 'videos' | 'setVideos'>) => {
  const updateThumb = (i: number, patch: Partial<DesignThumb>) => {
    const next = [...videos.designThumbs];
    const current = next[i];
    if (!current) return;
    next[i] = { ...current, ...patch };
    setVideos({ ...videos, designThumbs: next });
  };

  const addThumb = () =>
    setVideos({ ...videos, designThumbs: [...videos.designThumbs, { ...DEFAULT_THUMB }] });

  const removeThumb = (i: number) => {
    const next = videos.designThumbs.filter((_, idx) => idx !== i);
    setVideos({ ...videos, designThumbs: next });
  };

  const updateTier = (i: number, tier: VideoTier) => {
    const next = [...videos.tiers];
    next[i] = tier;
    setVideos({ ...videos, tiers: next });
  };

  const addTier = () =>
    setVideos({ ...videos, tiers: [...videos.tiers, 'COMMON'] });

  const removeTier = (i: number) =>
    setVideos({ ...videos, tiers: videos.tiers.filter((_, idx) => idx !== i) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Style toggles */}
      <SubSection title="THUMBNAIL SOURCE" accent={ED.amber}>
        <ToggleRow
          label="Featured (pinned)"
          on={videos.useDesignThumbForFeatured}
          onLabel="DESIGN"
          offLabel="YOUTUBE"
          onChange={(v) => setVideos({ ...videos, useDesignThumbForFeatured: v })}
        />
        <ToggleRow
          label="Other clips"
          on={videos.useDesignThumbsForRest}
          onLabel="DESIGN"
          offLabel="YOUTUBE"
          onChange={(v) => setVideos({ ...videos, useDesignThumbsForRest: v })}
        />
      </SubSection>

      {/* Design palette */}
      <SubSection title={`DESIGN PALETTE · ${videos.designThumbs.length}`} accent={ED.pink}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {videos.designThumbs.map((thumb, i) => (
            <ThumbRow
              key={i}
              index={i}
              thumb={thumb}
              onChange={(patch) => updateThumb(i, patch)}
              onRemove={() => removeThumb(i)}
            />
          ))}
          <button
            type="button"
            onClick={addThumb}
            style={addBtnStyle}
          >
            + add thumbnail
          </button>
        </div>
      </SubSection>

      {/* Tier rarity assignments */}
      <SubSection title={`CARD TIERS · ${videos.tiers.length}`} accent={ED.amber}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {videos.tiers.map((tier, i) => (
            <TierRow
              key={i}
              index={i}
              tier={tier}
              onChange={(v) => updateTier(i, v)}
              onRemove={() => removeTier(i)}
            />
          ))}
          <button
            type="button"
            onClick={addTier}
            style={addBtnStyle}
          >
            + add tier
          </button>
        </div>
      </SubSection>
    </div>
  );
};

// ── Subsection wrapper ─────────────────────────────────────────────────────

const SubSection = ({
  title,
  accent,
  children
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) => (
  <div>
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 9,
        letterSpacing: 2,
        color: accent,
        marginBottom: 6,
        textTransform: 'uppercase'
      }}
    >
      {title}
    </div>
    <div
      style={{
        padding: 10,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${ED.line}`,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}
    >
      {children}
    </div>
  </div>
);

// ── Toggle row (YouTube ↔ Design) ──────────────────────────────────────────

const ToggleRow = ({
  label,
  on,
  onLabel,
  offLabel,
  onChange
}: {
  label: string;
  on: boolean;
  onLabel: string;
  offLabel: string;
  onChange: (v: boolean) => void;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
    <span
      style={{
        fontFamily: FONT.body,
        fontSize: 12,
        color: ED.ink,
        fontWeight: 600
      }}
    >
      {label}
    </span>
    <div style={{ display: 'flex', gap: 4 }}>
      <ToggleChip active={!on} color={ED.red} onClick={() => onChange(false)}>
        {offLabel}
      </ToggleChip>
      <ToggleChip active={on} color={ED.green} onClick={() => onChange(true)}>
        {onLabel}
      </ToggleChip>
    </div>
  </div>
);

// ── Design thumbnail row ───────────────────────────────────────────────────

const ThumbRow = ({
  index,
  thumb,
  onChange,
  onRemove
}: {
  index: number;
  thumb: DesignThumb;
  onChange: (patch: Partial<DesignThumb>) => void;
  onRemove: () => void;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: 6,
      background: 'rgba(0,0,0,0.45)',
      border: `1px solid ${ED.line}`,
      borderRadius: 3
    }}
  >
    <span
      style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        borderRadius: 4,
        backgroundImage: `linear-gradient(135deg, ${thumb.from}, ${thumb.to})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18
      }}
    >
      {thumb.emoji}
    </span>
    <span
      style={{
        fontFamily: FONT.mono,
        fontSize: 9,
        color: ED.inkDim,
        letterSpacing: 1,
        width: 18
      }}
    >
      #{index + 1}
    </span>
    <input
      type="text"
      value={thumb.from}
      onChange={(e) => onChange({ from: e.target.value })}
      placeholder="#5b3aa6"
      style={{ ...editInput, fontSize: 11, padding: '4px 6px', flex: 1, fontFamily: FONT.mono }}
    />
    <input
      type="text"
      value={thumb.to}
      onChange={(e) => onChange({ to: e.target.value })}
      placeholder="#1a0a3a"
      style={{ ...editInput, fontSize: 11, padding: '4px 6px', flex: 1, fontFamily: FONT.mono }}
    />
    <input
      type="text"
      value={thumb.emoji}
      onChange={(e) => onChange({ emoji: e.target.value })}
      placeholder="🎮"
      style={{ ...editInput, fontSize: 14, padding: '4px 6px', width: 44, textAlign: 'center' }}
    />
    <button
      type="button"
      onClick={onRemove}
      aria-label="remove thumbnail"
      style={removeBtnStyle}
    >
      ×
    </button>
  </div>
);

// ── Tier row (LEGENDARY/EPIC/RARE/COMMON pick) ─────────────────────────────

const TierRow = ({
  index,
  tier,
  onChange,
  onRemove
}: {
  index: number;
  tier: VideoTier;
  onChange: (v: VideoTier) => void;
  onRemove: () => void;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: 6,
      background: 'rgba(0,0,0,0.45)',
      border: `1px solid ${ED.line}`,
      borderRadius: 3
    }}
  >
    <span
      style={{
        fontFamily: FONT.mono,
        fontSize: 9,
        color: ED.inkDim,
        letterSpacing: 1,
        width: 38
      }}
    >
      CARD {index + 1}
    </span>
    <div style={{ display: 'flex', gap: 3, flex: 1, flexWrap: 'wrap' }}>
      {TIERS.map((t) => {
        const sel = t === tier;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            style={{
              padding: '3px 7px',
              background: sel ? `${TIER_COLORS[t]}1f` : 'transparent',
              border: `1px solid ${sel ? TIER_COLORS[t] : ED.line}`,
              borderRadius: 999,
              fontFamily: FONT.mono,
              fontSize: 8,
              letterSpacing: 1.2,
              color: sel ? TIER_COLORS[t] : ED.inkDim,
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
    <button
      type="button"
      onClick={onRemove}
      aria-label="remove tier"
      style={removeBtnStyle}
    >
      ×
    </button>
  </div>
);

// ── Shared button styles ───────────────────────────────────────────────────

const addBtnStyle: React.CSSProperties = {
  marginTop: 4,
  padding: '6px 10px',
  background: 'transparent',
  border: `1px dashed ${ED.line}`,
  borderRadius: 3,
  fontFamily: FONT.mono,
  fontSize: 10,
  letterSpacing: 1.2,
  color: ED.inkDim,
  cursor: 'pointer',
  textTransform: 'uppercase',
  textAlign: 'center'
};

const removeBtnStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  padding: 0,
  background: 'transparent',
  border: `1px solid ${ED.line}`,
  borderRadius: 3,
  color: ED.inkDim,
  cursor: 'pointer',
  fontFamily: FONT.mono,
  fontSize: 12,
  flexShrink: 0
};

export const ThumbStyleModule = ({ videos, setVideos, hideHeader }: Props) => {
  if (hideHeader) return <Body videos={videos} setVideos={setVideos} />;
  return (
    <Panel
      title="REPLAY STYLE"
      kicker="// thumbnails + rarity tags"
      accent={ED.amber}
    >
      <Body videos={videos} setVideos={setVideos} />
    </Panel>
  );
};
