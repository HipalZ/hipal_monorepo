import axiosConstructor from 'axios';
import { useUserToken } from '@/components/store/useUserToken';

const env =  process.env.NEXT_PUBLIC_APP_ENV as string;

const axios = axiosConstructor.create({
  baseURL:process.env.NEXT_PUBLIC_API_URL as string,

})


export default axios;