/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          bg: "var(--cafe-bg)",
          surface: "var(--cafe-surface)",
          elevated: "var(--cafe-elevated)",
          text: "var(--cafe-text)",
          muted: "var(--cafe-muted)",
          border: "var(--cafe-border)",
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
