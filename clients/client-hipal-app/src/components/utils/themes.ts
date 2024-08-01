interface ThemeData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export const updateTheme = (data: ThemeData | undefined): void => {
  if (typeof document === "undefined" || !data) return;

  for (const key of Object.keys(data)) {
    document.documentElement.style.setProperty(`${key}`, `hsl(${data[key]})`);
  }
};
