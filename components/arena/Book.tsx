'use client';

import type { SiteContent } from '@/lib/content';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import { Reveal } from './Reveal';
import { HudCard } from './HudCard';
import { HudLabel } from './HudLabel';
import { Stamp } from './Stamp';

interface Props {
  book: SiteContent['book'];
  theme: ArenaTheme;
  size: ArenaSize;
  /** Optional uploaded cover photo. Layered on top of the gradient
   *  cover when present so a real cover replaces the gradient. */
  coverPhotoUrl?: string | null;
}

export const Book = ({ book, theme, size, coverPhotoUrl }: Props) => {
  if (!book.visible) return null;
  const isDesktop = size === 'desktop';
  const hasCoverPhoto = Boolean(coverPhotoUrl);
  return (
    <section id="book" style={{ padding: isDesktop ? '32px 64px 32px' : '4px 14px 16px' }}>
      <Reveal>
        <HudCard theme={theme} style={{ padding: isDesktop ? 32 : 16 }}>
          <HudLabel theme={theme}>UNLOCK · {book.chapter.toUpperCase()}</HudLabel>
          <div
            style={{
              position: 'relative',
              marginTop: 12,
              background: '#fef9e6',
              padding: isDesktop ? '28px 32px' : '20px 14px',
              borderRadius: 4,
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), 0 14px 28px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              transform: 'rotate(-0.4deg)'
            }}
          >
            {/* Notebook lines */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent 0 24px, rgba(100,80,40,0.18) 24px 25px)',
                pointerEvents: 'none'
              }}
            />
            {/* Red margin line */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: isDesktop ? 60 : 36,
                width: 1,
                background: '#d44545',
                opacity: 0.45
              }}
            />
            {/* Torn paper holes on the left edge */}
            {[0.18, 0.5, 0.82].map((y, i) => (
              <span
                key={i}
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 14,
                  top: `${y * 100}%`,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#0a0420',
                  boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.6)'
                }}
              />
            ))}
            {/* Tape diagonals */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: -10,
                right: 24,
                width: 70,
                height: 22,
                background: 'rgba(126,198,194,0.65)',
                transform: 'rotate(8deg)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute',
                bottom: -10,
                left: '38%',
                width: 60,
                height: 18,
                background: 'rgba(255,184,184,0.65)',
                transform: 'rotate(-6deg)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}
            />

            <div
              style={{
                position: 'relative',
                paddingLeft: isDesktop ? 60 : 44,
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                gap: isDesktop ? 28 : 14,
                alignItems: isDesktop ? 'center' : 'flex-start'
              }}
            >
              {/* The book itself — chunky, with a real spine + raised cover */}
              <div
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  width: isDesktop ? 200 : 100,
                  height: isDesktop ? 280 : 138,
                  transform: 'rotate(-5deg)'
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#f5ecd3',
                    transform: 'translate(6px, 6px)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)'
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#ede1c2',
                    transform: 'translate(3px, 3px)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)'
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '2px 6px 6px 2px',
                    // Custom uploaded photo (when present) replaces the
                    // gradient cover. Image is layered as a real
                    // background-image so the title text on top stays
                    // legible against a subtle dark overlay.
                    background: hasCoverPhoto
                      ? `linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${coverPhotoUrl}) center/cover`
                      : `linear-gradient(135deg, ${theme.coverA} 0%, ${theme.coverB} 100%)`,
                    boxShadow: `-12px 14px 30px rgba(0,0,0,0.5), inset 4px 0 0 rgba(0,0,0,0.45), 0 0 30px ${theme.accent}50`,
                    padding: isDesktop ? 20 : 11,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    transition: 'background .6s ease, box-shadow .6s ease'
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `radial-gradient(circle, ${theme.accent}40 1px, transparent 1.5px)`,
                      backgroundSize: '6px 6px',
                      opacity: 0.4,
                      mixBlendMode: 'screen'
                    }}
                  />
                  <div
                    style={{
                      position: 'relative',
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      fontSize: isDesktop ? 10 : 7,
                      color: theme.accent,
                      letterSpacing: 2
                    }}
                  >
                    VOL.1 · GRANDMA + KHALIL
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      fontFamily: "'Anton', 'Bungee', sans-serif",
                      fontSize: isDesktop ? 32 : 15,
                      color: '#fff',
                      lineHeight: 0.95,
                      letterSpacing: -0.5,
                      textTransform: 'uppercase'
                    }}
                  >
                    {book.title}
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: isDesktop ? 11 : 8,
                      color: 'rgba(255,255,255,0.6)',
                      letterSpacing: 1
                    }}
                  >
                    A KID'S BOOK<br />ABOUT EVERYTHING
                  </div>
                </div>
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: 18,
                    width: 12,
                    height: isDesktop ? 100 : 60,
                    background: '#d44545',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                  }}
                />
              </div>

              {/* Right column — handwritten title + blurb + stamps */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Permanent Marker', 'Caveat', cursive",
                    fontSize: isDesktop ? 60 : 36,
                    color: '#1a1310',
                    lineHeight: 0.9,
                    letterSpacing: -1,
                    textShadow: '0 1px 0 rgba(0,0,0,0.1)',
                    transform: 'rotate(-1deg)'
                  }}
                >
                  writing
                  <br />
                  <span
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${theme.coverA} 0%, ${theme.coverB} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      transition: 'background .6s ease'
                    }}
                  >
                    a book.
                  </span>
                </div>
                <p
                  style={{
                    margin: '14px 0 0',
                    fontFamily: "'Caveat', 'Bradley Hand', cursive",
                    fontSize: isDesktop ? 22 : 15,
                    color: '#3a2a14',
                    lineHeight: 1.25,
                    maxWidth: isDesktop ? 460 : 'none',
                    fontWeight: 600
                  }}
                >
                  {book.subtitle}
                </p>
                <svg
                  viewBox="0 0 200 12"
                  style={{ width: '60%', height: isDesktop ? 12 : 8, marginTop: 6, opacity: 0.7 }}
                  aria-hidden
                >
                  <path
                    d="M2 6 Q 30 -2, 60 6 T 120 6 T 198 6"
                    fill="none"
                    stroke="#d44545"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: isDesktop ? 'row' : 'column',
                    gap: isDesktop ? 10 : 6,
                    flexWrap: 'wrap',
                    alignItems: isDesktop ? 'center' : 'flex-start'
                  }}
                >
                  <Stamp text={book.chapter.toUpperCase()} color="#3a8a4a" />
                  <Stamp text={book.status.toUpperCase()} color="#d44545" rot={2} />
                  <Stamp text="SIGNED COPIES" color="#1a3a8a" rot={-3} />
                </div>
              </div>
            </div>
          </div>
        </HudCard>
      </Reveal>
    </section>
  );
};
