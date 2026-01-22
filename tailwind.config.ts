import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Cinzel', 'serif'],
        'body': ['Lato', 'sans-serif'],
        'serif-custom': ['Cormorant Garamond', 'serif'],
      },
      colors: {
        primary: '#4A5D4F',
        'primary-dark': '#3d4d41',
      },
    },
  },
  plugins: [],
};

export default config;
