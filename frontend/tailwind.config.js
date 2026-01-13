/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#f3f4ef',
        'text-main': '#0f1f12',
        'accent-lime': '#d4ff33',
        'accent-pink': '#ffb8d0',
        'accent-green': '#4ade80',
        'accent-dark': '#122212',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'tighter-custom': '-0.04em',
      },
      animation: {
        'sonar': 'sonar 2s infinite ease-out',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
        'ticker': 'ticker 20s linear infinite',
        'scan': 'scan 3s linear infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
      },
      keyframes: {
        sonar: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scan: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}

