import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080d14',
          card: '#0e1520',
          elevated: '#141e2e',
        },
        gold: {
          DEFAULT: '#d4af37',
          dim: 'rgba(212,175,55,0.15)',
        },
        border: {
          DEFAULT: 'rgba(99,132,184,0.12)',
          bright: 'rgba(99,132,184,0.25)',
        },
        // keep these for backwards compat
        surface: {
          DEFAULT: '#080d14',
          card: '#0e1520',
          elevated: '#141e2e',
        },
        accent: {
          gold: '#d4af37',
          blue: '#3b82f6',
          red: '#ef4444',
          green: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
