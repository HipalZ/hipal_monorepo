interface ThemeVariables {
  [key: `--${string}`]: string;
}

export const updateTheme = (data: ThemeVariables | undefined): void => {
  if (!data) return;
  
  const root = document.documentElement;
  
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('--')) {
      // Add proper HSL formatting if missing
      const formattedValue = value.startsWith('hsl(') 
        ? value 
        : `hsl(${value.replace(/\s+/g, ', ')})`;
      
      root.style.setProperty(key, formattedValue);
    }
  });
};