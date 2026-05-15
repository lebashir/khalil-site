import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--display-font)', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        gaming: ['Bungee', 'cursive'],
        football: ['"Russo One"', 'sans-serif']
      },
      colors: {
        // CSS variables let us swap palettes by body class without re-rendering Tailwind classes.
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
        // Fixed palette refs for the toggle banner itself (always present regardless of active mode).
        'gaming-bg-1': '#0a0420',
        'gaming-bg-2': '#1a0a3a',
        'gaming-bg-3': '#2a0f5a',
        'gaming-accent': '#00b8ff',
        'gaming-accent-2': '#b026ff',
        'gaming-accent-3': '#ff2bd6',
        'football-bg-1': '#001233',
        'football-bg-2': '#002970',
        'football-bg-3': '#0046b5',
        'football-accent': '#ffffff',
        'football-accent-2': '#ffd700',
        'football-accent-3': '#4d8fff'
      },
      boxShadow: {
        glow: 'var(--glow)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(15deg)' }
        },
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
        float: 'float 14s ease-in-out infinite',
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
