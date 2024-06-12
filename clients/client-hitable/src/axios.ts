import axiosConstructor from 'axios';
import { useUserToken } from './components/store/useUserToken';
const axios = axiosConstructor.create({
  // baseURL: process.env.NEXT_PUBLIC_API_HOST,
  withCredentials: true,
});

axios.interceptors.request.use(
  (config) => {
    const { accessToken, refreshToken } = useUserToken.getState(); // Ensure you're getting the latest tokens

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers['x-refresh-with'] = refreshToken;
    }
    // Modify the baseURL based on the request URL
    if (config.url.startsWith('/v1/businesses')) {
      config.baseURL = 'http://localhost:8001';
    } else if (config.url.startsWith('/v1/categories')) {
      config.baseURL = 'http://localhost:8002';
    } else if (config.url.startsWith('/v1/dishes')) {
      config.baseURL = 'http://localhost:8003';
    } else if (config.url.startsWith('/v1/kitchens')) {
      config.baseURL = 'http://localhost:8004';
    } else if (config.url.startsWith('/v1/payments')) {
      config.baseURL = 'http://localhost:8005';
    } else if (config.url.startsWith('/v1/settings')) {
      config.baseURL = 'http://localhost:8006';
    } else if (config.url.startsWith('/v1/users')) {
      config.baseURL = 'http://localhost:8007';
    } else if (config.url.startsWith('/v1/zones')) {
      config.baseURL = 'http://localhost:8008';
    }
    return config;
  },
  (error) => {
    // Handle the error
    return Promise.reject(error);
  },
);
export default axios;
