import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./api.endpoints";
import { STORAGE_KEYS } from '@/shared/constants';
import { storage } from '@/shared/utils/storage.util';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Attaches request and response interceptors to Axios instance
 * @param {import('axios').AxiosInstance} axiosInstance
 */
export const setupInterceptors = (axiosInstance) => {
  // Request Interceptor: Attach Access Token if present & auto-handle FormData
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response Interceptor: Silent Network Retry & Silent Refresh on 401 Unauthorized
  axiosInstance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      const originalRequest = error.config;

      // 1. Automatic 1-Shot Retry for Transient Network Hiccups / Cold Starts
      if (
        originalRequest &&
        !originalRequest._networkRetry &&
        (!error.response || error.code === "ERR_NETWORK" || error.message === "Network Error")
      ) {
        originalRequest._networkRetry = true;
        console.warn("⚠️ Transient network error detected. Retrying request automatically...");
        await new Promise((resolve) => setTimeout(resolve, 400));
        return axiosInstance(originalRequest);
      }

      // 2. User-Friendly Error Formatting
      const rawMsg = error.response?.data?.message || error.message;
      let formattedMessage = rawMsg || "An unexpected error occurred";

      if (!error.response || error.code === "ERR_NETWORK" || rawMsg === "Network Error") {
        formattedMessage = "Unable to connect to server. Please check your network connection or try again.";
      } else if (error.response?.status === 401) {
        formattedMessage = rawMsg || "Session expired or authentication failed. Please log in again.";
      }

      const formattedError = {
        message: formattedMessage,
        errors: error.response?.data?.errors || [],
        status: error.response?.status || 500,
      };

      // 3. Silent Refresh on 401 Unauthorized
      const hasToken = Boolean(storage.get(STORAGE_KEYS.ACCESS_TOKEN));

      if (
        error.response?.status === 401 &&
        hasToken &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) &&
        !originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Trigger silent refresh via HTTP-Only cookie
          const refreshResponse = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            { withCredentials: true },
          );

          const { accessToken, user } = refreshResponse.data.data;

          storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (user) {
            storage.set(STORAGE_KEYS.USER_DATA, user);
          }

          processQueue(null, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
          storage.remove(STORAGE_KEYS.USER_DATA);

          // Redirect to login only if user was on a protected workspace route
          const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
          const isPublicRoute =
            currentPath === "/" ||
            currentPath.startsWith("/welcome") ||
            currentPath.startsWith("/login") ||
            currentPath.startsWith("/register") ||
            currentPath.startsWith("/forgot-password") ||
            currentPath.startsWith("/reset-password");

          if (typeof window !== "undefined" && !isPublicRoute) {
            window.location.href = "/login";
          }
          return Promise.reject(formattedError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(formattedError);
    },
  );

  return axiosInstance;
};

export default setupInterceptors;
