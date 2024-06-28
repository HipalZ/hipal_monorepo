import * as functions from "daisyui/src/colors/functions"
import isEmpty from "lodash-es/isEmpty"

export const updateTheme = (data) => {
	// Changing the Theme Colors
	console.log("data", data);
	if (typeof document === "undefined") return null

	if (
		!isEmpty(data?.secondaryColor) &&
		!isEmpty(data?.accentColor) &&
		!isEmpty(data?.primaryColor)
	) {
		const convertedColors = functions.convertToHsl({
			primary: data?.secondaryColor || "",
			accent: data?.accentColor || "",
			"base-100": data?.primaryColor || "",
		})

		Object.keys(convertedColors).forEach((key) => {
			document.documentElement.style.setProperty(`${key}`, convertedColors[key])
		})
	}
}