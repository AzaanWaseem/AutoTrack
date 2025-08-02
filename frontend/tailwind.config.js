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
          DEFAULT: '#1e40af',
          hover: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#64748b',
          hover: '#475569',
        }
      }
    },
  },
  plugins: [],
}