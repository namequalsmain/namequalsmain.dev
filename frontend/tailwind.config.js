/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Paper" palette — warm cream and near-black, with terracotta accent
        paper: {
          DEFAULT: '#f5f1ea',
          dark: '#ece6da',
        },
        ink: {
          DEFAULT: '#111111',
          muted: '#5b5853',
          faint: '#a8a39a',
        },
        accent: {
          DEFAULT: '#c2410c',   // terracotta
          dark: '#9a3412',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};
