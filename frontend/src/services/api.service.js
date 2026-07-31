import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../constants/api.constants";
import { STORAGE_KEYS } from "../constants/theme.constants";
import { storage } from "../utils/storage.util";

/**
 * Enterprise Axios Instance
 * Handles baseURL, credentials (cookies), request interceptors (Bearer token),
 * and response interceptors (silent refresh rotation & error normalization).
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HTTP-Only Cookies for refresh token
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token if present
api.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Silent Refresh on 401 Unauthorized
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

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Normalize error message
    const formattedError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      errors: error.response?.data?.errors || [],
      status: error.response?.status || 500,
    };

    // If 401 Unauthorized and not already retrying
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes(API_ENDPOINTS.AUTH.LOGIN) &&
      !originalRequest.url.includes(API_ENDPOINTS.AUTH.REFRESH)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
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
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.USER_DATA);

        // Redirect to login if unauthenticated session
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
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

export default api;
