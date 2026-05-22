'use client';

import { useGamingTheme } from '@/components/GamingThemeProvider';
import {
  GAMING_THEMES,
  GAMING_THEME_ORDER,
  DEFAULT_GAMING_THEME,
  isGamingThemeKey,
  isLightGamingTheme,
  type GamingThemeKey
} from '@/lib/gaming-themes';
import type { GamingThemeSettings } from '@/lib/content';
import { ED, FONT } from '../constants';
import { Panel } from '../primitives';

interface Props {
  theme: GamingThemeSettings | undefined;
  setTheme: (next: GamingThemeSettings) => void;
}

type ThemeMode = 'fixed' | 'random' | 'shuffle';

const DEFAULT_SETTINGS: GamingThemeSettings = {
  mode: 'fixed',
  fixedKey: DEFAULT_GAMING_THEME,
  pool: []
};

// Normalize the settings — coerce missing-or-stale values so the rest
// of the module can rely on shape and key validity. Any pool entry that
// no longer matches a theme in the registry gets dropped (so removing
// a theme from the registry is automatically reflected here).
const normalize = (raw: GamingThemeSettings | undefined): GamingThemeSettings => {
  const src = raw ?? DEFAULT_SETTINGS;
  const fixedKey = isGamingThemeKey(src.fixedKey) ? src.fixedKey : DEFAULT_GAMING_THEME;
  const pool = (src.pool ?? []).filter(isGamingThemeKey);
  const mode: ThemeMode =
    src.mode === 'random' ? 'random' : src.mode === 'shuffle' ? 'shuffle' : 'fixed';
  return { mode, fixedKey, pool };
};

// Theme picker for /edit. Two responsibilities:
//   1. Preview a theme locally (writes localStorage via useGamingTheme,
//      so Khalil's browser repaints immediately)
//   2. Stage published settings — the next SAVE writes them to
//      content.json so all visitors see the chosen theme (or get a
//      random pick from the chosen pool).
//
// Picking a theme in either mode also sets the local preview to that
// theme — Khalil sees what visitors will see.
export const ThemeModule = ({ theme, setTheme }: Props) => {
  const settings = normalize(theme);
  const { themeKey: localPreview, setThemeKey, clearLocalOverride } = useGamingTheme();

  const setMode = (next: ThemeMode) => {
    setTheme({ ...settings, mode: next });
  };

  const setFixed = (k: GamingThemeKey) => {
    setTheme({ ...settings, fixedKey: k });
    setThemeKey(k);
  };

  const togglePool = (k: GamingThemeKey) => {
    const has = settings.pool.includes(k);
    const nextPool = has ? settings.pool.filter((p) => p !== k) : [...settings.pool, k];
    setTheme({ ...settings, pool: nextPool });
    // Always preview the clicked theme — even if we're removing it from
    // the pool, the click is a clear intent to look at it.
    setThemeKey(k);
  };

  const previewOnly = (k: GamingThemeKey) => setThemeKey(k);

  const isFixed = settings.mode === 'fixed';
  const isRandom = settings.mode === 'random';
  const isShuffle = settings.mode === 'shuffle';
  const usesPool = isRandom || isShuffle;
  const poolEmpty = usesPool && settings.pool.length === 0;

  return (
    <Panel title="THEME · GAMING" kicker="// picks the gaming-mode palette for visitors" accent={ED.pink}>
      {/* Mode toggle — three rows wrap nicely on phone, render side by side on desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 6,
          marginBottom: 14
        }}
      >
        <ModeBtn active={isFixed} color={ED.green} onClick={() => setMode('fixed')}>
          ◇ FIXED
          <Sub>everyone sees one theme</Sub>
        </ModeBtn>
        <ModeBtn active={isRandom} color={ED.pink} onClick={() => setMode('random')}>
          ◇ RANDOM
          <Sub>new pick on every refresh</Sub>
        </ModeBtn>
        <ModeBtn active={isShuffle} color={ED.amber} onClick={() => setMode('shuffle')}>
          ◇ SHUFFLE
          <Sub>each visitor keeps their pick</Sub>
        </ModeBtn>
      </div>

      {/* Pool warning */}
      {poolEmpty && (
        <div
          style={{
            padding: '8px 12px',
            background: `${ED.red}15`,
            border: `1px solid ${ED.red}`,
            borderRadius: 3,
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: 1.2,
            color: ED.red,
            marginBottom: 12,
            textTransform: 'uppercase'
          }}
        >
          ⚠ pick at least one theme below — until then, visitors see "{settings.fixedKey}"
        </div>
      )}

      {/* Theme tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 8
        }}
      >
        {GAMING_THEME_ORDER.map((key) => {
          const t = GAMING_THEMES[key]!;
          // FIXED mode picks one. RANDOM and SHUFFLE both build a pool.
          const selected = usesPool ? settings.pool.includes(key) : key === settings.fixedKey;
          const previewing = localPreview === key;
          const isLight = isLightGamingTheme(t);
          return (
            <button
              key={key}
              type="button"
              onClick={() => (usesPool ? togglePool(key) : setFixed(key))}
              onMouseEnter={() => {
                // Hover-to-preview only — actual click commits and persists.
                if (localPreview !== key) previewOnly(key);
              }}
              style={{
                position: 'relative',
                padding: '12px 12px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                background: `linear-gradient(135deg, ${t.bgC} 0%, ${t.bgB} 50%, ${t.bgA} 100%)`,
                border: selected ? `2px solid ${t.accent}` : `1px solid ${ED.line}`,
                borderRadius: 4,
                color: t.fg,
                boxShadow: previewing
                  ? `0 0 18px ${t.accent}80, inset 0 0 30px ${t.accent}20`
                  : selected
                    ? `0 0 12px ${t.accent}50`
                    : 'none',
                transition: 'all .15s ease'
              }}
            >
              <div
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 18,
                  letterSpacing: 1.2,
                  lineHeight: 1
                }}
              >
                {t.name}
              </div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  letterSpacing: 1.4,
                  color: t.accent,
                  marginTop: 4,
                  textTransform: 'uppercase'
                }}
              >
                {t.tagline}
              </div>
              {/* Swatch row */}
              <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                {[t.accent, t.accent2, t.accent3].map((c, i) => (
                  <span
                    key={i}
                    aria-hidden
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: c,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)'
                    }}
                  />
                ))}
                {isLight && (
                  <span
                    aria-hidden
                    title="light theme"
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: t.bgC,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4)',
                      marginLeft: 'auto',
                      fontSize: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: t.fg
                    }}
                  >
                    ☀
                  </span>
                )}
              </div>
              {selected && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 6,
                    fontFamily: FONT.mono,
                    fontSize: 9,
                    letterSpacing: 1,
                    color: t.accent,
                    background: 'rgba(0,0,0,0.7)',
                    padding: '1px 5px',
                    borderRadius: 2
                  }}
                >
                  {usesPool ? '✓ POOL' : '◆ ACTIVE'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Helper row */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${ED.line}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: 1.2,
            color: ED.inkDim,
            textTransform: 'uppercase'
          }}
        >
          previewing: <span style={{ color: ED.amber }}>{localPreview}</span>
          {' · '}
          published: <span style={{ color: ED.green }}>
            {usesPool
              ? settings.pool.length > 0
                ? `${settings.mode} (${settings.pool.length})`
                : `${settings.fixedKey} · pool empty`
              : settings.fixedKey}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            // Reset Khalil's local override so HE sees what visitors see
            // (the published theme). Useful to sanity-check the published
            // setting after iterating in preview.
            clearLocalOverride();
            // Update local preview state to match published immediately.
            // For RANDOM / SHUFFLE we can't predict the visitor's roll,
            // so we show the first pool entry as a representative pick.
            const target =
              usesPool && settings.pool.length > 0
                ? settings.pool[0]!
                : settings.fixedKey;
            if (isGamingThemeKey(target)) setThemeKey(target);
          }}
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: 1.4,
            color: ED.amber,
            background: 'transparent',
            border: `1px solid ${ED.amber}66`,
            padding: '4px 10px',
            borderRadius: 3,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          👁 view as visitor
        </button>
      </div>
    </Panel>
  );
};

// ── small atoms ────────────────────────────────────────────────────

interface ModeBtnProps {
  active: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}

const ModeBtn = ({ active, color, onClick, children }: ModeBtnProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: '10px 12px',
      background: active ? `${color}1f` : 'rgba(0,0,0,0.4)',
      border: `1px solid ${active ? color : ED.line}`,
      borderRadius: 3,
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: FONT.mono,
      fontSize: 11,
      letterSpacing: 1.5,
      fontWeight: 700,
      color: active ? color : ED.ink,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      textTransform: 'uppercase'
    }}
  >
    {children}
  </button>
);

const Sub = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontFamily: FONT.mono,
      fontSize: 9,
      letterSpacing: 1,
      color: ED.inkDim,
      fontWeight: 400,
      textTransform: 'uppercase'
    }}
  >
    {children}
  </span>
);
