import withMT from "@material-tailwind/react/utils/withMT";

/** @type {import('tailwindcss').Config} */
const config = withMT({
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./pages/**/*.{js,ts,jsx,tsx}"], // Merged content array
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ubuntu)"],
      },
    },
  },
});

export default config;
