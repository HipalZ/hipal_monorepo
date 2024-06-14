import * as functions from 'daisyui/src/colors/functions'
import isEmpty from 'lodash-es/isEmpty'
import { IThemes } from '../types/businessData'

export const updateTheme = (themes:IThemes) => {
	// Changing the Theme Colors

	if (typeof document === 'undefined') return null

	if (
		!isEmpty(themes?.secondaryColor) &&
		!isEmpty(themes?.accentColor) &&
		!isEmpty(themes?.primaryColor)
	) {
		const convertedColors = functions.convertToHsl({
			primary: themes?.secondaryColor || '',
			accent: themes?.accentColor || '',
			'base-100': themes?.primaryColor || '',
		})

		Object.keys(convertedColors).forEach((key) => {
			document.documentElement.style.setProperty(`${key}`, convertedColors[key])
		})
	}
}
