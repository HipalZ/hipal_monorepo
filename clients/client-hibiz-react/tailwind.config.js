/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
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
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: "#183D2E",
          secondary: "#000",
          accent: "#EFC54D",
          neutral: "#1A202C",
          "base-100": "#f4f4f4",
          info: "#E6E6E6",
          success: "#2FBD4E",
          "success-content": "#fff",
        },
        dark: {
          primary: "#183D2E",
          secondary: "#000",
          accent: "#EFC54D",
          neutral: "#1A202C",
          "base-100": "#f4f4f4",
          info: "#E6E6E6",
          success: "#2FBD4E",
          "success-content": "#fff",
        },
      },
    ],
  },
  plugins: [require("daisyui"), require("flowbite/plugin")],
};
