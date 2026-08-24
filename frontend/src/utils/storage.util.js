import { logger } from "./logger.util";

/**
 * Utility functions for local storage operations with safe error handling
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.error(`Error reading key "${key}" from localStorage`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Error setting key "${key}" in localStorage`, error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Error removing key "${key}" from localStorage`, error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error("Error clearing localStorage", error);
    }
  },
};
