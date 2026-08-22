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
        violet: { DEFAULT: '#A7A7A0', 50: '#F2F2EE', 400: '#C6C6BE', 500: '#A7A7A0', 600: '#777770' },
        aurora: { DEFAULT: '#F4F4EF', 400: '#FFFFFF', 500: '#F4F4EF', 600: '#C9C9C0' },
        ember:  { DEFAULT: '#8C8C84', 400: '#B4B4AA', 500: '#8C8C84', 600: '#62625D' },
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