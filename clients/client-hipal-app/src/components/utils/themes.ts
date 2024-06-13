import { convertToHsl } from "@/components/utils/convertToHsl";
import isEmpty from "lodash-es/isEmpty";

export const updateTheme = (data) => {
  if (typeof window === "undefined") {
    return null;
  }

  if (
    !isEmpty(data?.settings?.themes?.secondaryColor) &&
    !isEmpty(data?.settings?.themes?.accentColor) &&
    !isEmpty(data?.settings?.themes?.primaryColor)
  ) {
    const convertedColors = convertToHsl({
      primary: data?.settings?.themes?.primaryColor || "",
      secondary: data?.settings?.themes?.secondaryColor || "",
      accentColor: data?.settings?.themes?.accentColor || "",
      "base-100": data?.settings?.themes?.baseColor || "",
	  color: data?.settings?.themes?.secondaryColor || "",
	  backgroundColor: data?.settings?.themes?.primaryColor || "",
	  fontColor: data?.settings?.themes?.accentColor || "",
    });
    Object.keys(convertedColors).forEach((key) => {
      document.documentElement.style.setProperty(`${key}`, convertedColors[key]);
    });
  }
};
