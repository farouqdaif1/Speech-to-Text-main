/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  important: true,
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        'motiva-light': ['var(--font-motiva-light)', 'sans-serif'],
        'motiva-bold': ['var(--font-motiva-bold)', 'sans-serif'],
      },
      colors: {
        sinaRed: '#DA3025',
        main: '#F0F5FA',
        secondary: '#00CED1',
        sinaBlue: {
          light: '#BFD1FF',
          DEFAULT: '#5881F2',
          dark: '#608CFE',
        },
      },
      boxShadow: {
        'input-focus': '#2e186a 0px 0px 0px 1px',
      },
      fontSize: {
        h1: ['56px', '1.18'],
        h2: ['56px', '1.18'],
        h3: ['56px', '1.18'],
        h4: ['56px', '1.18'],
        h5: ['56px', '1.18'],
        h6: ['56px', '1.18'],
        'h1-responsive-lg': ['47px'],
        'h1-responsive-sm': ['32px'],
        p: ['21px', '1.41'],
      },
    },
  },
  plugins: [],
};
