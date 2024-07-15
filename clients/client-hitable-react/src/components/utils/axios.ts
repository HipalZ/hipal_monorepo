import { BASE_URL } from '@/configs';
import axiosConstructor from 'axios';

const axios = axiosConstructor.create({
  baseURL: BASE_URL,
});

axios.interceptors.request.use(
  (config: any) => {
    if (config.url == undefined) {
      return;
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
