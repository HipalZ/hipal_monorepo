import axiosConstructor from 'axios'

const axios = axiosConstructor.create({
	// baseURL: process.env.NEXT_PUBLIC_API_HOST,
	withCredentials: true,
})
axios.interceptors.request.use(
	(config:any) => {
		if(config.url ==undefined){return;}
		// Modify the baseURL based on the request URL
		if (config.url.startsWith("/v1/businesses")) {
			config.baseURL = "http://localhost:3001";
		} else if (config.url.startsWith("/v1/categories")) {
			config.baseURL = "http://localhost:3002";
		} else if (config.url.startsWith("/v1/dishes")) {
			config.baseURL = "http://localhost:3003";
		} else if (config.url.startsWith("/v1/kitchens")) {
			config.baseURL = "http://localhost:3004";
		} else if (config.url.startsWith("/v1/payments")) {
			config.baseURL = "http://localhost:3005";
		} else if (config.url.startsWith("/v1/settings")) {
			config.baseURL = "http://localhost:3006";
		} else if (config.url.startsWith("/v1/users")) {
			config.baseURL = "http://localhost:3007";
		} else if (config.url.startsWith("/v1/zones")) {
			config.baseURL = "http://localhost:3008";
		}
		return config;
	},
	(error) => {
		// Handle the error
		return Promise.reject(error);
	}
);
export default axios

// Add a request interceptor
// axios.interceptors.request.use(
// 	(config) => {
// 		if (!config.url) {
// 			return config
// 		}
// 		if (!process.browser) {
// 			return config
// 		}
// 		const idemKey = sessionStorage.getItem(config.url + config.method)
// 		if (idemKey) {
// 			config.headers['h-idem-id'] = idemKey
// 		} else {
// 			const newIdemKey = crypto.randomUUID()
// 			sessionStorage.setItem(config.url + config.method, newIdemKey)
// 			console.log('newIdemKey', newIdemKey)
// 			config.headers['h-idem-id'] = newIdemKey
// 		}
// 		return config
// 	},
// 	(error) => {
// 		// Do something with request error
// 		return Promise.reject(error)
// 	},
// )

// axios.interceptors.response.use(
// 	(response) => {
// 		if (!response.config.url) {
// 			return response
// 		}
// 		if (!process.browser) {
// 			return response
// 		}
// 		sessionStorage.removeItem(response.config.url + response.config.method)
// 		// Any status code that lie within the range of 2xx cause this function to trigger
// 		// Do something with response data
// 		return response
// 	},
// 	(error) => {
// 		if (isAxiosError(error)) {
// 			if (!error.config?.url) {
// 				return Promise.reject(error)
// 			}
// 			sessionStorage.removeItem(error.config.url + error.config.method)
// 		}
// 		// Any status codes that falls outside the range of 2xx cause this function to trigger
// 		// Do something with response error
// 		return Promise.reject(error)
// 	},
// )