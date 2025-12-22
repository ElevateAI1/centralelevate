/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        nexus: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          accent: '#6366f1',
          glow: '#8b5cf6',
        }
      }
    },
  },
  plugins: [],
}