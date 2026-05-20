import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // var(--display-font) swaps Bungee ↔ Russo One based on the html.gaming
        // / html.football class. The role fonts below are direct refs.
        display: ['var(--display-font)', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        gaming: ['Bungee', 'cursive'],
        football: ['"Russo One"', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
        marker: ['"Permanent Marker"', 'cursive'],
        caveat: ['Caveat', 'cursive']
      },
      colors: {
        bg1: 'var(--bg-1)',
        bg2: 'var(--bg-2)',
        bg3: 'var(--bg-3)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'accent-3': 'var(--accent-3)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        card: 'var(--card)',
        'card-border': 'var(--card-border)',
        // Fixed palette refs — mirror components/topbar/palette.ts. Used by
        // components that need a specific mode color regardless of the
        // currently-active mode.
        'gaming-bg-a': '#0e0030',
        'gaming-bg-b': '#3a0a5a',
        'gaming-bg-c': '#5a14a0',
        'gaming-accent': '#00f0ff',
        'gaming-accent-2': '#ff2bd6',
        'gaming-accent-3': '#ffe600',
        'football-bg-a': '#001233',
        'football-bg-b': '#003366',
        'football-bg-c': '#0a4a2a',
        'football-accent': '#ffd700',
        'football-accent-2': '#ffffff',
        'football-accent-3': '#4d8fff'
      },
      boxShadow: {
        glow: 'var(--glow)'
      },
      keyframes: {
        idle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' }
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.35' },
          '50%': { transform: 'scale(1.15)', opacity: '0.5' }
        },
        spin: { to: { transform: 'rotate(360deg)' } },
        blink: { '50%': { opacity: '0.55' } }
      },
      animation: {
        idle: 'idle 3.5s ease-in-out infinite',
        pulse: 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 22s linear infinite',
        blink: 'blink 1.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
