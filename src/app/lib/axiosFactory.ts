// Axios instance factory with shared interceptor configuration
import axios, { AxiosInstance } from "axios";
import { getLogoutFn } from "@/context/AuthContext";

/**
 * Creates an axios instance with authentication and error handling interceptors
 * @param baseURL - The base URL for the service
 * @returns Configured axios instance
 */
export const createAuthenticatedAxios = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
  });

  // Request interceptor: Attach JWT token to all requests
  instance.interceptors.request.use(
    (config) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 401 errors globally
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const logoutFn = getLogoutFn();
        if (logoutFn) logoutFn();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

