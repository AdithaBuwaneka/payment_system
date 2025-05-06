/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A6FA5', // Indigo Blue
        secondary: '#FF7F50', // Coral
      },
    },
  },
  plugins: [],
}