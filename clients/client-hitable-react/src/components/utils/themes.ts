import * as functions from 'daisyui/src/colors/functions';

const zoneColorMapping: { [key: string]: string } = {
  swiggy: '#FC8019',
  zomato: '#CB202D',
  other: '#2C62F0',
};

export const updateTheme = (zoneName: string) => {
  if (typeof document === 'undefined') return null;

  if (zoneName && zoneName.trim() !== '') {
    const primaryColor = zoneColorMapping[zoneName] || '#2C62F0';
    const convertedColors = functions.convertToHsl({
      primary: primaryColor,
      secondary: '#f5f5f5',
      'base-100': '#FFF',
    });

    Object.keys(convertedColors).forEach((key) => {
      document.documentElement.style.setProperty(`--${key}`, convertedColors[key]);
    });
  }
};
