/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        "downcome":["downcome","sans-serif"],
        "staatliches":["Staatliches","sans-serif"]
      }
    },
  },
  plugins: [require('flowbite/plugin')],
}