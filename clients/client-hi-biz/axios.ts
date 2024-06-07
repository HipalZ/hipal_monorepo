import axiosConstructor from 'axios';

const axios = axiosConstructor.create({
  // baseURL: process.env.NEXT_PUBLIC_API_HOST,
  withCredentials: true,
});

axios.interceptors.request.use(
  (config) => {
    // Modify the baseURL based on the request URL
    if (config.url.startsWith('/v1/businesses')) {
      config.baseURL = 'http://localhost:3001';
    } else if (config.url.startsWith('/v1/categories')) {
      config.baseURL = 'http://localhost:3002';
    } else if (config.url.startsWith('/v1/dishes')) {
      config.baseURL = 'http://localhost:3003';
    } else if (config.url.startsWith('/v1/kitchens')) {
      config.baseURL = 'http://localhost:3004';
    } else if (config.url.startsWith('/v1/payments')) {
      config.baseURL = 'http://localhost:3005';
    } else if (config.url.startsWith('/v1/settings')) {
      config.baseURL = 'http://localhost:3006';
    } else if (config.url.startsWith('/v1/users')) {
      config.baseURL = 'http://localhost:3007';
    } else if (config.url.startsWith('/v1/zones')) {
      config.baseURL = 'http://localhost:3008';
    }
    return config;
  },
  (error) => {
    // Handle the error
    return Promise.reject(error);
  },
);

export default axios;
