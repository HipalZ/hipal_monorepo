import { BASE_URL } from '@/configs';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useUserToken } from '@/components/store/useUserToken';
import axiosConstructor from 'axios';

const axios = axiosConstructor.create({
  baseURL: BASE_URL,
});

axios.interceptors.request.use(
  (config: any) => {
    if (config.url == undefined) {
      return;
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
