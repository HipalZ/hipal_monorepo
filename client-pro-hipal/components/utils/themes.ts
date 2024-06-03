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

	// Changing the Theme Font
	// TODO: Add Fonts to the Theme
	// if (!isEmpty(data?.settings?.themes?.fontFamily) && !isEmpty(data?.settings?.themes?.fontURL)) {
	// 	const fontURL = data?.settings?.themes?.fontURL || ''
	// 	const fontLink = document.createElement('link')
	// 	fontLink.href = fontURL
	// 	fontLink.rel = 'stylesheet'
	// 	fontLink.type = 'text/css'
	// 	document.head.appendChild(fontLink)

	// 	const font = data?.settings?.themes?.fontFamily || ''
	// 	document.documentElement.style.setProperty('font-family', `${font} !important`)

	// 	const LoadFont = new FontFace(font.split(',')?.[0], `url(${fontURL})`)
	// 	LoadFont.load()
	// 		.then(function (loadedFonts) {
	// 			document.fonts.add(loadedFonts)

	// 			document.documentElement.style.setProperty(
	// 				'font-family',
	// 				`${font.replaceAll(';', '')} !important`,
	// 			)
	// 		})
	// 		.catch(function (error) {
	// 			console.error('Unable to fetch font', error)
	// 			document.documentElement.style.setProperty('font-family', "'Inter', sans-serif !important")

	// 			// error occurred
	// 		})
	// }
}
