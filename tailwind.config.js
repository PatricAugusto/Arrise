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
        // Accent — gradiente de ascensão
        violet: { DEFAULT: '#6C5CE7', 50: '#F2F0FE', 400: '#8B7DEE', 500: '#6C5CE7', 600: '#5642D6' },
        aurora: { DEFAULT: '#00E5C7', 400: '#3CEFD8', 500: '#00E5C7', 600: '#00BFA5' },
        ember:  { DEFAULT: '#FF8A5B', 400: '#FFA37D', 500: '#FF8A5B', 600: '#F26A36' },
      },
      fontFamily: {
        display: ['SpaceGrotesk_700Bold'],
        'display-medium': ['SpaceGrotesk_500Medium'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        mono: ['SpaceMono_400Regular'],
      },
      borderRadius: { glass: '28px' },
    },
  },
  plugins: [],
};