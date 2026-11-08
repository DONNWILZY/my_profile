/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: '#4169E1',
        'royal-hover': '#3054C1',
        navy: '#0A1F44',
        ink: '#20334C',
        mist: '#F4F7FF',
        muted: '#6A7A91',
        tint: '#E7EFFB',
        accent: '#8BC8FF',
        'brand-border': '#DFE6EF',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--brand-font-body)', 'sans-serif'],
        display: ['var(--brand-font-display)', 'sans-serif'],
      },
      boxShadow: { soft: '0 22px 80px rgb(var(--brand-navy-rgb) / .08)' },
      borderRadius: { '3xl': '1.75rem' },
    },
  },
  plugins: [],
};
