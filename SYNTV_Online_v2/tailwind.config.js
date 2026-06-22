/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        syntv: {
          bg: '#050816',
          card: '#101827',
          surface: '#1E293B',
          primary: '#00AEEF',
          'primary-dark': '#0095CC',
          secondary: '#7C3AED',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
          dim: '#64748B',
          border: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
