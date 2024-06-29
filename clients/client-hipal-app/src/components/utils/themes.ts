"use client"
import isEmpty from "lodash-es/isEmpty";
import { convertToHsl } from "./helpers";

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
      primary: data?.secondaryColor || "#161616",
      accent: data?.accentColor || "#161616",
      "base-100": data?.primaryColor || "#F9F0E4",
    });

    Object.keys(convertedColors).forEach((key) => {
      document.documentElement.style.setProperty(`${key}`, convertedColors[key]);
    });
  }
};
