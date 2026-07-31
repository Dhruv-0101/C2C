import { env } from '../../config/env.js';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});
