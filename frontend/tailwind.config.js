/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF7F2',
        surface: '#FFFFFF',
        card: '#FFF8F0',
        accent: '#E8611A',
        accent2: '#C4A882',
        text: '#1A1208',
        muted: '#8C7B6B',
        border: '#E8DDD0',
        success: '#4A7C59',
        warning: '#D4A017',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        warm: '0 2px 12px rgba(232, 97, 26, 0.08)',
        'warm-lg': '0 4px 24px rgba(232, 97, 26, 0.1)',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flyPlane: {
          '0%': { transform: 'translateX(-60px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(calc(100% + 60px))', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeSlideUp: 'fadeSlideUp 0.6s ease-out forwards',
        flyPlane: 'flyPlane 2.5s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
