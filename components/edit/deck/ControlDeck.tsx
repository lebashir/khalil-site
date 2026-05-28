'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GamingThemeSettings, Mode, Mood, NowBlock, SiteContent } from '@/lib/content';
import type { VideoItem } from '@/lib/youtube';
import type { ChannelStats } from '@/lib/youtube-channel';
import { playPlunger } from '@/lib/audio/sounds';
import { ED, FONT, type FuseId, type PayloadId } from './constants';
import { TopBar, type DeckTab } from './TopBar';
import { LaunchWindow } from './LaunchWindow';
import { MessageLauncher } from './MessageLauncher';
import { Panel } from './primitives';
import { StatusModule } from './modules/StatusModule';
import { SubsModule } from './modules/SubsModule';
import { HeroTagsModule } from './modules/HeroTagsModule';
import { NowPlayingModule } from './modules/NowPlayingModule';
import { PinnedVideoModule } from './modules/PinnedVideoModule';
import { ThemeModule } from './modules/ThemeModule';
import { YouTubeIntelModule } from './modules/YouTubeIntelModule';
import { InlineEditView } from './inline/InlineEditView';

interface ControlDeckProps {
  initialContent: SiteContent;
  videos: VideoItem[];
  channelStats: ChannelStats | null;
}

const SAVE_TOAST_MS = 5000;
const LAUNCH_ANIM_MS = 1500;
const SAVE_URL = '/api/edit/save';
const LOGOUT_URL = '/api/edit/logout';
const ANNOUNCE_URL = '/api/edit/announcement';

const FUSE_TOAST: Record<FuseId, string> = {
  now: 'Visitors see it within ~15 seconds.',
  visit: 'First-time visitors will see it (next 24h).',
  refresh: 'Shows on every reload for the next hour.',
  '1h': 'Scheduled for 1 hour from now.'
};

interface Viewport {
  isPhone: boolean;
  isDesktop: boolean;
}

// SSR-safe viewport tracking: start with desktop defaults so the server-
// rendered HTML matches. After mount we measure and rerender.
const useViewport = (): Viewport => {
  const [vp, setVp] = useState<Viewport>({ isPhone: false, isDesktop: true });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVp({ isPhone: w < 640, isDesktop: w >= 1024 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return vp;
};

// The /edit experience root. Owns content state, save flow, the two tabs.
//
// Tab split (one home per field — see docs/HANDOFF_THEMES_CC.md +
// the reorg conversation):
//   MISSION CONTROL — broadcast deck + live status (what's happening now)
//   ON-SITE EDITOR  — site content + identity (what the site IS)
//
// Save posts the full SiteContent JSON to /api/edit/save so the API
// contract is unchanged regardless of which tab made the edits.
export const ControlDeck = ({ initialContent, videos, channelStats }: ControlDeckProps) => {
  const { isPhone, isDesktop } = useViewport();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [mode, setMode] = useState<Mode>(initialContent.defaultMode);
  // Default lands on the launch deck — that's the primary mission-control
  // experience. The inline editor is one tab over.
  const [tab, setTab] = useState<DeckTab>('deck');

  // Save flow
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Message launcher state
  const [msg, setMsg] = useState('');
  const [payload, setPayload] = useState<PayloadId>('confetti');
  const [fuse, setFuse] = useState<FuseId>('now');
  const [launching, setLaunching] = useState(false);
  const [launchNonce, setLaunchNonce] = useState(0);

  // Ref for the LaunchWindow's wrapper — used on mobile/tablet to scroll
  // the CRT into view when the user fires, so they always see the burst.
  const crtRef = useRef<HTMLDivElement | null>(null);

  const onSave = useCallback(async () => {
    setSaving(true);
    setErrors([]);
    setToast(null);
    try {
      const res = await fetch(SAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      const data = (await res.json()) as { ok: boolean; errors?: string[] };
      if (data.ok) {
        setToast('Saved — the site rebuilds in about a minute.');
        window.setTimeout(() => setToast(null), SAVE_TOAST_MS);
      } else {
        setErrors(data.errors ?? ['Save failed.']);
      }
    } catch {
      setErrors(['Network error — your changes are still here, try Save again.']);
    } finally {
      setSaving(false);
    }
  }, [content]);

  const onExit = useCallback(async () => {
    try {
      await fetch(LOGOUT_URL, { method: 'POST' });
    } catch {
      // Ignore — even if logout failed we still want to bounce to login
    }
    window.location.href = '/edit';
  }, []);

  const onFire = useCallback(async () => {
    if (launching || !msg.trim()) return;
    setLaunching(true);
    setErrors([]);
    setToast(null);
    // Plunger sound fires first; the LaunchWindow useEffect plays the
    // matching payload sound when launchNonce bumps a beat later.
    playPlunger();
    // On mobile/tablet the CRT and the plunger don't both fit on screen,
    // so we scroll the CRT into view first and delay the visual burst
    // until the scroll has had a beat to settle.
    const needsScroll = !isDesktop && crtRef.current !== null;
    if (needsScroll) {
      crtRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const burstDelay = needsScroll ? 380 : 0;
    window.setTimeout(() => setLaunchNonce((n) => n + 1), burstDelay);
    try {
      const res = await fetch(ANNOUNCE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, payload, fuse })
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setToast(`Launched — ${FUSE_TOAST[fuse]}`);
        window.setTimeout(() => setToast(null), SAVE_TOAST_MS);
      } else {
        setErrors([data.error ?? 'Launch failed.']);
      }
    } catch {
      setErrors(['Network error — your message is still here, try Launch again.']);
    } finally {
      window.setTimeout(() => {
        setLaunching(false);
        // Intentionally keep `msg` so it can be re-fired with a different
        // payload or fuse without retyping.
      }, LAUNCH_ANIM_MS);
    }
  }, [launching, msg, payload, fuse, isDesktop]);

  // Setters used by MISSION CONTROL only (live/now fields). On-site
  // editor uses setContent directly and computes its own setters
  // locally — it doesn't share with this tab.
  const setMood = (mood: Mood) => setContent({ ...content, mood });
  const setSubs = (subs: SiteContent['subs']) => setContent({ ...content, subs });
  const setNow = (now: NowBlock) =>
    setContent({ ...content, now: { ...content.now, [mode]: now } });
  const setPinnedId = (pinnedId: string | null) =>
    setContent({ ...content, videos: { ...content.videos, pinnedId } });
  const setThemeSettings = (gaming: GamingThemeSettings) =>
    setContent({
      ...content,
      theme: { ...(content.theme ?? {}), gaming }
    });

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: ED.bg,
        backgroundImage: `
          radial-gradient(ellipse at 50% -10%, ${ED.amber}11, transparent 60%),
          linear-gradient(180deg, ${ED.bgGrid}, ${ED.bg} 40%)
        `,
        color: ED.ink
      }}
    >
      <TopBar
        tab={tab}
        setTab={setTab}
        onSave={onSave}
        onExit={onExit}
        saving={saving}
        isPhone={isPhone}
      />
      <main
        style={{
          padding: isPhone ? '14px 12px 80px' : '20px 20px 80px',
          maxWidth: 1400,
          margin: '0 auto'
        }}
      >
        {tab === 'inline' ? (
          <InlineEditView
            mode={mode}
            setMode={setMode}
            content={content}
            setContent={setContent}
            videos={videos}
          />
        ) : (
          <LaunchTab
            mode={mode}
            setMode={setMode}
            content={content}
            videos={videos}
            msg={msg}
            setMsg={setMsg}
            payload={payload}
            setPayload={setPayload}
            fuse={fuse}
            setFuse={setFuse}
            launching={launching}
            launchNonce={launchNonce}
            onFire={onFire}
            isPhone={isPhone}
            isDesktop={isDesktop}
            setMood={setMood}
            setSubs={setSubs}
            setNow={setNow}
            setPinnedId={setPinnedId}
            setThemeSettings={setThemeSettings}
            crtRef={crtRef}
            channelStats={channelStats}
            setContent={setContent}
          />
        )}
      </main>

      {/* Floating banners */}
      {(toast || errors.length > 0) && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 60,
            pointerEvents: 'none'
          }}
        >
          {toast && (
            <div
              role="status"
              style={{
                pointerEvents: 'auto',
                maxWidth: 520,
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.85)',
                border: `1px solid ${ED.green}`,
                borderRadius: 4,
                fontFamily: FONT.mono,
                fontSize: 11,
                letterSpacing: 1.2,
                color: ED.green,
                boxShadow: `0 0 24px ${ED.green}55`
              }}
            >
              ✓ {toast}
            </div>
          )}
          {errors.length > 0 && (
            <div
              role="alert"
              style={{
                pointerEvents: 'auto',
                maxWidth: 520,
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.85)',
                border: `1px solid ${ED.red}`,
                borderRadius: 4,
                fontFamily: FONT.mono,
                fontSize: 11,
                letterSpacing: 1.1,
                color: ED.red,
                boxShadow: `0 0 24px ${ED.red}55`,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ fontWeight: 700 }}>SAVE BLOCKED · fix below:</div>
              {errors.map((err, i) => (
                <div key={i}>· {err}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── LaunchTab (MISSION CONTROL) — broadcast deck + live status ────────────
//
// Five modules + the message launcher. Everything here changes session-
// to-session: what you're doing right now (NOW), your current mood, your
// sub count, the video you want featured, the theme vibe, and any
// announcement you want to broadcast.
//
// Anything that defines the SITE (handle, hero copy, stats, about, book,
// images, socials, boot mode, replay style) lives in ON-SITE EDITOR.

interface LaunchTabProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  content: SiteContent;
  videos: VideoItem[];
  msg: string;
  setMsg: (m: string) => void;
  payload: PayloadId;
  setPayload: (p: PayloadId) => void;
  fuse: FuseId;
  setFuse: (f: FuseId) => void;
  launching: boolean;
  launchNonce: number;
  onFire: () => void;
  isPhone: boolean;
  isDesktop: boolean;
  setMood: (m: Mood) => void;
  setSubs: (s: SiteContent['subs']) => void;
  setNow: (n: NowBlock) => void;
  setPinnedId: (id: string | null) => void;
  setThemeSettings: (t: GamingThemeSettings) => void;
  crtRef: React.RefObject<HTMLDivElement | null>;
  channelStats: ChannelStats | null;
  setContent: (next: SiteContent) => void;
}

const LaunchTab = ({
  mode,
  setMode,
  content,
  videos,
  msg,
  setMsg,
  payload,
  setPayload,
  fuse,
  setFuse,
  launching,
  launchNonce,
  onFire,
  isPhone,
  isDesktop,
  setMood,
  setSubs,
  setNow,
  setPinnedId,
  setThemeSettings,
  crtRef,
  channelStats,
  setContent
}: LaunchTabProps) => {
  // Reusable nodes — same instances rendered in either layout
  const launchWindow = (
    <div ref={crtRef}>
      <LaunchWindow
        mode={mode}
        setMode={setMode}
        msg={msg}
        payload={payload}
        launchNonce={launchNonce}
        launching={launching}
        isPhone={isPhone}
        isDesktop={isDesktop}
      />
    </div>
  );
  const messageLauncher = (
    <MessageLauncher
      msg={msg}
      setMsg={setMsg}
      payload={payload}
      setPayload={setPayload}
      fuse={fuse}
      setFuse={setFuse}
      onFire={onFire}
      launching={launching}
      isPhone={isPhone}
      isDesktop={isDesktop}
    />
  );
  const liveStatusPanel = (
    <Panel title="LIVE STATUS" kicker="// goes out next save" accent={ED.green}>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr'
        }}
      >
        <StatusModule hideHeader mood={content.mood} setMood={setMood} />
        <SubsModule hideHeader subs={content.subs} setSubs={setSubs} />
      </div>
    </Panel>
  );
  const heroTagsPanel = (
    <HeroTagsModule
      content={content}
      setContent={setContent}
      channelStats={channelStats}
      videos={videos}
    />
  );
  const nowPlaying = (
    <NowPlayingModule mode={mode} now={content.now[mode]} setNow={setNow} />
  );
  const pinnedVideo = (
    <PinnedVideoModule
      videos={videos}
      pinnedId={content.videos.pinnedId}
      setPinnedId={setPinnedId}
    />
  );
  const themePicker = (
    <ThemeModule theme={content.theme?.gaming} setTheme={setThemeSettings} />
  );
  const youTubeIntel = (
    <YouTubeIntelModule initial={channelStats} />
  );

  // Mobile / tablet: linear stack. The CRT-then-launcher pairing stays
  // adjacent so the user sees the burst as soon as they fire (autoscroll
  // in onFire handles the case where they've scrolled past the CRT).
  if (!isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {launchWindow}
        {messageLauncher}
        {youTubeIntel}
        {liveStatusPanel}
        {heroTagsPanel}
        {nowPlaying}
        {pinnedVideo}
        {themePicker}
      </div>
    );
  }

  // Desktop: two columns. CRT + live state on the left, launcher + the
  // session knobs on the right. Roughly balanced module counts.
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1.15fr 1fr' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        {launchWindow}
        {liveStatusPanel}
        {heroTagsPanel}
        {nowPlaying}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        {messageLauncher}
        {youTubeIntel}
        {pinnedVideo}
        {themePicker}
      </div>
    </div>
  );
};
