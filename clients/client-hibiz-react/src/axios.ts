import { API_URL } from "@/configs";
import axiosConstructor from "axios";
////
const axios = axiosConstructor.create({
  baseURL: API_URL,
});
//
axios.interceptors.request.use(
  (config: any) => {
    if (config.url === undefined) {
      return;
    }
    return config;
  },
  (error) => {
    // Handle the error
    return Promise.reject(error);
  },
);
export default axios;
