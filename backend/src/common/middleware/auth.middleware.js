import { UnauthorizedError } from '../errors/custom-errors.js';
import { verifyAccessToken } from '../helpers/token.helper.js';

/**
 * Middleware to authenticate requests via JWT Bearer Token
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required in Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.isPending2FA) {
      throw new UnauthorizedError('Two-factor authentication code required before access.');
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isAdmin: Boolean(decoded.isAdmin),
      isSuperAdmin: Boolean(decoded.isSuperAdmin),
      isSubAdmin: Boolean(decoded.isSubAdmin),
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired access token'));
    }
    next(error);
  }
}
