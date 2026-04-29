import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['DM Mono', 'Menlo', 'monospace'],
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#E8521A',
          amber: '#F5A623',
          sage: '#6B8C6E',
          cream: '#FAF7F2',
          dark: '#1A1208',
          warm: '#F0E8D8',
          muted: '#8C7B6B',
        },
      },
    },
  },
  plugins: [],
}
export default config
