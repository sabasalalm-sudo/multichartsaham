/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palet gelap sesuai referensi UI
        brand: {
          bg: '#080D1A',        // Background utama (paling gelap)
          card: '#0D1527',      // Background kartu & panel 
          cardHover: '#131F38', // State hover kartu
          subtle: '#17233F',    // Background elemen minor / nested box
          border: '#1E2D4A',    // Border halus antar panel
          borderLight: '#2A3C60',
        },
        // Warna sinyal trading (Buy, Hold, Sell)
        trading: {
          buy: '#00D084',       // Hijau cerah untuk BUY & Profit
          buyDark: '#059669',
          hold: '#F59E0B',      // Kuning / Oranye untuk HOLD
          sell: '#F43F5E',      // Merah untuk SELL & Loss
          blue: '#3B82F6',      // Aksen informasi
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-buy': '0 0 15px -3px rgba(0, 208, 132, 0.25)',
        'glow-panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
