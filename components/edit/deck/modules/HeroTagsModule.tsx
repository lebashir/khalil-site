'use client';

import type {
  FloatingTagConfig,
  SiteContent,
  TagPosition,
  TagSource
} from '@/lib/content';
import { FIELD_LIMITS } from '@/lib/content';
import type { ChannelStats } from '@/lib/youtube-channel';
import type { VideoItem } from '@/lib/youtube';
import { formatCount } from '@/lib/youtube';
import { ED, FONT } from '../constants';
import { Panel, ToggleChip } from '../primitives';

interface Props {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  channelStats: ChannelStats | null;
  videos: VideoItem[];
  hideHeader?: boolean;
}

const SOURCE_LABELS: Record<TagSource, string> = {
  manual: '✎ MANUAL',
  subs: '⚡ SUBS',
  views: '⚡ VIEWS',
  videos: '⚡ VIDEOS',
  pinnedLikes: '⚡ PINNED ♥'
};

const SOURCES: TagSource[] = ['manual', 'subs', 'views', 'videos', 'pinnedLikes'];

const POSITION_LABEL: Record<TagPosition, string> = {
  tl: 'TOP-LEFT',
  tr: 'TOP-RIGHT',
  bl: 'BOTTOM-LEFT',
  br: 'BOTTOM-RIGHT'
};

// Resolves what the wired source would currently render — mirrors the
// public site's resolveTagValue but only the LIVE part (no fallback).
// We show this as a preview row so the editor knows what's on the site.
const livePreview = (
  source: TagSource,
  channelStats: ChannelStats | null,
  content: SiteContent,
  videos: VideoItem[]
): { value: string; available: boolean } => {
  switch (source) {
    case 'manual':
      return { value: '—', available: true };
    case 'subs': {
      const n = channelStats?.subscriberCount;
      return { value: typeof n === 'number' ? formatCount(n) : '—', available: typeof n === 'number' };
    }
    case 'views': {
      const n = channelStats?.viewCount;
      return { value: typeof n === 'number' ? formatCount(n) : '—', available: typeof n === 'number' };
    }
    case 'videos': {
      const n = channelStats?.videoCount;
      return { value: typeof n === 'number' ? String(n) : '—', available: typeof n === 'number' };
    }
    case 'pinnedLikes': {
      const pinned = videos.find(v => v.id === content.videos.pinnedId);
      const n = pinned?.likeCount;
      return { value: typeof n === 'number' ? formatCount(n) : '—', available: typeof n === 'number' };
    }
  }
};

const Slot = ({
  tag,
  index,
  content,
  setContent,
  channelStats,
  videos
}: {
  tag: FloatingTagConfig;
  index: number;
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  channelStats: ChannelStats | null;
  videos: VideoItem[];
}) => {
  const update = (patch: Partial<FloatingTagConfig>) => {
    const next = [...content.floatingTags];
    next[index] = { ...tag, ...patch };
    setContent({ ...content, floatingTags: next });
  };
  const preview = livePreview(tag.source, channelStats, content, videos);
  const wired = tag.source !== 'manual';

  return (
    <div
      style={{
        padding: 10,
        border: `1px solid ${tag.enabled ? ED.line : 'rgba(255,255,255,0.1)'}`,
        background: tag.enabled ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)',
        borderRadius: 3,
        opacity: tag.enabled ? 1 : 0.55,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: FONT.mono,
          fontSize: 9,
          letterSpacing: 1.4,
          color: ED.amber,
          textTransform: 'uppercase'
        }}
      >
        <span>{POSITION_LABEL[tag.position]}</span>
        <button
          type="button"
          onClick={() => update({ enabled: !tag.enabled })}
          style={{
            cursor: 'pointer',
            background: tag.enabled ? `${ED.green}22` : 'transparent',
            border: `1px solid ${tag.enabled ? ED.green : ED.line}`,
            color: tag.enabled ? ED.green : ED.inkDim,
            fontFamily: FONT.mono,
            fontSize: 8,
            padding: '2px 8px',
            letterSpacing: 1.4,
            borderRadius: 999,
            textTransform: 'uppercase'
          }}
        >
          {tag.enabled ? 'on' : 'off'}
        </button>
      </div>
      <input
        value={tag.label}
        maxLength={FIELD_LIMITS.tagLabel}
        onChange={(e) => update({ label: e.target.value.toUpperCase() })}
        placeholder="LABEL"
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${ED.line}`,
          color: ED.ink,
          fontFamily: FONT.stencil,
          fontSize: 13,
          padding: '6px 8px',
          letterSpacing: 1
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {SOURCES.map(s => (
          <ToggleChip
            key={s}
            active={tag.source === s}
            color={s === 'manual' ? ED.amber : ED.pink}
            onClick={() => update({ source: s })}
          >
            {SOURCE_LABELS[s]}
          </ToggleChip>
        ))}
      </div>
      {wired ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: 6,
            background: 'rgba(0,0,0,0.3)',
            border: `1px dashed ${preview.available ? ED.green : ED.line}`,
            borderRadius: 2
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 8,
              color: ED.inkDim,
              letterSpacing: 1.4,
              textTransform: 'uppercase'
            }}
          >
            live → <span style={{ color: preview.available ? ED.green : ED.red }}>{preview.value}</span>
          </span>
          <input
            value={tag.manualValue}
            maxLength={FIELD_LIMITS.tagValue}
            onChange={(e) => update({ manualValue: e.target.value })}
            placeholder="fallback (used when API down)"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${ED.line}`,
              color: ED.inkDim,
              fontFamily: FONT.mono,
              fontSize: 10,
              padding: '4px 6px'
            }}
          />
        </div>
      ) : (
        <input
          value={tag.manualValue}
          maxLength={FIELD_LIMITS.tagValue}
          onChange={(e) => update({ manualValue: e.target.value })}
          placeholder="value"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${ED.line}`,
            color: ED.ink,
            fontFamily: FONT.stencil,
            fontSize: 16,
            padding: '6px 8px',
            letterSpacing: 1
          }}
        />
      )}
    </div>
  );
};

export const HeroTagsModule = ({ content, setContent, channelStats, videos, hideHeader }: Props) => {
  const Body = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }}
    >
      {content.floatingTags.map((tag, i) => (
        <Slot
          key={tag.position}
          tag={tag}
          index={i}
          content={content}
          setContent={setContent}
          channelStats={channelStats}
          videos={videos}
        />
      ))}
    </div>
  );
  if (hideHeader) return Body;
  return (
    <Panel title="HERO TAGS" kicker="// 4 floating slots on the polaroid" accent={ED.amber}>
      {Body}
    </Panel>
  );
};
