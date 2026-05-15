'use client';

import { useState } from 'react';
import { FIELD_LIMITS, type Mode, type SiteContent } from '@/lib/content';
import { PreviewPane } from './PreviewPane';

type View = 'edit' | 'preview';

interface Props {
  initialContent: SiteContent;
}

interface TextFieldProps {
  label: string;
  hint: string;
  value: string;
  maxLength: number;
  onChange: (v: string) => void;
  rows?: number;
  type?: 'text' | 'url';
  placeholder?: string;
}

const TextField = ({ label, hint, value, maxLength, onChange, rows = 3, type = 'text', placeholder }: TextFieldProps) => {
  const over = value.length > maxLength;
  // text-base ensures 16px font on iOS so the system doesn't auto-zoom on focus.
  // py-3 keeps the hit-box ≥ 44pt on small screens.
  const inputBase =
    'w-full rounded-lg border border-white/15 bg-black/40 px-3 py-3 text-base text-white outline-none focus:border-[var(--accent-2)]';
  return (
    <div className="mb-5">
      <label className="mb-1 block text-sm font-semibold text-white">{label}</label>
      <p className="mb-2 text-xs text-text-dim">{hint}</p>
      {rows === 1 ? (
        <input
          type={type === 'url' ? 'url' : 'text'}
          inputMode={type === 'url' ? 'url' : 'text'}
          autoCapitalize={type === 'url' ? 'off' : 'sentences'}
          autoCorrect={type === 'url' ? 'off' : 'on'}
          spellCheck={type === 'url' ? false : true}
          value={value}
          maxLength={maxLength + 50}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputBase}
        />
      ) : (
        <textarea
          value={value}
          rows={rows}
          maxLength={maxLength + 50}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputBase} resize-y leading-relaxed`}
        />
      )}
      <div className={`mt-1 text-right text-[11px] ${over ? 'text-red-300' : 'text-text-dim/60'}`}>
        {value.length} / {maxLength}
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
    <h2 className="mb-4 font-display text-lg tracking-wide text-[var(--accent-2)]">{title}</h2>
    {children}
  </div>
);

export const EditForm = ({ initialContent }: Props) => {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  // On wide screens (lg) the form + preview are split — `view` is ignored.
  // On narrow screens it controls which of the two we're showing.
  const [view, setView] = useState<View>('edit');

  const updateHero = (mode: Mode, field: 'tagline' | 'bio', value: string) => {
    setContent(c => ({ ...c, hero: { ...c.hero, [mode]: { ...c.hero[mode], [field]: value } } }));
  };

  const onSave = async () => {
    setSaving(true);
    setErrors([]);
    setToast(null);
    try {
      const res = await fetch('/api/edit/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      const data = (await res.json()) as { ok: boolean; errors?: string[] };
      if (data.ok) {
        setToast("Saved! The site will rebuild in about a minute.");
        setTimeout(() => setToast(null), 6000);
      } else {
        setErrors(data.errors ?? ['Save failed.']);
      }
    } catch {
      setErrors(['Network error — your changes are still in the form, try Save again.']);
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await fetch('/api/edit/logout', { method: 'POST' });
    window.location.href = '/edit';
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-white sm:text-3xl" style={{ textShadow: 'var(--glow)' }}>
            Edit your site
          </h1>
          <p className="mt-1 text-xs text-text-dim">
            Changes go live a minute after you hit Save. Tip: wrap words in *stars* to make them bold.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="min-h-[44px] rounded-full border border-white/20 px-4 py-2 text-sm text-text-dim hover:bg-white/5"
        >
          Log out
        </button>
      </header>

      {/* Narrow-screen tab toggle: Edit | Preview. Hidden at lg+, where both render side-by-side. */}
      <div className="mb-4 flex gap-1 rounded-full border border-white/10 bg-black/30 p-1 lg:hidden">
        {(['edit', 'preview'] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
              view === v
                ? 'bg-[var(--accent-2)] text-[var(--bg-1)]'
                : 'text-text-dim hover:bg-white/5'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className={view === 'edit' ? '' : 'hidden lg:block'}>
          <Section title="Hero — gaming mode">
            <TextField
              label="Gaming tagline"
              hint='The small line above your big name when gaming mode is on. E.g. "Streamer · Gamer · Author".'
              value={content.hero.gaming.tagline}
              maxLength={FIELD_LIMITS.tagline}
              rows={1}
              onChange={v => updateHero('gaming', 'tagline', v)}
            />
            <TextField
              label="Gaming bio"
              hint="The paragraph next to your name when gaming mode is on."
              value={content.hero.gaming.bio}
              maxLength={FIELD_LIMITS.bio}
              onChange={v => updateHero('gaming', 'bio', v)}
            />
          </Section>

          <Section title="Hero — football mode">
            <TextField
              label="Football tagline"
              hint='The small line above your big name when football mode is on. E.g. "Striker · Madridista · Author".'
              value={content.hero.football.tagline}
              maxLength={FIELD_LIMITS.tagline}
              rows={1}
              onChange={v => updateHero('football', 'tagline', v)}
            />
            <TextField
              label="Football bio"
              hint="The paragraph next to your name when football mode is on."
              value={content.hero.football.bio}
              maxLength={FIELD_LIMITS.bio}
              onChange={v => updateHero('football', 'bio', v)}
            />
          </Section>

          <Section title="About me">
            <TextField
              label="First paragraph"
              hint="What people see first when they scroll to the About section. Wrap words in *stars* to make them bold."
              value={content.about.paragraph1}
              maxLength={FIELD_LIMITS.aboutParagraph}
              rows={5}
              onChange={v => setContent(c => ({ ...c, about: { ...c.about, paragraph1: v } }))}
            />
            <TextField
              label="Second paragraph"
              hint="The second paragraph in the About section."
              value={content.about.paragraph2}
              maxLength={FIELD_LIMITS.aboutParagraph}
              rows={4}
              onChange={v => setContent(c => ({ ...c, about: { ...c.about, paragraph2: v } }))}
            />
          </Section>

          <Section title="My book">
            <label className="mb-4 flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={content.book.visible}
                onChange={e => setContent(c => ({ ...c, book: { ...c.book, visible: e.target.checked } }))}
                className="h-4 w-4 accent-[var(--accent-2)]"
              />
              Show the book section on the site
            </label>
            <TextField
              label="Book title"
              hint='The big title on the book card.'
              value={content.book.title}
              maxLength={FIELD_LIMITS.bookTitle}
              rows={1}
              onChange={v => setContent(c => ({ ...c, book: { ...c.book, title: v } }))}
            />
            <TextField
              label="Book description"
              hint="A few sentences about your book."
              value={content.book.description}
              maxLength={FIELD_LIMITS.bookDescription}
              rows={4}
              onChange={v => setContent(c => ({ ...c, book: { ...c.book, description: v } }))}
            />
            <TextField
              label="Status pill"
              hint='The little tag — e.g. "Coming soon" or "On sale now".'
              value={content.book.status}
              maxLength={FIELD_LIMITS.bookStatus}
              rows={1}
              onChange={v => setContent(c => ({ ...c, book: { ...c.book, status: v } }))}
            />
          </Section>

          <Section title="Your social links">
            <TextField
              label="TikTok link"
              hint='Paste the full https://www.tiktok.com/... link. Leave blank to hide.'
              value={content.socials.tiktok}
              maxLength={FIELD_LIMITS.socialUrl}
              type="url"
              rows={1}
              placeholder="https://www.tiktok.com/@..."
              onChange={v => setContent(c => ({ ...c, socials: { ...c.socials, tiktok: v } }))}
            />
            <TextField
              label="Instagram link"
              hint='Paste the full https://www.instagram.com/... link. Leave blank to hide.'
              value={content.socials.instagram}
              maxLength={FIELD_LIMITS.socialUrl}
              type="url"
              rows={1}
              placeholder="https://www.instagram.com/..."
              onChange={v => setContent(c => ({ ...c, socials: { ...c.socials, instagram: v } }))}
            />
          </Section>

          <Section title="Which mode shows first">
            <p className="mb-3 text-xs text-text-dim">
              When someone visits the site for the first time, they&apos;ll see this mode. After that, the site remembers what they last chose.
            </p>
            <div className="flex gap-2">
              {(['gaming', 'football'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setContent(c => ({ ...c, defaultMode: m }))}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm capitalize transition-colors ${
                    content.defaultMode === m
                      ? 'border-[var(--accent-2)] bg-[var(--accent-2)]/20 text-white'
                      : 'border-white/15 text-text-dim hover:bg-white/5'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Section>

          {errors.length > 0 && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
              <div className="mb-1 text-sm font-semibold text-red-200">Fix these and save again:</div>
              <ul className="list-inside list-disc text-sm text-red-200">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Save bar.
              On lg+: sticky to the bottom of the viewport so the user always sees Save.
              On narrow (iOS): inline at the bottom of the form. We deliberately don't
              make it fixed/sticky on small screens because iOS Safari's on-screen
              keyboard reshapes the viewport in ways that conflict with sticky bottom.
              After typing the last field, the user scrolls down and sees the bar. */}
          <div
            className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-black/60 p-3 backdrop-blur-md lg:sticky lg:bottom-4"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="min-h-[44px] rounded-full bg-[var(--accent-2)] px-6 py-3 font-display text-sm tracking-wide text-[var(--bg-1)] shadow-glow disabled:opacity-50"
            >
              {saving ? 'Saving…' : '💾 Save changes'}
            </button>
            {toast && <span className="text-sm text-green-300">{toast}</span>}
          </div>
        </div>

        <div className={view === 'preview' ? 'block' : 'hidden lg:block'}>
          <PreviewPane content={content} />
        </div>
      </div>
    </div>
  );
};
