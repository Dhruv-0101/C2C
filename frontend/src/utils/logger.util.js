/**
 * Logger Utility for Enterprise Frontend Logging
 * Replaces direct console.log/error/warn calls across the application.
 *
 * - Development: Formatted logs with timestamps and emoji icons.
 * - Production: Suppresses verbose debug logs and formats JSON structures for error monitoring.
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(`ℹ️ [INFO] ${new Date().toLocaleTimeString()} - ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`⚠️ [WARN] ${new Date().toLocaleTimeString()} - ${message}`, ...args);
    }
  },

  error: (message, error = null, ...args) => {
    if (isDevelopment) {
      console.error(`💥 [ERROR] ${new Date().toLocaleTimeString()} - ${message}`, error || "", ...args);
    } else {
      // Production: structured logging format
      console.error(
        JSON.stringify({
          level: "error",
          timestamp: new Date().toISOString(),
          message,
          errorName: error?.name || "Error",
          errorMessage: error?.message || String(error),
        }),
      );
    }
  },

  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(`🐛 [DEBUG] ${new Date().toLocaleTimeString()} - ${message}`, ...args);
    }
  },
};
