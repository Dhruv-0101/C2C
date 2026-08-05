import { env } from './env.js';

/**
 * Enterprise Production-Ready Logger Utility
 * Preserves custom icons/emojis in logs and formats output as structured JSON in Production mode.
 */
class Logger {
  formatMessage(level, message, meta = null) {
    const timestamp = new Date().toISOString();
    const isProd = env.NODE_ENV === 'production';

    if (isProd) {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(meta ? { meta } : {}),
      });
    }

    const defaultIcons = {
      info: 'ℹ️',
      success: '✅',
      warn: '⚠️',
      error: '💥',
      debug: '🔍',
    };

    const hasCustomIcon = typeof message === 'string' && /^\p{Extended_Pictographic}/u.test(message);
    const iconPrefix = hasCustomIcon ? '' : `${defaultIcons[level] || '📝'} `;
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';

    return `[${timestamp}] ${iconPrefix}${message}${metaStr}`;
  }

  info(message, meta) {
    console.log(this.formatMessage('info', message, meta));
  }

  success(message, meta) {
    console.log(this.formatMessage('success', message, meta));
  }

  warn(message, meta) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message, meta) {
    console.error(this.formatMessage('error', message, meta));
  }

  debug(message, meta) {
    if (env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
