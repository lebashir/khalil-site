'use client';

import { useEffect } from 'react';
import { Burst } from '@/components/edit/deck/Burst';
import { PAYLOADS } from '@/components/edit/deck/constants';
import { useAnnouncement } from './useAnnouncement';

// Auto-dismiss for non-refresh fuses. 'refresh' stays until page reload
// or manual close — that's the whole point of that fuse type.
const AUTO_DISMISS_MS = 7000;

export const AnnouncementOverlay = () => {
  const { announcement, dismiss } = useAnnouncement();

  useEffect(() => {
    if (!announcement) return;
    if (announcement.fuse === 'refresh') return;
    const id = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [announcement, dismiss]);

  if (!announcement) return null;

  const payload =
    PAYLOADS.find((p) => p.id === announcement.payload) ?? PAYLOADS[0]!;

  return (
    <div
      role="dialog"
      aria-label="Announcement from Khalil"
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.62)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        cursor: 'pointer'
      }}
    >
      {/* Particle burst — centered, big spread */}
      <Burst
        key={`burst-${announcement.id}`}
        x={0.5}
        y={0.5}
        count={96}
        kind={payload.kind}
        durationMs={1800}
        spread={520}
      />

      {/* Shock ring */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 260,
          height: 260,
          borderRadius: '50%',
          border: `4px solid ${payload.color}`,
          boxShadow: `0 0 70px ${payload.color}, inset 0 0 40px ${payload.color}66`,
          animation: 'ed-shock-ring 900ms ease-out forwards',
          pointerEvents: 'none'
        }}
      />

      {/* Payload emoji floats above the stamp */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: 'calc(50% - clamp(70px, 12vw, 140px))',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(40px, 8vw, 80px)',
          filter: `drop-shadow(0 0 24px ${payload.color})`,
          animation: 'ed-msg-stamp .9s cubic-bezier(.2,1.4,.4,1) both',
          pointerEvents: 'none'
        }}
      >
        {payload.emoji}
      </div>

      {/* Message stamp — the headline */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: 'min(90vw, 800px)',
          textAlign: 'center',
          fontFamily: "'Bungee', 'Anton', sans-serif",
          fontSize: 'clamp(38px, 7vw, 88px)',
          letterSpacing: 1,
          lineHeight: 1,
          textTransform: 'uppercase',
          color: '#fff',
          textShadow: `0 0 36px ${payload.color}, 0 4px 0 rgba(0,0,0,0.55), 0 0 80px ${payload.color}88`,
          animation: 'ed-msg-stamp .7s cubic-bezier(.2,1.4,.4,1) both',
          pointerEvents: 'none',
          padding: '0 24px'
        }}
      >
        {announcement.message}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top))',
          right: 'max(16px, env(safe-area-inset-right))',
          width: 44,
          height: 44,
          padding: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: 999,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 22,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)'
        }}
      >
        ×
      </button>

      {/* Tap hint */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 'max(20px, env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: "'DM Mono', ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
          pointerEvents: 'none'
        }}
      >
        tap anywhere to dismiss
      </div>
    </div>
  );
};
