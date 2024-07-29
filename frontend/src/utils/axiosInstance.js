import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 2 * 60 * 1000, // 2 minutes
  withCredentials: true,
});

export default axiosInstance;
