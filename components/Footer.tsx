import type { SiteContent } from '@/lib/content';

interface Props {
  content: SiteContent;
}

const SocialLink = ({ href, label, glyph }: { href: string; label: string; glyph: string }) => {
  // Icons are h/w-12 (48px) — comfortably above the 44pt iOS HIG minimum even after
  // accounting for the rounded border being ~visually smaller than the hit-box.
  if (!href) {
    return (
      <span
        className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border border-card-border bg-white/5 text-sm font-extrabold text-text-dim/70"
        title={`${label} link coming soon`}
        aria-label={`${label} link not set yet`}
      >
        {glyph}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-card-border bg-white/5 text-sm font-extrabold text-text transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--accent-2)] hover:text-[#0a0420]"
    >
      {glyph}
    </a>
  );
};

export const Footer = ({ content }: Props) => (
  <footer className="relative z-10 mt-10 border-t border-card-border px-5 py-10 text-center text-xs text-text-dim">
    <div className="mb-4 flex justify-center gap-3">
      <SocialLink href="https://www.youtube.com/@khalilgaming2020" label="YouTube" glyph="YT" />
      <SocialLink href={content.socials.tiktok} label="TikTok" glyph="TT" />
      <SocialLink href={content.socials.instagram} label="Instagram" glyph="IG" />
    </div>
    <span>Made with <span aria-hidden>💙</span> for Khalil</span>
  </footer>
);
