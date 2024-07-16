import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60 * 60 * 2,
  withCredentials: true,
});

export default axiosInstance;
