/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B0000',
          light: '#A52A2A',
          dark: '#6B0000',
        },
        charcoal: {
          DEFAULT: '#2B2B2B',
          light: '#3B3B3B',
          dark: '#1B1B1B',
        },
        accent: {
          blue: '#4BA3F5',
          yellow: '#F7C744',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        highlight: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'large': '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
