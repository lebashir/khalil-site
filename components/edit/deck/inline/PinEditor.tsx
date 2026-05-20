'use client';

import { useEffect, type ReactNode } from 'react';
import { ED, FONT } from '../constants';

interface PinEditorProps {
  open: boolean;
  title: string;
  kicker?: string;
  accent: string;
  onClose: () => void;
  children: ReactNode;
}

// Right-side slide-in drawer. Hosts the actual editor for whatever
// pin was clicked — either an existing Module (with hideHeader) or
// a small inline editor defined in InlineEditView.
export const PinEditor = ({ open, title, kicker, accent, onClose, children }: PinEditorProps) => {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — partial-opacity so preview stays visible behind */}
      <div
        onClick={onClose}
        aria-hidden
        data-no-swipe
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
          zIndex: 70
        }}
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-label={title}
        data-no-swipe
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(440px, 92vw)',
          background: ED.panel,
          borderLeft: `2px solid ${accent}`,
          boxShadow: `-12px 0 36px rgba(0,0,0,0.65), inset 1px 0 0 ${accent}33`,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: `1px solid ${ED.line}`,
            backgroundImage: `linear-gradient(180deg, ${accent}14, transparent)`,
            flexShrink: 0
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: FONT.stencil,
                fontSize: 16,
                color: accent,
                letterSpacing: 2,
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              {title}
            </div>
            {kicker && (
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  color: ED.inkDim,
                  letterSpacing: 1.4,
                  marginTop: 2
                }}
              >
                {kicker}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            style={{
              width: 30,
              height: 30,
              padding: 0,
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${ED.line}`,
              borderRadius: 3,
              color: ED.ink,
              cursor: 'pointer',
              fontFamily: FONT.mono,
              fontSize: 16,
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            ×
          </button>
        </div>
        {/* Scrolling body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>{children}</div>
      </aside>
    </>
  );
};
