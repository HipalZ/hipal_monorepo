interface ThemeData {
	primaryColor?: string;
	secondaryColor?: string;
	accentColor?: string;
}

export const updateTheme = (data: ThemeData | undefined): void => {
    if (typeof document === "undefined" || !data) return;

    Object.keys(data).forEach((key) => {
        document.documentElement.style.setProperty(`${key}`, `hsl(${data[key]})`)
    })
}