/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#e2e8f0",
        accent: "#2563eb",
        accentSoft: "#dbeafe",
      },
      boxShadow: {
        glow: "0 20px 60px -20px rgba(37, 99, 235, 0.35)",
      },
    },
  },
  plugins: [],
};