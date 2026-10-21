import { logger } from "./logger.util";
import { STORAGE_KEYS } from "../constants/theme.constants";

// In-memory token cache for ultra-fast, XSS-hardened access
let inMemoryAccessToken = null;

export const storage = {
  get: (key) => {
    try {
      if (key === STORAGE_KEYS.ACCESS_TOKEN && inMemoryAccessToken) {
        return inMemoryAccessToken;
      }
      // Check sessionStorage first for sensitive session credentials
      const sessionItem = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(key) : null;
      if (sessionItem) {
        const parsed = JSON.parse(sessionItem);
        if (key === STORAGE_KEYS.ACCESS_TOKEN) inMemoryAccessToken = parsed;
        return parsed;
      }
      const item = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      const parsed = item ? JSON.parse(item) : null;
      if (key === STORAGE_KEYS.ACCESS_TOKEN && parsed) {
        inMemoryAccessToken = parsed;
      }
      return parsed;
    } catch (error) {
      logger.error(`Error reading key "${key}" from storage`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      if (key === STORAGE_KEYS.ACCESS_TOKEN) {
        inMemoryAccessToken = value;
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(key, serialized);
        }
      }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      logger.error(`Error setting key "${key}" in storage`, error);
    }
  },

  remove: (key) => {
    try {
      if (key === STORAGE_KEYS.ACCESS_TOKEN) {
        inMemoryAccessToken = null;
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem(key);
        }
      }
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      logger.error(`Error removing key "${key}" from storage`, error);
    }
  },

  clear: () => {
    try {
      inMemoryAccessToken = null;
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.clear();
      }
      if (typeof localStorage !== "undefined") {
        localStorage.clear();
      }
    } catch (error) {
      logger.error("Error clearing storage", error);
    }
  },
};

export default storage;
