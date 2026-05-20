'use client';

import type { CSSProperties } from 'react';
import { ED, FONT } from '../constants';

interface EditPinProps {
  label: string;
  accent?: string;
  onClick: () => void;
  style?: CSSProperties;
}

// Floating pin badge — overlay on a preview region so the user can
// click into the matching drawer editor. Positioned absolutely; the
// caller is responsible for `position: relative` on the wrapper.
export const EditPin = ({ label, accent = ED.amber, onClick, style }: EditPinProps) => (
  <button
    type="button"
    onClick={onClick}
    className="ed-pin"
    aria-label={`Edit ${label}`}
    style={{
      position: 'absolute',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 9px',
      background: `${accent}1f`,
      border: `1px solid ${accent}`,
      borderRadius: 999,
      fontFamily: FONT.mono,
      fontSize: 9,
      letterSpacing: 1.4,
      color: accent,
      cursor: 'pointer',
      textTransform: 'uppercase',
      fontWeight: 700,
      boxShadow: `0 0 14px ${accent}66, 0 1px 0 rgba(0,0,0,0.5)`,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      zIndex: 5,
      ...style
    }}
  >
    <span
      aria-hidden
      className="ed-led"
      style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: accent,
        boxShadow: `0 0 5px ${accent}`
      }}
    />
    EDIT · {label}
  </button>
);
