/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#ffd700',
          dark: '#b8941f',
          muted: '#c9a961',
        },
        parchment: '#f4e4c1',
        brown: {
          DEFAULT: '#8b4513',
          medium: '#654321',
          dark: '#2d1810',
          darker: '#1a0f0a',
        },
        danger: '#cd5c5c',
        success: '#4ade80',
      },
      fontFamily: {
        cinzel: ["'Cinzel'", 'serif'],
        crimson: ["'Crimson Text'", 'serif'],
      },
      backgroundImage: {
        'medieval': 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%)',
      },
      boxShadow: {
        'gold': '0 8px 32px rgba(212,175,55,0.2)',
        'gold-strong': '0 8px 32px rgba(212,175,55,0.5)',
        'card': '0 8px 32px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
