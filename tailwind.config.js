/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./constants.tsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#FFF5F0",
          DEFAULT: "#FF6B00",
          dark: "#CC5500",
          hover: "#FF8533",
        },
      },
    },
  },
  plugins: [],
};
