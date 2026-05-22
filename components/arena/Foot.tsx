import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import type { SiteContent } from '@/lib/content';
import { themedBackdrop } from '@/lib/gaming-themes';

interface Props {
  theme: ArenaTheme;
  size: ArenaSize;
  socials: SiteContent['socials'];
}

const YT_URL = 'https://www.youtube.com/@khalilgaming2020';

interface SocialLinkProps {
  label: string;
  href: string | null;
  size: ArenaSize;
  theme: ArenaTheme;
}

const SocialLink = ({ label, href, size, theme }: SocialLinkProps) => {
  const isDesktop = size === 'desktop';
  const dim = !href;
  const style = {
    width: isDesktop ? 40 : 30,
    height: isDesktop ? 40 : 30,
    borderRadius: 6,
    background: themedBackdrop(theme.fg, 0.4),
    border: `1px solid ${theme.cardBorder}`,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontFamily: "'Anton', sans-serif",
    fontSize: isDesktop ? 14 : 12,
    color: theme.fg,
    letterSpacing: 1,
    textDecoration: 'none' as const,
    transition: 'border-color .6s ease',
    opacity: dim ? 0.4 : 1
  };
  if (!href) return <span style={style}>{label}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style} aria-label={`Khalil on ${label}`}>
      {label}
    </a>
  );
};

export const Foot = ({ theme, size, socials }: Props) => {
  const isDesktop = size === 'desktop';
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        padding: isDesktop ? '24px 64px 32px' : '0 14px 26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <SocialLink label="YT" href={YT_URL} size={size} theme={theme} />
        <SocialLink label="TT" href={socials.tiktok || null} size={size} theme={theme} />
        <SocialLink label="IG" href={socials.instagram || null} size={size} theme={theme} />
      </div>
      <span
        style={{
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: isDesktop ? 11 : 9,
          color: theme.accent,
          letterSpacing: 1,
          opacity: 0.7,
          transition: 'color .6s ease'
        }}
      >
        KHALIL // {year} //
      </span>
    </footer>
  );
};
