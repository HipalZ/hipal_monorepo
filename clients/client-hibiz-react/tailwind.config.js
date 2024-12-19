/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
import flowbitePlugin from "flowbite/plugin";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "custom-gradient":
          "linear-gradient(90deg, #1877F2 7.62%, #8C63FF 159.52%)",
      },
      fontFamily: {
        sans: ["var(--font-ubuntu)"],
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

  plugins: [flowbitePlugin],
};
