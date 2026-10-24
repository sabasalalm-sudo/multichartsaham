// File: tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#080D1A',
          card: '#0D1527',
          cardHover: '#131F38',
          subtle: '#17233F',
          border: '#1E2D4A',
          borderLight: '#2A3C60',
        },
        trading: {
          buy: '#00D084',
          buyDark: '#059669',
          hold: '#F59E0B',
          sell: '#F43F5E',
          blue: '#3B82F6',
        },
      },
      boxShadow: {
        'glow-buy': '0 0 15px -3px rgba(0, 208, 132, 0.25)',
        'glow-panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
