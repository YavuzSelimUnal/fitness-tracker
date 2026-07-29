/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0c0d0f",
          card: "#19191b",
          border: "#2a2b2e",
        },
        accent: {
          DEFAULT: "#e8543a",
          dark: "#0c0d0f",
        },
        text: {
          DEFAULT: "#f4f4f5",
          muted: "#8a8a8d",
        },
      },
    },
  },
  plugins: [],
};