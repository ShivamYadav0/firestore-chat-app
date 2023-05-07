/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        "hero-pattern": "url('../src/assets/blurrybg.svg')",
      },
    },
  },
  plugins: [],
};
