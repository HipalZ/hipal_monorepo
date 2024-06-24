/* eslint-disable quotes */
/* eslint-disable no-undef */
// !! DO NOT USE THIS FILE AS A TEMPLATE OR MODIFY THIS FILE!!

module.exports = {
  'packages/*.{css,md,json,html}': ["prettier --write '**/*.{js,jsx,ts,tsx,css,md,json}'"],
  'packages/*.{js,jsx,ts,tsx}': ["prettier --write '**/*.{js,jsx,ts,tsx,css,md,json}'"],
  'apps/*.{js,jsx,ts,tsx}': [() => "prettier --write '**/*.{js,jsx,ts,tsx,css,md,json}'"],
};
