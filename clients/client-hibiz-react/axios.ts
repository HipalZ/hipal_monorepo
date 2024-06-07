import axiosConstructor from 'axios';

const axios = axiosConstructor.create({
  baseURL: 'https://api.hipal.life',
  withCredentials: true,
});

export default axios;

// // Add a request interceptor
// axios.interceptors.request.use(
// 	(config) => {
// 		if (!config.url || typeof window === 'undefined') {
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
//   (response) => {
//     if (!response.config.url || typeof window === "undefined") {
//       return response;
//     }
//     if (!process.browser) {
//       return response;
//     }
//     sessionStorage.removeItem(response.config.url + response.config.method);
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     // Do something with response data
//     return response;
//   },
//   (error) => {
//     if (isAxiosError(error)) {
//       if (!error.config?.url) {
//         return Promise.reject(error);
//       }
//       sessionStorage.removeItem(error.config.url + error.config.method);
//     }
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     // Do something with response error
//     return Promise.reject(error);
//   }
// );
