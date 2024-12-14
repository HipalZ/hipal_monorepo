/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        primary: "var(--p)",
        "base-100": "var(--b1)",
        "primary-content": "var(--pc)",
        secondary: "var(--s)",
        "secondary-content": "var(--sc)",
        accent: "var(--a)",
        "accent-content": "var(--ac)",
        neutral: "var(--n)",
        "neutral-content": "var(--nc)",
        "base-200": "var(--b2)",
        "base-300": "var(--b3)",
        "base-content": "var(--bc)",
        info: "#E6E6E6",
        success: "#2FBD4E",
        "success-content": "#fff",
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
};
