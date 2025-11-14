/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line scans your components for Tailwind classes
  ],
  // Add this 'safelist' section
  safelist: [
    {
      // This pattern tells Tailwind to *not* remove the color classes
      // we need for the student dashboard stat cards.
      pattern: /(bg|text|border)-(blue|green|indigo)-(100|500|600|700|800)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}