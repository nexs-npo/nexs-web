/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        // Project Category Colors
        'category-shared': {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        'category-platform': {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          900: '#581c87',
        },
        'category-mobility': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          900: '#14532d',
        },
        'category-education': {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          900: '#78350f',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
        nav: '0 -2px 8px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
