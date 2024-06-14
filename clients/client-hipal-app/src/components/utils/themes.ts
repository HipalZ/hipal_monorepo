import * as functions from 'daisyui/src/colors/functions'
import isEmpty from 'lodash-es/isEmpty'

export const updateTheme = (data) => {
	// Changing the Theme Colors

	if (typeof document === 'undefined') return null

	if (
		!isEmpty(data?.settings?.themes?.secondaryColor) &&
		!isEmpty(data?.settings?.themes?.accentColor) &&
		!isEmpty(data?.settings?.themes?.primaryColor)
	) {
		const convertedColors = functions.convertToHsl({
			primary: data?.settings?.themes?.secondaryColor || '',
			accent: data?.settings?.themes?.accentColor || '',
			'base-100': data?.settings?.themes?.primaryColor || '',
		})

		Object.keys(convertedColors).forEach((key) => {
			document.documentElement.style.setProperty(`${key}`, convertedColors[key])
		})
	}
}