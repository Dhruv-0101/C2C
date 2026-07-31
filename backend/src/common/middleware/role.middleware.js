import { ForbiddenError, UnauthorizedError } from '../errors/custom-errors.js';

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (!allowedRoles.includes(req.user.role) && !req.user.isAdmin) {
      return next(new ForbiddenError(`Access denied. Allowed roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

/**
 * Require SuperAdmin privilege
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return next(new UnauthorizedError('User authentication required'));
  }

  if (!req.user.isSuperAdmin) {
    return next(new ForbiddenError('Access denied. Only SuperAdmin can perform this action.'));
  }

  next();
}

/**
 * Require Admin privilege (SuperAdmin or SubAdmin)
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new UnauthorizedError('User authentication required'));
  }

  if (!req.user.isAdmin) {
    return next(new ForbiddenError('Access denied. Admin access required.'));
  }

  next();
}
