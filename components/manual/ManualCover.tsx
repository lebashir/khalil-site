'use client';

import type { Mode, SiteContent } from '@/lib/content';
import type { ArenaTheme } from '@/components/arena/theme';
import type { ArenaSize } from '@/components/arena/useArenaSize';
import { CardEmblem } from '@/components/arena/cards/CardEmblem';
import { CardPortrait } from '@/components/arena/cards/CardPortrait';
import { CardNote } from '@/components/arena/cards/CardNote';

interface Props {
  mode: Mode;
  theme: ArenaTheme;
  size: ArenaSize;
  content: SiteContent;
}

// Cover panel — left column is the title block + lede + CTAs, right
// column is a polaroid stack reusing the same arena cards (so it stays
// visually consistent and re-themes on mode flip). Subscribers come
// from content.json so the cover stays personalized as Khalil grows.
export const ManualCover = ({ mode, theme, size, content }: Props) => {
  const isPhone = size === 'phone';
  const isDesktop = size === 'desktop';

  const portraitPhotoUrl = content.images[`portrait-${mode}`] ?? null;
  const subsCurrent = content.subs.current.toLocaleString();
  const cardSize = isDesktop ? { w: 200, h: 250 } : { w: 160, h: 200 };

  const note =
    mode === 'gaming'
      ? "yo this is\nyour manual.\nread it once."
      : "yo this is\nyour manual.\nkeep it close.";

  return (
    <section
      style={{
        padding: isPhone ? '40px 0 20px' : '60px 0 40px',
        display: 'grid',
        gridTemplateColumns: size === 'desktop' ? '1fr 380px' : '1fr',
        gap: 40,
        alignItems: 'center'
      }}
    >
      {/* Left column — title + lede + CTAs */}
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            border: `1px solid ${theme.accent}`,
            borderRadius: 4,
            color: theme.accent,
            marginBottom: 14,
            boxShadow: `0 0 12px ${theme.accent}`,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: 1.4,
            textTransform: 'uppercase'
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.accent,
              boxShadow: `0 0 8px ${theme.accent}`,
              animation: 'tb-blink-led 2s ease-in-out infinite'
            }}
          />
          KHALIL.OPS · v1.0 · CLEARANCE: ∞
        </span>

        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: isPhone ? 78 : isDesktop ? 120 : 96,
            lineHeight: 0.86,
            letterSpacing: -2,
            margin: 0,
            color: theme.fg,
            textShadow: `0 0 32px ${theme.accent}, 0 4px 24px rgba(0,0,0,0.7)`
          }}
        >
          KHALIL
        </h1>
        <h2
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: isPhone ? 56 : isDesktop ? 84 : 68,
            lineHeight: 0.86,
            letterSpacing: -1,
            margin: 0,
            background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            filter: `drop-shadow(0 0 18px ${theme.accent})`
          }}
        >
          OPERATOR MANUAL
        </h2>

        <p
          style={{
            margin: '24px 0 26px',
            fontSize: 18,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.78)',
            maxWidth: 540,
            fontFamily: "'Inter', system-ui, sans-serif"
          }}
        >
          yo khalil. this is the manual for your own site. read it once,
          then keep it around for when you forget what a button does.
          every part ends with a <strong style={{ color: theme.fg }}>tl;dr</strong>{' '}
          so you can skim if you're in a hurry.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="#part-1"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 22,
              letterSpacing: 1,
              padding: '16px 28px',
              color: '#0a0420',
              background: `linear-gradient(180deg, ${theme.ctaA} 0%, ${theme.ctaB} 100%)`,
              clipPath:
                'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
              boxShadow: `0 0 24px ${theme.ctaA}80`,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform .15s ease'
            }}
          >
            ▶ START READING
          </a>
          <a
            href="/"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 22,
              letterSpacing: 1,
              padding: '16px 28px',
              color: theme.fg,
              background: 'transparent',
              border: `1.5px solid ${theme.accent}`,
              boxShadow: 'none',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            OPEN MY SITE →
          </a>
        </div>
      </div>

      {/* Right column — polaroid stack. Reuses the arena Card primitives
          so visual / motion stays consistent with the homepage hero. */}
      {size !== 'phone' && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 460,
            perspective: '800px'
          }}
        >
          <CardEmblem
            label="JERSEY"
            sub={`RANK · ${theme.role3.toUpperCase()}`}
            mode={mode}
            theme={theme}
            size={size}
            style={{
              width: cardSize.w,
              height: cardSize.h,
              top: 10,
              left: 0,
              zIndex: 1
            }}
            rotate={-9}
            bobDelay={-0.3}
          />
          <CardPortrait
            icon={mode === 'gaming' ? '🎮' : '⚽'}
            label="KHALIL"
            sub={`${subsCurrent} SUBS · ONLINE`}
            mode={mode}
            theme={theme}
            size={size}
            photoUrl={portraitPhotoUrl}
            style={{
              width: cardSize.w,
              height: cardSize.h,
              top: 70,
              left: 110,
              zIndex: 2
            }}
            rotate={7}
            bobDelay={-2.1}
          />
          <CardNote
            text={note}
            theme={theme}
            size={size}
            style={{
              width: cardSize.w * 0.85,
              height: cardSize.h * 0.55,
              top: 280,
              left: 40,
              zIndex: 3
            }}
            rotate={-4}
            bobDelay={-3.8}
          />
        </div>
      )}
    </section>
  );
};
