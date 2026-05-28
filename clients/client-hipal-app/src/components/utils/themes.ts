interface ThemeVariables {
  [key: string]: string | undefined;
}

const colorToCssValue = (value: string): string => {
  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith("#") ||
    trimmedValue.startsWith("rgb") ||
    trimmedValue.startsWith("hsl") ||
    trimmedValue.startsWith("oklch") ||
    trimmedValue.startsWith("var(")
  ) {
    return trimmedValue;
  }

  return `hsl(${trimmedValue.replace(/\s+/g, ", ")})`;
};

export const updateTheme = (data: ThemeVariables | undefined): void => {
  if (!data) return;

  const root = document.documentElement;

  if (data.primaryColor) {
    const primaryColor = colorToCssValue(data.primaryColor);
    root.style.setProperty("--p", primaryColor);
    root.style.setProperty("--pf", "#ffffff");
    root.style.setProperty("--pc", "#ffffff");
    root.style.setProperty("--h-p", primaryColor);
    root.style.setProperty("--h-pf", "#ffffff");
  }

  if (data.secondaryColor) {
    const secondaryColor = colorToCssValue(data.secondaryColor);
    root.style.setProperty("--s", secondaryColor);
    root.style.setProperty("--h-s", secondaryColor);
  }

  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith("--") && value) {
      root.style.setProperty(key, colorToCssValue(value));
    }
  });
};
