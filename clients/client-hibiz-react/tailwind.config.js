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
	plugins: [require("daisyui"), require("flowbite/plugin")],
};
