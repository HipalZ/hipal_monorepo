import isEmpty from "lodash-es/isEmpty";
import { convertToHsl } from "./helpers";

// Changing the Theme Colors

interface ThemeData {
	primaryColor?: string;
	secondaryColor?: string;
	accentColor?: string;
  }

export const updateTheme = (data: ThemeData | undefined): void => {
	if (typeof document === "undefined") return;
 
	if (
		!isEmpty(data?.secondaryColor) &&
		!isEmpty(data?.accentColor) &&
		!isEmpty(data?.primaryColor)
	) {
		const convertedColors = convertToHsl({
			primary: data?.secondaryColor || "",
			accent: data?.accentColor || "",
			"base-100": data?.primaryColor || "",
		});
		console.log({ convertedColors });

		Object.keys(convertedColors).forEach((key) => {
			console.log(key, convertedColors[key]);
			document.documentElement.style.setProperty(`${key}`, `hsl(${convertedColors[key]})`)
		})
	}
}
