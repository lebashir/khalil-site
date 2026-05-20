import type { TunnelTheme } from '../theme';

interface Props {
  label: string;
  theme: TunnelTheme;
}

// Small label pinned at the top-left of each room, like a HUD scene marker.
export const SceneTag = ({ label, theme }: Props) => (
  <div
    style={{
      position: 'absolute',
      top: -36,
      left: 0,
      padding: '4px 10px',
      background: 'rgba(0,0,0,0.65)',
      border: `1px solid ${theme.accent}`,
      fontFamily: "'DM Mono', ui-monospace, monospace",
      fontSize: 11,
      color: theme.accent,
      letterSpacing: 2,
      textShadow: `0 0 8px ${theme.accent}`
    }}
  >
    ▸ {label}
  </div>
);
