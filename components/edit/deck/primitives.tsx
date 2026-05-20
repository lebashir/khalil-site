import type { CSSProperties, ReactNode } from 'react';
import { ED, FONT } from './constants';

// ── Panel — bordered module with four corner LEDs + optional header ──────

interface PanelProps {
  title?: string;
  kicker?: string;
  accent?: string;
  children: ReactNode;
  style?: CSSProperties;
  headerRight?: ReactNode;
  className?: string;
}

export const Panel = ({
  title,
  kicker,
  accent = ED.amber,
  children,
  style,
  headerRight,
  className
}: PanelProps) => (
  <div
    className={className}
    style={{
      position: 'relative',
      background: ED.panel,
      border: `1px solid ${ED.line}`,
      borderRadius: 4,
      padding: 14,
      ...style
    }}
  >
    {([0, 1, 2, 3] as const).map((c) => {
      const cs =
        c === 0
          ? { top: -3, left: -3 }
          : c === 1
            ? { top: -3, right: -3 }
            : c === 2
              ? { bottom: -3, left: -3 }
              : { bottom: -3, right: -3 };
      return (
        <span
          key={c}
          aria-hidden
          className={c === 0 ? 'ed-led' : undefined}
          style={{
            position: 'absolute',
            ...cs,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 8px ${accent}`
          }}
        />
      );
    })}
    {(title || headerRight) && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 10
        }}
      >
        <div>
          {title && (
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                letterSpacing: 2,
                color: accent,
                textTransform: 'uppercase'
              }}
            >
              {title}
            </div>
          )}
          {kicker && (
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                color: ED.inkDim,
                letterSpacing: 0.5,
                marginTop: 2
              }}
            >
              {kicker}
            </div>
          )}
        </div>
        {headerRight}
      </div>
    )}
    {children}
  </div>
);

// ── Pill — small key/value tag (used in TopBar) ──────────────────────────

interface PillProps {
  label?: string;
  value: string;
  color?: string;
}

export const Pill = ({ label, value, color = ED.green }: PillProps) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 8px',
      background: 'rgba(0,0,0,0.55)',
      border: `1px solid ${color}55`,
      borderRadius: 2,
      fontFamily: FONT.mono,
      fontSize: 10,
      letterSpacing: 1.3,
      color,
      textTransform: 'uppercase'
    }}
  >
    {label && <span style={{ opacity: 0.6 }}>{label}</span>}
    <span style={{ fontWeight: 700 }}>{value}</span>
  </span>
);

// ── BarButton — TopBar action button (Save / Exit) ───────────────────────

interface BarButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const BarButton = ({ children, onClick, color = ED.amber, disabled, type = 'button' }: BarButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{
      fontFamily: FONT.mono,
      fontSize: 10,
      letterSpacing: 1.5,
      fontWeight: 700,
      color,
      background: 'transparent',
      border: `1px solid ${color}66`,
      padding: '5px 10px',
      borderRadius: 3,
      cursor: disabled ? 'not-allowed' : 'pointer',
      textTransform: 'uppercase',
      opacity: disabled ? 0.5 : 1
    }}
  >
    {children}
  </button>
);

// ── Tab — the two top tabs ───────────────────────────────────────────────

interface TabProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export const Tab = ({ active, onClick, children }: TabProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      position: 'relative',
      padding: '8px 16px',
      background: active ? ED.panel : 'transparent',
      border: `1px solid ${active ? ED.line : 'transparent'}`,
      borderBottom: active ? `1px solid ${ED.panel}` : `1px solid ${ED.line}`,
      marginBottom: -1,
      color: active ? ED.amber : ED.inkDim,
      fontFamily: FONT.mono,
      fontSize: 11,
      letterSpacing: 1.5,
      fontWeight: 700,
      cursor: 'pointer',
      textTransform: 'uppercase'
    }}
  >
    {children}
  </button>
);

// ── ToggleChip — small in-panel toggle (used in LaunchWindow) ───────────

interface ToggleChipProps {
  active: boolean;
  color: string;
  onClick: () => void;
  children: ReactNode;
}

export const ToggleChip = ({ active, color, onClick, children }: ToggleChipProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: '4px 8px',
      background: active ? `${color}1a` : 'transparent',
      border: `1px solid ${active ? color : ED.line}`,
      borderRadius: 3,
      fontFamily: FONT.mono,
      fontSize: 9,
      letterSpacing: 1,
      fontWeight: 700,
      color: active ? color : ED.inkDim,
      cursor: 'pointer',
      textTransform: 'uppercase'
    }}
  >
    {children}
  </button>
);

// ── DialButton — small ± dial for SubsModule ────────────────────────────

interface DialButtonProps {
  onClick: () => void;
  label: string;
}

export const DialButton = ({ onClick, label }: DialButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: 30,
      height: 30,
      background: 'rgba(0,0,0,0.55)',
      border: `1px solid ${ED.line}`,
      borderRadius: 3,
      fontFamily: FONT.mono,
      fontSize: 11,
      fontWeight: 700,
      color: ED.amber,
      cursor: 'pointer',
      letterSpacing: 0.5
    }}
  >
    {label}
  </button>
);

// ── Field — label + input wrapper ────────────────────────────────────────

interface FieldProps {
  label: string;
  children: ReactNode;
}

export const Field = ({ label, children }: FieldProps) => (
  <div>
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 9,
        color: ED.inkDim,
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase'
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

// ── Shared input style ──────────────────────────────────────────────────

export const editInput: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(0,0,0,0.55)',
  border: `1px solid ${ED.line}`,
  borderRadius: 3,
  color: ED.ink,
  fontFamily: FONT.body,
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.4,
  resize: 'vertical',
  outline: 'none'
};

// ── ImageDropzone — placeholder for image upload (URL paste in step 6) ─

interface ImageDropzoneProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}

export const ImageDropzone = ({ label = 'paste an image URL', value, onChange }: ImageDropzoneProps) => (
  <div
    style={{
      padding: 14,
      background: 'rgba(0,0,0,0.4)',
      border: `2px dashed ${ED.line}`,
      borderRadius: 4
    }}
  >
    <div style={{ fontSize: 28, color: ED.amber, opacity: 0.6, textAlign: 'center' }}>📷</div>
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 10,
        color: ED.inkDim,
        letterSpacing: 1,
        marginTop: 4,
        textAlign: 'center'
      }}
    >
      {label}
    </div>
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="https://…"
      style={{
        ...editInput,
        marginTop: 10,
        fontSize: 12
      }}
    />
  </div>
);
