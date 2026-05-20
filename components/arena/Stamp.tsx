interface Props {
  text: string;
  color?: string;
  rot?: number;
}

// Small rubber-stamp pill — outline border + slight rotation. Used on the
// Book card to call out chapter / status.
export const Stamp = ({ text, color = '#d44545', rot = 0 }: Props) => (
  <span
    style={{
      display: 'inline-block',
      padding: '5px 10px',
      border: `2px solid ${color}`,
      color,
      fontFamily: "'Anton', sans-serif",
      fontSize: 12,
      letterSpacing: 1.5,
      transform: `rotate(${rot}deg)`,
      background: 'transparent',
      opacity: 0.85,
      textShadow: `0 0 1px ${color}`
    }}
  >
    {text}
  </span>
);
