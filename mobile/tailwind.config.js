/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
          light: '#fb923c',
        },
        status: {
          free: '#22c55e',
          occupied: '#ef4444',
          reserved: '#eab308',
          cleaning: '#f97316',
        }
      }
    },
  },
  plugins: [],
};
