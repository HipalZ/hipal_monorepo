import * as functions from 'daisyui/src/colors/functions';
import isEmpty from 'lodash-es/isEmpty';
const zoneColorMapping = {
  swiggy: '#FC8019',
  zomato: '#CB202D',
  other: '#2C62F0',
};

export const updateTheme = (zoneName) => {
  if (typeof document === 'undefined') return null;

  if (!isEmpty(zoneName)) {
    const primaryColor = zoneColorMapping[zoneName] || '#2C62F0';
    const convertedColors = functions.convertToHsl({
      primary: primaryColor,
      secondary: '#f5f5f5' || '',
      'base-100': '#FFF' || '',
    });

    Object.keys(convertedColors).forEach((key) => {
      document.documentElement.style.setProperty(`${key}`, convertedColors[key]);
    });
  }
};
