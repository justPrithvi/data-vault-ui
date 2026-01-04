// app/lib/apiClient.ts
import axios from "axios";
import { getLogoutFn } from "@/context/AuthContext";
// create instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/",
});

// request interceptor → attach token if available
api.interceptors.request.use(
  (config) => {
    // get token from localStorage (or context if you inject it here)
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor → handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const logoutFn = getLogoutFn()
      if (logoutFn) logoutFn()
    }
    return Promise.reject(error);
  }
);

export default api;
