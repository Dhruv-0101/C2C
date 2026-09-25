import axios from "axios";
import { API_BASE_URL } from "./api.endpoints";
import { setupInterceptors } from "./interceptors";

/**
 * Enterprise Axios Client Singleton
 * Configured with baseURL, credentials, timeout, and auth interceptors.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT refresh rotation and error interceptors
setupInterceptors(api);

export const apiClient = api;
export default api;
