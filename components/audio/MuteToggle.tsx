'use client';

import { useMute } from './useMute';

// Floating speaker button. Fixed to the bottom-right of the viewport so
// it floats above all page content without colliding with the /edit
// TopBar (which is anchored to the top).
export const MuteToggle = () => {
  const { muted, toggle } = useMute();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={muted}
      title={muted ? 'Sounds are off' : 'Sounds are on'}
      style={{
        position: 'fixed',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        right: 'max(16px, env(safe-area-inset-right))',
        width: 40,
        height: 40,
        padding: 0,
        zIndex: 9000,
        background: 'rgba(0, 0, 0, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: 999,
        color: '#fff',
        cursor: 'pointer',
        fontSize: 18,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
        userSelect: 'none'
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
};
