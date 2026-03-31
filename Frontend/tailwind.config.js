/** @type {import('tailwindcss').Config} */
export default {

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#101419',
        'surface-low': '#181c21',
        'surface-highest': '#31353b',
        'primary-container': '#00fbfb',
        'secondary': '#a5c8ff',
        'on-surface-variant': '#b9cac9',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
plugins: [require('@tailwindcss/typography')]
}

