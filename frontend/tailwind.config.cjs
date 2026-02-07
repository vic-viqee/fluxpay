/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#0066FF',       // Digital Blue
        secondary: '#00C2A8',  // Teal Green
        accent: '#FF6B35',     // Sunset Orange
        'primary-bg': '#1C1F26', // Gunmetal - Primary backgrounds
        'surface-bg': '#2D323E', // Lighter Gunmetal - Cards, secondary backgrounds
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
