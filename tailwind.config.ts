import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        medieval: {
          dark: '#2C1810',
          brown: '#4A2C1A',
          parchment: '#F4E4BC',
          gold: '#D4AF37',
          burgundy: '#800020',
          rust: '#B7410E',
          stone: '#8B7355',
        },
      },
      fontFamily: {
        medieval: ['var(--font-medieval)', 'serif'],
        decorative: ['var(--font-decorative)', 'serif'],
      },
      backgroundImage: {
        'parchment-texture': "url('/images/parchment-texture.jpg')",
      },
    },
  },
  plugins: [],
}
export default config




