import '@splidejs/react-splide/css'
import '@splidejs/react-splide/css/core'
import 'react-toastify/dist/ReactToastify.css'
import '../styles/globals.css'

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
}
