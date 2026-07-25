/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        police: {
          950: '#060B19',
          900: '#0B132B',
          850: '#111C3A',
          800: '#1C2541',
          700: '#2A365B',
          600: '#3A506B',
          500: '#4F6D7A',
          400: '#5BC0BE',
          gold: '#D4AF37',
          goldHover: '#B89628',
          accent: '#00A8E8',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
