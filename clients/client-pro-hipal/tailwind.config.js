/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
	content: ["./{pages,components,assets,stories}/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				Montserrat: ["Montserrat", "sans-serif"],
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
					primary: "#F14638",
					secondary: "#000",
					accent: "#EFC54D",
					neutral: "#1A202C",
					"base-100": "#FFFFFC",
					info: "#E6E6E6",
					success: "#2FBD4E",
					"success-content": "#fff",
				},
			},
			{
				dark: {
					...require("daisyui/src/colors/themes")["[data-theme=dark]"],
					primary: "#c03b38",
					secondary: "#000",
					accent: "#ffffff",
					neutral: "#1A202C",
					"base-100": "#171722",
					info: "#E6E6E6",
				},
			},
			// 'dark',
			// 'cupcake',
			// 'bumblebee',
			// 'emerald',
			// 'corporate',
			// 'synthwave',
			// 'retro',
			// 'cyberpunk',
			// 'valentine',
			// 'halloween',
			// 'garden',
			// 'forest',
			// 'aqua',
			// 'lofi',
			// 'pastel',
			// 'fantasy',
			// 'wireframe',
			// 'black',
			// 'luxury',
			// 'dracula',
			// 'cmyk',
			// 'autumn',
			// 'business',
			// 'acid',
			// 'lemonade',
			// 'night',
			// 'coffee',
			// 'winter',
		],
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("daisyui"),
		require("@tailwindcss/line-clamp"),
		require('tailwindcss-animated')
	],
});
