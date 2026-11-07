/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Onest"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['"Onest"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Onest"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
