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
        aurora: { DEFAULT: '#00E5FF', 400: '#72F3FF', 500: '#00E5FF', 600: '#00A8C6' },
        ember:  { DEFAULT: '#FF2BD6', 400: '#FF84E8', 500: '#FF2BD6', 600: '#C91AA5' },
        signal: { DEFAULT: '#D7FF3F', 400: '#E7FF7A', 500: '#D7FF3F', 600: '#9EBF00' },
      },
      fontFamily: {
        display: ['SpaceGrotesk_700Bold'],
        'display-medium': ['SpaceGrotesk_500Medium'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        mono: ['SpaceMono_400Regular'],
      },
      borderRadius: { glass: '12px' },
    },
  },
  plugins: [],
};