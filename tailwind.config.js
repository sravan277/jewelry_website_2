/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6d6875',
          DEFAULT: '#4a4e69',
          dark: '#22223b',
        },
        accent: {
          light: '#c9ada7',
          DEFAULT: '#9a8c98',
          dark: '#4a4e69',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
