import contentJson from '@/content.json';

export type Mode = 'gaming' | 'football';

export interface ModeCopy {
  tagline: string;
  bio: string;
}

export interface SiteContent {
  defaultMode: Mode;
  hero: Record<Mode, ModeCopy>;
  about: {
    paragraph1: string;
    paragraph2: string;
  };
  book: {
    visible: boolean;
    title: string;
    description: string;
    status: string;
  };
  socials: {
    tiktok: string;
    instagram: string;
  };
}

// Per-field length rails — also used by the /edit form to enforce.
export const FIELD_LIMITS = {
  tagline: 60,
  bio: 300,
  aboutParagraph: 600,
  bookTitle: 80,
  bookDescription: 500,
  bookStatus: 40,
  socialUrl: 200
} as const;

export const isMode = (value: unknown): value is Mode =>
  value === 'gaming' || value === 'football';

export const getContent = (): SiteContent => contentJson as SiteContent;

// Validates a partial content object posted from /edit. Returns the normalized
// content on success, or an array of human-readable errors on failure.
export type ValidationResult =
  | { ok: true; content: SiteContent }
  | { ok: false; errors: string[] };

const isHttpUrl = (raw: string): boolean => {
  if (!raw) return true; // empty is allowed — means "no link yet"
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const validateContent = (raw: unknown): ValidationResult => {
  const errors: string[] = [];
  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['Bad content payload.'] };
  }
  const c = raw as Partial<SiteContent>;

  if (!isMode(c.defaultMode)) errors.push('Pick a default mode (gaming or football).');

  const checkText = (val: unknown, label: string, max: number): string => {
    if (typeof val !== 'string') { errors.push(`${label} is missing.`); return ''; }
    const trimmed = val.trim();
    if (!trimmed) errors.push(`${label} can't be empty.`);
    if (trimmed.length > max) errors.push(`${label} is too long (max ${max} chars).`);
    return trimmed;
  };

  if (!c.hero || typeof c.hero !== 'object') {
    errors.push('Hero copy is missing.');
  }
  const heroGaming = c.hero?.gaming;
  const heroFootball = c.hero?.football;
  if (!heroGaming || !heroFootball) errors.push('Both gaming and football hero copies are required.');

  if (!c.about) errors.push('About is missing.');
  if (!c.book) errors.push('Book is missing.');
  if (!c.socials) errors.push('Socials are missing.');

  if (c.socials) {
    if (typeof c.socials.tiktok !== 'string' || !isHttpUrl(c.socials.tiktok)) {
      errors.push('TikTok link should be a full https:// URL or empty.');
    }
    if (typeof c.socials.instagram !== 'string' || !isHttpUrl(c.socials.instagram)) {
      errors.push('Instagram link should be a full https:// URL or empty.');
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  // At this point we've checked the top-level shape; do length checks and build the normalized object.
  const normalized: SiteContent = {
    defaultMode: c.defaultMode as Mode,
    hero: {
      gaming: {
        tagline: checkText(heroGaming!.tagline, 'Gaming tagline', FIELD_LIMITS.tagline),
        bio: checkText(heroGaming!.bio, 'Gaming bio', FIELD_LIMITS.bio)
      },
      football: {
        tagline: checkText(heroFootball!.tagline, 'Football tagline', FIELD_LIMITS.tagline),
        bio: checkText(heroFootball!.bio, 'Football bio', FIELD_LIMITS.bio)
      }
    },
    about: {
      paragraph1: checkText(c.about!.paragraph1, 'About paragraph 1', FIELD_LIMITS.aboutParagraph),
      paragraph2: checkText(c.about!.paragraph2, 'About paragraph 2', FIELD_LIMITS.aboutParagraph)
    },
    book: {
      visible: Boolean(c.book!.visible),
      title: checkText(c.book!.title, 'Book title', FIELD_LIMITS.bookTitle),
      description: checkText(c.book!.description, 'Book description', FIELD_LIMITS.bookDescription),
      status: checkText(c.book!.status, 'Book status', FIELD_LIMITS.bookStatus)
    },
    socials: {
      tiktok: c.socials!.tiktok.trim(),
      instagram: c.socials!.instagram.trim()
    }
  };

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, content: normalized };
};
