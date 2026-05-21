'use client';

import { useState } from 'react';
import type {
  Mode,
  ModeHeroCopy,
  ModeStats,
  Mood,
  NowBlock,
  SiteContent
} from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import { FIELD_LIMITS } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Field, ToggleChip, editInput } from '../primitives';
import { StatusModule } from '../modules/StatusModule';
import { SubsModule } from '../modules/SubsModule';
import { NowPlayingModule } from '../modules/NowPlayingModule';
import { PinnedVideoModule } from '../modules/PinnedVideoModule';
import { AboutModule } from '../modules/AboutModule';
import { SocialsModule } from '../modules/SocialsModule';
import { ThumbStyleModule } from '../modules/ThumbStyleModule';
import { DefaultModeModule } from '../modules/DefaultModeModule';
import { PinEditor } from './PinEditor';
import { HeroPreview } from './HeroPreview';
import { StatusPreview } from './StatusPreview';
import { ReplaysPreview } from './ReplaysPreview';
import { AboutPreview } from './AboutPreview';
import { BookPreview } from './BookPreview';
import { FooterPreview } from './FooterPreview';
import { ImagesPreview } from './ImagesPreview';
import { ImageDropzone } from './ImageDropzone';

type PinKey =
  | 'handle'
  | 'hero'
  | 'stats'
  | 'mood'
  | 'now'
  | 'subs'
  | 'pinned-video'
  | 'thumb-style'
  | 'about'
  | 'book'
  | 'socials'
  | 'defaults';

interface InlineEditViewProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  videos: VideoItem[];
}

// The full "INLINE" tab view. Lays out all editable sections as
// mini-previews with EditPin overlays. Clicking a pin opens the
// PinEditor drawer with the matching module or inline editor.
export const InlineEditView = ({
  mode,
  setMode,
  content,
  setContent,
  videos
}: InlineEditViewProps) => {
  const [openPin, setOpenPin] = useState<PinKey | null>(null);
  // Retain the last pin so the drawer's slide-out animation still has content
  const [lastPin, setLastPin] = useState<PinKey | null>(null);

  const open = (key: PinKey) => {
    setOpenPin(key);
    setLastPin(key);
  };
  const close = () => setOpenPin(null);

  // Focused setters built from setContent
  const setHandle = (handle: string) => setContent({ ...content, handle });
  const setHero = (hero: ModeHeroCopy) =>
    setContent({ ...content, hero: { ...content.hero, [mode]: hero } });
  const setStats = (stats: ModeStats) =>
    setContent({ ...content, stats: { ...content.stats, [mode]: stats } });
  const setMood = (mood: Mood) => setContent({ ...content, mood });
  const setSubs = (subs: SiteContent['subs']) => setContent({ ...content, subs });
  const setNow = (now: NowBlock) =>
    setContent({ ...content, now: { ...content.now, [mode]: now } });
  const setPinnedId = (pinnedId: string | null) =>
    setContent({ ...content, videos: { ...content.videos, pinnedId } });
  const setAbout = (about: string[]) => setContent({ ...content, about });
  const setBook = (book: SiteContent['book']) => setContent({ ...content, book });
  const setSocials = (socials: SiteContent['socials']) => setContent({ ...content, socials });
  const setVideos = (videos: SiteContent['videos']) => setContent({ ...content, videos });
  const setDefaultMode = (defaultMode: Mode) => setContent({ ...content, defaultMode });
  // Immutable per-slot image update — pass null to remove. The dropzones
  // and the BOOK pin's cover field both call this; book-cover stays in
  // sync because they share the slot id.
  const setImage = (slotId: string, url: string | null) => {
    const next = { ...content.images };
    if (url) next[slotId] = url;
    else delete next[slotId];
    setContent({ ...content, images: next });
  };

  const drawer = renderDrawer(lastPin, {
    mode,
    content,
    videos,
    setHandle,
    setHero,
    setStats,
    setMood,
    setSubs,
    setNow,
    setPinnedId,
    setAbout,
    setBook,
    setSocials,
    setVideos,
    setDefaultMode,
    setImage
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Mode + tip strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 12px',
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${ED.line}`,
          borderRadius: 4
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: ED.inkDim,
            letterSpacing: 1.4,
            textTransform: 'uppercase'
          }}
        >
          // tap an <span style={{ color: ED.amber }}>EDIT</span> pin to open the
          field inspector
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <ToggleChip
            active={mode === 'gaming'}
            color={ED.amber}
            onClick={() => setMode('gaming')}
          >
            GAMING
          </ToggleChip>
          <ToggleChip
            active={mode === 'football'}
            color={ED.green}
            onClick={() => setMode('football')}
          >
            FOOTBALL
          </ToggleChip>
        </div>
      </div>

      {/* Previews stack */}
      <HeroPreview
        mode={mode}
        handle={content.handle}
        hero={content.hero[mode]}
        stats={content.stats[mode]}
        mood={content.mood}
        onEdit={(k) => open(k)}
      />
      <StatusPreview
        mode={mode}
        mood={content.mood}
        now={content.now[mode]}
        subs={content.subs}
        onEdit={(k) => open(k)}
      />
      <ReplaysPreview
        videos={videos}
        pinnedId={content.videos.pinnedId}
        onEdit={(k) => open(k)}
      />
      <AboutPreview about={content.about} onEdit={(k) => open(k)} />
      <BookPreview book={content.book} onEdit={(k) => open(k)} />
      <FooterPreview socials={content.socials} onEdit={(k) => open(k)} />
      <ImagesPreview images={content.images} videos={videos} setImage={setImage} />

      {/* Boot mode + escape hatches */}
      <div
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: '1fr 1fr',
          padding: '10px 12px',
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${ED.line}`,
          borderRadius: 4
        }}
      >
        <button
          type="button"
          onClick={() => open('defaults')}
          style={hatchBtn}
        >
          <span style={{ color: ED.amber }}>BOOT MODE</span>
          <span style={{ color: ED.ink, fontWeight: 700 }}>
            {content.defaultMode.toUpperCase()}
          </span>
        </button>
        <button
          type="button"
          onClick={() => open('socials')}
          style={hatchBtn}
        >
          <span style={{ color: ED.pink }}>SOCIALS</span>
          <span style={{ color: ED.inkDim }}>
            {[content.socials.tiktok, content.socials.instagram].filter(Boolean).length} / 2
          </span>
        </button>
      </div>

      {/* Drawer */}
      <PinEditor
        open={openPin !== null}
        title={drawer?.title ?? ''}
        kicker={drawer?.kicker}
        accent={drawer?.accent ?? ED.amber}
        onClose={close}
      >
        {drawer?.content}
      </PinEditor>
    </div>
  );
};

// ── Inline section escape-hatch button style ───────────────────────────────

const hatchBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '8px 12px',
  background: 'rgba(0,0,0,0.5)',
  border: `1px solid ${ED.line}`,
  borderRadius: 3,
  cursor: 'pointer',
  fontFamily: FONT.mono,
  fontSize: 10,
  letterSpacing: 1.4,
  textTransform: 'uppercase'
};

// ── Drawer routing — picks the editor body + frame ─────────────────────────

interface DrawerCtx {
  mode: Mode;
  content: SiteContent;
  videos: VideoItem[];
  setHandle: (h: string) => void;
  setHero: (h: ModeHeroCopy) => void;
  setStats: (s: ModeStats) => void;
  setMood: (m: Mood) => void;
  setSubs: (s: SiteContent['subs']) => void;
  setNow: (n: NowBlock) => void;
  setPinnedId: (id: string | null) => void;
  setAbout: (a: string[]) => void;
  setBook: (b: SiteContent['book']) => void;
  setSocials: (s: SiteContent['socials']) => void;
  setVideos: (v: SiteContent['videos']) => void;
  setDefaultMode: (m: Mode) => void;
  setImage: (slotId: string, url: string | null) => void;
}

interface DrawerView {
  title: string;
  kicker?: string;
  accent: string;
  content: React.ReactNode;
}

function renderDrawer(pin: PinKey | null, ctx: DrawerCtx): DrawerView | null {
  if (!pin) return null;
  const modeLabel = ctx.mode === 'gaming' ? 'GAMING' : 'FOOTBALL';
  switch (pin) {
    case 'handle':
      return {
        title: 'HANDLE',
        kicker: '// your @ name',
        accent: ED.amber,
        content: <HandleEditor handle={ctx.content.handle} onChange={ctx.setHandle} />
      };
    case 'hero':
      return {
        title: `HERO · ${modeLabel}`,
        kicker: '// tagline + bio + cta + vibe',
        accent: ED.amber,
        content: (
          <HeroEditor
            hero={ctx.content.hero[ctx.mode]}
            onChange={ctx.setHero}
          />
        )
      };
    case 'stats':
      return {
        title: `STATS · ${modeLabel}`,
        kicker: '// 4 cells, label + value',
        accent: ED.ink,
        content: (
          <StatsEditor stats={ctx.content.stats[ctx.mode]} onChange={ctx.setStats} />
        )
      };
    case 'mood':
      return {
        title: 'STATUS · MOOD',
        kicker: '// what shows next to your name',
        accent: ED.green,
        content: <StatusModule hideHeader mood={ctx.content.mood} setMood={ctx.setMood} />
      };
    case 'subs':
      return {
        title: 'SUBSCRIBERS',
        kicker: `// goal · ${ctx.content.subs.goal}`,
        accent: ED.pink,
        content: <SubsModule hideHeader subs={ctx.content.subs} setSubs={ctx.setSubs} />
      };
    case 'now':
      return {
        title: `NOW · ${ctx.mode === 'gaming' ? 'EQUIPPED' : 'STARTING XI'}`,
        kicker: `// this week's ${ctx.mode}`,
        accent: ED.blue,
        content: (
          <NowPlayingModule
            hideHeader
            mode={ctx.mode}
            now={ctx.content.now[ctx.mode]}
            setNow={ctx.setNow}
          />
        )
      };
    case 'pinned-video':
      return {
        title: 'PINNED REPLAY',
        kicker: '// shows first in REPLAYS.',
        accent: ED.amber,
        content: (
          <PinnedVideoModule
            hideHeader
            videos={ctx.videos}
            pinnedId={ctx.content.videos.pinnedId}
            setPinnedId={ctx.setPinnedId}
          />
        )
      };
    case 'about':
      return {
        title: 'ABOUT.DAT',
        kicker: '// the bio on the homepage',
        accent: ED.amber,
        content: <AboutModule hideHeader about={ctx.content.about} setAbout={ctx.setAbout} />
      };
    case 'book':
      return {
        title: 'BOOK',
        kicker: '// title + subtitle + description + cover',
        accent: ED.pink,
        content: (
          <BookEditor
            book={ctx.content.book}
            onChange={ctx.setBook}
            coverUrl={ctx.content.images['book-cover'] ?? null}
            onCoverChange={(url) => ctx.setImage('book-cover', url)}
          />
        )
      };
    case 'socials':
      return {
        title: 'SOCIAL UPLINK',
        kicker: '// footer links',
        accent: ED.pink,
        content: <SocialsModule hideHeader socials={ctx.content.socials} setSocials={ctx.setSocials} />
      };
    case 'thumb-style':
      return {
        title: 'REPLAY STYLE',
        kicker: '// thumbnails + rarity tags',
        accent: ED.amber,
        content: <ThumbStyleModule hideHeader videos={ctx.content.videos} setVideos={ctx.setVideos} />
      };
    case 'defaults':
      return {
        title: 'BOOT MODE',
        kicker: '// what fresh visitors see first',
        accent: ED.amber,
        content: <DefaultModeModule hideHeader defaultMode={ctx.content.defaultMode} setDefaultMode={ctx.setDefaultMode} />
      };
  }
}

// ── Inline editors (fields that don't have a dedicated Module) ─────────────

const HandleEditor = ({ handle, onChange }: { handle: string; onChange: (v: string) => void }) => (
  <Field label={`handle · max ${FIELD_LIMITS.handle}`}>
    <input
      value={handle}
      maxLength={FIELD_LIMITS.handle}
      onChange={(e) => onChange(e.target.value)}
      placeholder="@khalilgaming2020"
      style={editInput}
    />
  </Field>
);

const HeroEditor = ({
  hero,
  onChange
}: {
  hero: ModeHeroCopy;
  onChange: (h: ModeHeroCopy) => void;
}) => {
  const update = (key: keyof ModeHeroCopy, val: string) => onChange({ ...hero, [key]: val });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label={`tagline · max ${FIELD_LIMITS.tagline}`}>
        <input
          value={hero.tagline}
          maxLength={FIELD_LIMITS.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          style={editInput}
        />
      </Field>
      <Field label={`bio · max ${FIELD_LIMITS.bio}`}>
        <textarea
          value={hero.bio}
          maxLength={FIELD_LIMITS.bio}
          onChange={(e) => update('bio', e.target.value)}
          rows={4}
          style={editInput}
        />
      </Field>
      <Field label={`cta · max ${FIELD_LIMITS.cta}`}>
        <input
          value={hero.cta}
          maxLength={FIELD_LIMITS.cta}
          onChange={(e) => update('cta', e.target.value)}
          style={editInput}
        />
      </Field>
      <Field label={`vibe · max ${FIELD_LIMITS.vibe}`}>
        <input
          value={hero.vibe}
          maxLength={FIELD_LIMITS.vibe}
          onChange={(e) => update('vibe', e.target.value)}
          style={editInput}
        />
      </Field>
    </div>
  );
};

const StatsEditor = ({
  stats,
  onChange
}: {
  stats: ModeStats;
  onChange: (s: ModeStats) => void;
}) => {
  const updateOne = (i: number, key: 'labels' | 'values', val: string) => {
    const labels = [...stats.labels] as [string, string, string, string];
    const values = [...stats.values] as [string, string, string, string];
    if (key === 'labels') labels[i] = val;
    else values[i] = val;
    onChange({ labels, values });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            padding: 10,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${ED.line}`,
            borderRadius: 3
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: ED.amber,
              letterSpacing: 1.4,
              marginBottom: 6,
              textTransform: 'uppercase'
            }}
          >
            cell {i + 1}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 8 }}>
            <input
              value={stats.values[i]}
              maxLength={FIELD_LIMITS.statValue}
              onChange={(e) => updateOne(i, 'values', e.target.value)}
              placeholder="value"
              style={{ ...editInput, fontFamily: FONT.stencil, fontSize: 14 }}
            />
            <input
              value={stats.labels[i]}
              maxLength={FIELD_LIMITS.statLabel}
              onChange={(e) => updateOne(i, 'labels', e.target.value)}
              placeholder="label"
              style={editInput}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const BookEditor = ({
  book,
  onChange,
  coverUrl,
  onCoverChange
}: {
  book: SiteContent['book'];
  onChange: (b: SiteContent['book']) => void;
  coverUrl: string | null;
  onCoverChange: (url: string | null) => void;
}) => {
  const update = <K extends keyof SiteContent['book']>(key: K, val: SiteContent['book'][K]) =>
    onChange({ ...book, [key]: val });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Cover photo (shares slot with the IMAGES section's BOOK COVER) */}
      <ImageDropzone
        slotId="book-cover"
        label="COVER PHOTO"
        currentUrl={coverUrl}
        onUploaded={(url) => onCoverChange(url)}
        onRemoved={() => onCoverChange(null)}
        aspect="3 / 4"
      />
      {/* Visible toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${book.visible ? ED.green : ED.line}`,
          borderRadius: 3
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: ED.inkDim,
            letterSpacing: 1.4,
            textTransform: 'uppercase'
          }}
        >
          visibility
        </div>
        <button
          type="button"
          onClick={() => update('visible', !book.visible)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: book.visible ? `${ED.green}22` : 'rgba(0,0,0,0.4)',
            border: `1px solid ${book.visible ? ED.green : ED.line}`,
            borderRadius: 999,
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: 1.4,
            color: book.visible ? ED.green : ED.inkDim,
            cursor: 'pointer',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: book.visible ? ED.green : ED.inkDim,
              boxShadow: book.visible ? `0 0 6px ${ED.green}` : 'none'
            }}
          />
          {book.visible ? 'live on site' : 'hidden'}
        </button>
      </div>
      <Field label={`title · max ${FIELD_LIMITS.bookTitle}`}>
        <input
          value={book.title}
          maxLength={FIELD_LIMITS.bookTitle}
          onChange={(e) => update('title', e.target.value)}
          style={editInput}
        />
      </Field>
      <Field label={`subtitle · max ${FIELD_LIMITS.bookSubtitle}`}>
        <input
          value={book.subtitle}
          maxLength={FIELD_LIMITS.bookSubtitle}
          onChange={(e) => update('subtitle', e.target.value)}
          style={editInput}
        />
      </Field>
      <Field label={`description · max ${FIELD_LIMITS.bookDescription}`}>
        <textarea
          value={book.description}
          maxLength={FIELD_LIMITS.bookDescription}
          onChange={(e) => update('description', e.target.value)}
          rows={5}
          style={editInput}
        />
      </Field>
      <Field label={`chapter · max ${FIELD_LIMITS.bookChapter}`}>
        <input
          value={book.chapter}
          maxLength={FIELD_LIMITS.bookChapter}
          onChange={(e) => update('chapter', e.target.value)}
          style={editInput}
        />
      </Field>
      <Field label={`status · max ${FIELD_LIMITS.bookStatus}`}>
        <input
          value={book.status}
          maxLength={FIELD_LIMITS.bookStatus}
          onChange={(e) => update('status', e.target.value)}
          style={editInput}
        />
      </Field>
    </div>
  );
};
