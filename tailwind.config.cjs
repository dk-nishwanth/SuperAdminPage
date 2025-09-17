/********************
 * Tailwind Config  *
 ********************/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
        muted: '#f3f4f6',
      }
    },
  },
  plugins: [],
}
