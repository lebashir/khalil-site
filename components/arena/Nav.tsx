'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { ArenaTheme } from './theme';
import type { ArenaSize } from './useArenaSize';
import type { Mood } from '@/lib/content';

interface Props {
  theme: ArenaTheme;
  size: ArenaSize;
  mood: Mood;
}

const SECRET_TAP_COUNT = 5;
const SECRET_TAP_WINDOW_MS = 3000;

const MOOD_LABEL: Record<Mood, string> = {
  'online': '● ONLINE',
  'on-fire': '🔥 ON FIRE',
  'streaming': '◉ STREAMING',
  'in-school': '◔ IN SCHOOL',
  'sleeping': '☾ SLEEPING'
};

// Sticky page nav. Sits below the TopBarMode. K-logo doubles as the secret
// entry point to the editor: five taps within three seconds → push /edit.
export const Nav = ({ theme, size, mood }: Props) => {
  const isPhone = size === 'phone';
  const isDesktop = size === 'desktop';
  const router = useRouter();
  const taps = useRef<{ count: number; firstAt: number }>({ count: 0, firstAt: 0 });

  const onLogoTap = () => {
    const now = performance.now();
    const state = taps.current;
    if (state.count === 0 || now - state.firstAt > SECRET_TAP_WINDOW_MS) {
      taps.current = { count: 1, firstAt: now };
      return;
    }
    state.count += 1;
    if (state.count >= SECRET_TAP_COUNT) {
      taps.current = { count: 0, firstAt: 0 };
      router.push('/edit');
    }
  };

  const links = isDesktop ? ['REPLAYS', 'PROFILE', 'BOOK', 'SUBS'] : ['REPLAYS', 'BOOK', 'SUBS'];
  const anchors: Record<string, string> = {
    REPLAYS: '#replays',
    PROFILE: '#about',
    BOOK: '#book',
    SUBS: '#subs'
  };

  return (
    <nav
      aria-label="Page navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        padding: isPhone ? '14px 14px 8px' : isDesktop ? '16px 64px' : '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={onLogoTap}
          aria-label="Khalil"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isDesktop ? 40 : 30,
            height: isDesktop ? 40 : 30,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: theme.bgA,
            fontFamily: "'Anton', sans-serif",
            fontSize: isDesktop ? 22 : 18,
            fontWeight: 400,
            boxShadow: `0 0 14px ${theme.accent}80`,
            transition: 'background .6s ease, box-shadow .6s ease',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          K
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              color: theme.fg,
              fontSize: isDesktop ? 22 : 16,
              lineHeight: 1,
              letterSpacing: 1
            }}
          >
            KHALIL
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              color: theme.accent,
              fontSize: isDesktop ? 11 : 9,
              letterSpacing: 1.5,
              marginTop: 1,
              transition: 'color .6s ease'
            }}
          >
            {MOOD_LABEL[mood]}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: isDesktop ? 24 : 14,
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: isDesktop ? 12 : 10,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.7)'
        }}
      >
        {links.map((l) => (
          <a key={l} href={anchors[l] ?? '#'} style={{ color: 'inherit', textDecoration: 'none' }}>
            {l}
          </a>
        ))}
      </div>
    </nav>
  );
};
