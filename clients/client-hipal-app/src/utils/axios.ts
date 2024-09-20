import axiosConstructor from "axios";
const axios = axiosConstructor.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL as string,
});
////
/////
export default axios;
