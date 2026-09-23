/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#152B20',
          800: '#1E3A2B',
          700: '#244A36',
          600: '#2E5A44',
          500: '#3D7357',
        },
        moss: {
          DEFAULT: '#526E48',
          light: '#708A58',
        },
        cream: {
          50: '#FCFAF7',
          100: '#FAF7F2',
          200: '#F4EFEA',
          300: '#EBE3DA',
        },
        charcoal: {
          900: '#141D1A',
          800: '#1C2826',
          700: '#2B3A33',
          600: '#405249',
        },
        earth: {
          DEFAULT: '#8C6D58',
          amber: '#C87941',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
