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
          DEFAULT: '#060d18',
          card:     '#0c1929',
          elevated: '#112036',
          input:    '#0a1525',
        },
        gold:   '#d4af37',
        border: {
          DEFAULT: 'rgba(100,140,200,0.13)',
          hover:   'rgba(100,140,200,0.24)',
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
