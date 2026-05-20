import contentJson from '@/content.json';

export type Mode = 'gaming' | 'football';

export interface ModeHeroCopy {
  tagline: string;
  bio: string;
  cta: string;
  vibe: string;
}

export interface ModeStats {
  labels: [string, string, string, string];
  values: [string, string, string, string];
}

export interface NowBlock {
  playing: string;
  watching: string;
  reading: string;
  listening: string;
}

export interface DesignThumb {
  from: string;
  to: string;
  emoji: string;
}

export type VideoTier = 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';

export type Mood = 'online' | 'on-fire' | 'streaming' | 'in-school' | 'sleeping';

export interface VideoEditorial {
  useDesignThumbForFeatured: boolean;
  useDesignThumbsForRest: boolean;
  designThumbs: DesignThumb[];
  tiers: VideoTier[];
  pinnedId: string | null;
}

export interface SiteContent {
  defaultMode: Mode;
  handle: string;
  subs: { current: number; goal: number };
  mood: Mood;
  hero: Record<Mode, ModeHeroCopy>;
  stats: Record<Mode, ModeStats>;
  now: Record<Mode, NowBlock>;
  about: string[];
  book: {
    visible: boolean;
    title: string;
    subtitle: string;
    description: string;
    chapter: string;
    status: string;
  };
  videos: VideoEditorial;
  socials: { tiktok: string; instagram: string };
}

// Per-field length rails — also used by the /edit form to enforce.
export const FIELD_LIMITS = {
  tagline: 60,
  bio: 300,
  cta: 32,
  vibe: 40,
  aboutParagraph: 600,
  bookTitle: 80,
  bookSubtitle: 120,
  bookDescription: 500,
  bookStatus: 40,
  bookChapter: 32,
  socialUrl: 200,
  handle: 40,
  nowField: 80,
  statValue: 12,
  statLabel: 16
} as const;

const MOODS: Mood[] = ['online', 'on-fire', 'streaming', 'in-school', 'sleeping'];

export const isMode = (value: unknown): value is Mode =>
  value === 'gaming' || value === 'football';

export const isMood = (value: unknown): value is Mood =>
  typeof value === 'string' && (MOODS as string[]).includes(value);

// Default values for new schema fields. Used when the /edit form posts an
// older shape — we merge the validated submission into the current content
// so the new fields round-trip untouched.
const DEFAULTS = {
  handle: '@khalilgaming2020',
  subs: { current: 744, goal: 1000 },
  mood: 'online' as Mood,
  cta: '▶ subscribe',
  vibe: 'loadout ready'
};

export const getContent = (): SiteContent => contentJson as SiteContent;

export type ValidationResult =
  | { ok: true; content: SiteContent }
  | { ok: false; errors: string[] };

const isHttpUrl = (raw: string): boolean => {
  if (!raw) return true;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

const text = (val: unknown, label: string, max: number, errors: string[]): string => {
  if (typeof val !== 'string') { errors.push(`${label} is missing.`); return ''; }
  const trimmed = val.trim();
  if (!trimmed) errors.push(`${label} can't be empty.`);
  if (trimmed.length > max) errors.push(`${label} is too long (max ${max} chars).`);
  return trimmed;
};

// Same as `text` but allows empty strings (length-only enforcement).
// Used for optional fields like "now reading" or a blank stat cell.
const textOptional = (val: unknown, label: string, max: number, errors: string[]): string => {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (trimmed.length > max) errors.push(`${label} is too long (max ${max} chars).`);
  return trimmed;
};

const VALID_TIERS: VideoTier[] = ['LEGENDARY', 'EPIC', 'RARE', 'COMMON'];

const buildDesignThumbs = (raw: unknown, fallback: DesignThumb[]): DesignThumb[] => {
  if (!Array.isArray(raw)) return fallback;
  const out: DesignThumb[] = [];
  for (const entry of raw) {
    if (
      entry &&
      typeof entry === 'object' &&
      typeof (entry as DesignThumb).from === 'string' &&
      typeof (entry as DesignThumb).to === 'string' &&
      typeof (entry as DesignThumb).emoji === 'string'
    ) {
      const e = entry as DesignThumb;
      out.push({ from: e.from, to: e.to, emoji: e.emoji });
    }
  }
  return out.length > 0 ? out : fallback;
};

const buildTiers = (raw: unknown, fallback: VideoTier[]): VideoTier[] => {
  if (!Array.isArray(raw)) return fallback;
  const out: VideoTier[] = [];
  for (const entry of raw) {
    if (typeof entry === 'string' && (VALID_TIERS as string[]).includes(entry)) {
      out.push(entry as VideoTier);
    }
  }
  return out.length > 0 ? out : fallback;
};

// Validates a submission against the current schema. Older /edit form
// payloads (with `about: { paragraph1, paragraph2 }` and no `cta`/`vibe`)
// are accepted: missing-but-required fields fall back to the values
// already in content.json (`base`), so unrelated fields round-trip on save.
export const validateContent = (raw: unknown, base?: SiteContent): ValidationResult => {
  const errors: string[] = [];
  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['Bad content payload.'] };
  }
  const c = raw as Record<string, unknown>;
  const current = base ?? getContent();

  // Default mode
  const defaultMode = isMode(c.defaultMode) ? c.defaultMode : null;
  if (!defaultMode) errors.push('Pick a default mode (gaming or football).');

  // Hero per mode
  const heroRaw = (c.hero ?? {}) as Record<string, Partial<ModeHeroCopy>>;
  const buildHero = (mode: Mode): ModeHeroCopy => {
    const src = heroRaw[mode] ?? {};
    const fallback = current.hero[mode];
    return {
      tagline: text(src.tagline ?? fallback.tagline, `${mode} tagline`, FIELD_LIMITS.tagline, errors),
      bio: text(src.bio ?? fallback.bio, `${mode} bio`, FIELD_LIMITS.bio, errors),
      cta: text(src.cta ?? fallback.cta ?? DEFAULTS.cta, `${mode} CTA`, FIELD_LIMITS.cta, errors),
      vibe: text(src.vibe ?? fallback.vibe ?? DEFAULTS.vibe, `${mode} vibe`, FIELD_LIMITS.vibe, errors)
    };
  };

  // About — accept the new string[] shape OR the legacy {paragraph1, paragraph2}.
  let aboutArr: string[];
  if (Array.isArray(c.about)) {
    aboutArr = c.about.map((p, i) => text(p, `About paragraph ${i + 1}`, FIELD_LIMITS.aboutParagraph, errors));
  } else if (c.about && typeof c.about === 'object') {
    const legacy = c.about as { paragraph1?: string; paragraph2?: string };
    aboutArr = [
      text(legacy.paragraph1 ?? current.about[0] ?? '', 'About paragraph 1', FIELD_LIMITS.aboutParagraph, errors),
      text(legacy.paragraph2 ?? current.about[1] ?? '', 'About paragraph 2', FIELD_LIMITS.aboutParagraph, errors)
    ];
  } else {
    aboutArr = current.about;
  }
  if (aboutArr.length === 0) errors.push('At least one About paragraph is required.');

  // Book
  const bookRaw = (c.book ?? {}) as Partial<SiteContent['book']>;
  const book: SiteContent['book'] = {
    visible: typeof bookRaw.visible === 'boolean' ? bookRaw.visible : current.book.visible,
    title: text(bookRaw.title ?? current.book.title, 'Book title', FIELD_LIMITS.bookTitle, errors),
    subtitle: text(bookRaw.subtitle ?? current.book.subtitle, 'Book subtitle', FIELD_LIMITS.bookSubtitle, errors),
    description: text(bookRaw.description ?? current.book.description, 'Book description', FIELD_LIMITS.bookDescription, errors),
    chapter: text(bookRaw.chapter ?? current.book.chapter, 'Book chapter', FIELD_LIMITS.bookChapter, errors),
    status: text(bookRaw.status ?? current.book.status, 'Book status', FIELD_LIMITS.bookStatus, errors)
  };

  // Socials
  const socialsRaw = (c.socials ?? {}) as { tiktok?: string; instagram?: string };
  const tiktok = (socialsRaw.tiktok ?? current.socials.tiktok ?? '').trim();
  const instagram = (socialsRaw.instagram ?? current.socials.instagram ?? '').trim();
  if (!isHttpUrl(tiktok)) errors.push('TikTok link should be a full https:// URL or empty.');
  if (!isHttpUrl(instagram)) errors.push('Instagram link should be a full https:// URL or empty.');

  // Fields not in the legacy form — preserved from `current` unless the
  // submission explicitly overrides them. Once /edit step 6 lands, these
  // become editable; until then the merge keeps them stable.
  const handle = typeof c.handle === 'string' && c.handle.trim()
    ? text(c.handle, 'Handle', FIELD_LIMITS.handle, errors)
    : current.handle;

  let subs = current.subs;
  if (c.subs && typeof c.subs === 'object') {
    const s = c.subs as { current?: unknown; goal?: unknown };
    const cur = typeof s.current === 'number' && s.current >= 0 ? Math.floor(s.current) : current.subs.current;
    const goal = typeof s.goal === 'number' && s.goal > 0 ? Math.floor(s.goal) : current.subs.goal;
    subs = { current: cur, goal };
  }

  const mood: Mood = isMood(c.mood) ? c.mood : current.mood;

  // Stats per mode — labels + values tuples. Allowed-empty (a stat cell can
  // be blank); only length is enforced. Missing mode/field falls back to
  // current so partial submissions don't wipe data.
  const statsRaw = (c.stats ?? {}) as Partial<Record<Mode, Partial<ModeStats>>>;
  const buildStats = (m: Mode): ModeStats => {
    const src = statsRaw[m] ?? {};
    const fallback = current.stats[m];
    const fb = (key: 'labels' | 'values', i: number): string => {
      const arr = src[key];
      if (Array.isArray(arr) && typeof arr[i] === 'string') return arr[i] as string;
      return fallback[key][i] ?? '';
    };
    const labels: [string, string, string, string] = [
      textOptional(fb('labels', 0), `${m} stat #1 label`, FIELD_LIMITS.statLabel, errors),
      textOptional(fb('labels', 1), `${m} stat #2 label`, FIELD_LIMITS.statLabel, errors),
      textOptional(fb('labels', 2), `${m} stat #3 label`, FIELD_LIMITS.statLabel, errors),
      textOptional(fb('labels', 3), `${m} stat #4 label`, FIELD_LIMITS.statLabel, errors)
    ];
    const values: [string, string, string, string] = [
      textOptional(fb('values', 0), `${m} stat #1 value`, FIELD_LIMITS.statValue, errors),
      textOptional(fb('values', 1), `${m} stat #2 value`, FIELD_LIMITS.statValue, errors),
      textOptional(fb('values', 2), `${m} stat #3 value`, FIELD_LIMITS.statValue, errors),
      textOptional(fb('values', 3), `${m} stat #4 value`, FIELD_LIMITS.statValue, errors)
    ];
    return { labels, values };
  };
  const stats: Record<Mode, ModeStats> = {
    gaming: buildStats('gaming'),
    football: buildStats('football')
  };

  // Now per mode — playing/watching/reading/listening. Allowed-empty.
  const nowRaw = (c.now ?? {}) as Partial<Record<Mode, Partial<NowBlock>>>;
  const buildNow = (m: Mode): NowBlock => {
    const src = nowRaw[m] ?? {};
    const fallback = current.now[m];
    return {
      playing: textOptional(src.playing ?? fallback.playing, `${m} now · playing`, FIELD_LIMITS.nowField, errors),
      watching: textOptional(src.watching ?? fallback.watching, `${m} now · watching`, FIELD_LIMITS.nowField, errors),
      reading: textOptional(src.reading ?? fallback.reading, `${m} now · reading`, FIELD_LIMITS.nowField, errors),
      listening: textOptional(src.listening ?? fallback.listening, `${m} now · listening`, FIELD_LIMITS.nowField, errors)
    };
  };
  const now: Record<Mode, NowBlock> = {
    gaming: buildNow('gaming'),
    football: buildNow('football')
  };

  // Videos editorial — booleans + arrays + pinnedId. Each field falls back
  // to current.videos if missing/malformed, so partial submissions are safe.
  const videosRaw = (c.videos ?? {}) as Partial<VideoEditorial>;
  const pinnedIdRaw = videosRaw.pinnedId;
  const videos: VideoEditorial = {
    useDesignThumbForFeatured: typeof videosRaw.useDesignThumbForFeatured === 'boolean'
      ? videosRaw.useDesignThumbForFeatured
      : current.videos.useDesignThumbForFeatured,
    useDesignThumbsForRest: typeof videosRaw.useDesignThumbsForRest === 'boolean'
      ? videosRaw.useDesignThumbsForRest
      : current.videos.useDesignThumbsForRest,
    designThumbs: buildDesignThumbs(videosRaw.designThumbs, current.videos.designThumbs),
    tiers: buildTiers(videosRaw.tiers, current.videos.tiers),
    pinnedId:
      pinnedIdRaw === null
        ? null
        : typeof pinnedIdRaw === 'string'
          ? pinnedIdRaw.trim() || null
          : current.videos.pinnedId
  };

  if (errors.length > 0) return { ok: false, errors };

  const content: SiteContent = {
    defaultMode: defaultMode as Mode,
    handle,
    subs,
    mood,
    hero: {
      gaming: buildHero('gaming'),
      football: buildHero('football')
    },
    stats,
    now,
    about: aboutArr,
    book,
    videos,
    socials: { tiktok, instagram }
  };

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, content };
};
