/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

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
					"base-100": "#FEFBEF",
					info: "#E6E6E6",
					success: "#2FBD4E",
					"success-content": "#fff",
				},
				dark: {
					primary: "#183D2E",
					secondary: "#000",
					accent: "#EFC54D",
					neutral: "#1A202C",
					"base-100": "#FEFBEF",
					info: "#E6E6E6",
					success: "#2FBD4E",
					"success-content": "#fff",
				},
			},
		],
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
