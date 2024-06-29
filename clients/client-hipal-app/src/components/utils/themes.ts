import isEmpty from "lodash-es/isEmpty";
import { convertToHsl } from "./helpers";

interface ThemeData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export const updateTheme = (data: ThemeData): void => {
  console.log("data", data);
  if (typeof document === "undefined") return;

  if (
    !isEmpty(data?.secondaryColor) &&
    !isEmpty(data?.accentColor) &&
    !isEmpty(data?.primaryColor)
  ) {
    const convertedColors = convertToHsl({
      primary: data.secondaryColor || "",
      accent: data.accentColor || "",
      "base-100": data.primaryColor || "",
    });

    Object.keys(convertedColors).forEach((key) => {
      document.documentElement.style.setProperty(`${key}`, convertedColors[key]);
    });
  }
};
