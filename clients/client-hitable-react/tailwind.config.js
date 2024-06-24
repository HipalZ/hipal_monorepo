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
	daisyui: {
		styled: true,
		base: true,
		utils: true,
		logs: true,
		rtl: false,
		prefix: "",
		darkTheme: "light",
		themes: [
			{
				light: {
					...require("daisyui/src/colors/themes")["[data-theme=light]"],
					primary: "#2C62F0",
					secondary: "#f5f5f5",
					accent: "#EFC54D",
					neutral: "#1A202C",
					"base-100": "#FFF",
					info: "#E6E6E6",
					success: "#2FBD4E",
					"success-content": "#fff",
				},
			},
			{
				dark: {
					...require("daisyui/src/colors/themes")["[data-theme=dark]"],
					primary: "#2C62F0",
					secondary: "#f5f5f5",
					accent: "#ffffff",
					neutral: "#1A202C",
					"base-100": "#FFF",
					info: "#E6E6E6",
				},
			},
		],
	},
	plugins: [require("daisyui")],
});
