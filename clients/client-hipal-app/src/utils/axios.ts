import axiosConstructor from "axios";

// Function to determine the base URL based on the environment
function getBaseURL(url: string): string {
  const mode = "development";
  let port;
  if (url.startsWith("/v1/businesses")) port = "8001";
  else if (url.startsWith("/v1/categories")) port = "8002";
  else if (url.startsWith("/v1/dishes")) port = "8003";
  else if (url.startsWith("/v1/kitchens")) port = "8004";
  else if (url.startsWith("/v1/payments")) port = "8005";
  else if (url.startsWith("/v1/settings")) port = "8006";
  else if (url.startsWith("/v1/users")) port = "8007";
  else if (url.startsWith("/v1/zones")) port = "8008";

  if (mode === "development" && port) {
    return `http://localhost:${port}`;
  } else {
    return "https://dev.api.hipal.life";
  }
}

const axios = axiosConstructor.create({
  withCredentials: true,
});

axios.interceptors.request.use(
  (config: any) => {
    if (config.url) {
      config.baseURL = getBaseURL(config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//TODO: Implement response error handling

export default axios;