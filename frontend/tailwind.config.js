/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--arrise-bg) / <alpha-value>)',
        'bg-elevated': 'rgb(var(--arrise-bg-elevated) / <alpha-value>)',
        text: 'rgb(var(--arrise-text) / <alpha-value>)',
        'text-dim': 'rgb(var(--arrise-text-dim) / <alpha-value>)',
        glass: 'rgb(var(--arrise-glass) / <alpha-value>)',
        'glass-border': 'rgb(var(--arrise-glass-border) / <alpha-value>)',
        // Functional grayscale accents for the terminal interface.
        violet: { DEFAULT: '#B8C0CC', 50: '#F3F6FA', 400: '#D5DCE5', 500: '#B8C0CC', 600: '#7B8797' },
        aurora: { DEFAULT: '#00D9FF', 400: '#5CEBFF', 500: '#00D9FF', 600: '#00A8C6' },
        ember:  { DEFAULT: '#FF4FD8', 400: '#FF8AE7', 500: '#FF4FD8', 600: '#C91AA5' },
      },
      fontFamily: {
        display: ['SpaceGrotesk_700Bold'],
        'display-medium': ['SpaceGrotesk_500Medium'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        mono: ['SpaceMono_400Regular'],
      },
      borderRadius: { glass: '18px' },
    },
  },
  plugins: [],
};