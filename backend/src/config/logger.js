import { env } from './env.js';

/**
 * Enterprise Production-Ready Logger Utility
 * Preserves custom icons/emojis in logs and formats output as structured JSON in Production mode.
 */
class Logger {
  normalizeError(err) {
    if (!(err instanceof Error)) return err;
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.code ? { code: err.code } : {}),
      ...(err.statusCode ? { statusCode: err.statusCode } : {}),
    };
  }

  formatMessage(level, message, meta = null) {
    const timestamp = new Date().toISOString();
    const isProd = env.NODE_ENV === 'production';

    const isMessageError = message instanceof Error;
    const resolvedMessage = isMessageError ? message.message : String(message ?? '');
    const errorStack = isMessageError ? message.stack : undefined;

    let resolvedMeta = meta;
    if (meta instanceof Error) {
      resolvedMeta = this.normalizeError(meta);
    } else if (meta && typeof meta === 'object') {
      resolvedMeta = { ...meta };
      for (const [key, val] of Object.entries(resolvedMeta)) {
        if (val instanceof Error) {
          resolvedMeta[key] = this.normalizeError(val);
        }
      }
    }

    if (isProd) {
      return JSON.stringify({
        timestamp,
        level,
        message: resolvedMessage,
        ...(errorStack ? { stack: errorStack } : {}),
        ...(resolvedMeta ? { meta: resolvedMeta } : {}),
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
    const metaStr = resolvedMeta ? ` | ${JSON.stringify(resolvedMeta)}` : '';
    const stackStr = errorStack ? `\n${errorStack}` : '';

    return `[${timestamp}] ${iconPrefix}${resolvedMessage}${metaStr}${stackStr}`;
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
