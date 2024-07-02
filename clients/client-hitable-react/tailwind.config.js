/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./pages/**/*.{js,ts,jsx,tsx}"], // Merged content array
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-ubuntu)"],
			},
		},
	},
});
