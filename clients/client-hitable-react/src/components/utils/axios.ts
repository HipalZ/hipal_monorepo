import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useUserToken } from '@/components/store/useUserToken';
import axiosConstructor from 'axios';

const env = import.meta.env.VITE_NODE_ENV as string;

const axios = axiosConstructor.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});
axios.interceptors.request.use(
  (config: any) => {
    if (config.url == undefined) {
      return;
    }
    
    if(!env){
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
    }

    const { accessToken, refreshToken } = useUserToken.getState();
    const accessTokenLite = useHiClientZ.getState().accessToken;
    const refreshTokenLite = useHiClientZ.getState().refreshToken;
    if (accessToken && refreshToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      config.headers['x-refresh-with'] = refreshToken;
    } else if (accessTokenLite && refreshTokenLite) {
      config.headers['Authorization'] = `Bearer ${accessTokenLite}`;
      config.headers['x-refresh-with'] = refreshTokenLite;
    }

    return config;
  },
  (error) => {
    // Handle the error
    // console.log('error',error);
    // toast.error(error?.response?.data?.message || error.message);
    // handleCatchErrors(error);
    return Promise.reject(error);
  },
);
export default axios;
