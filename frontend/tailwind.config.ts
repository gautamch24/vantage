import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          elevated: '#283548',
        },
        accent: {
          gold: '#d4af37',
          blue: '#3b82f6',
          red: '#ef4444',
          green: '#22c55e',
        },
      },
    },
  },
  plugins: [],
}

export default config
