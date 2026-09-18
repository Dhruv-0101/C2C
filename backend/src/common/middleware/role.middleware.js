import { ForbiddenError, UnauthorizedError } from '../errors/custom-errors.js';

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 */
export function authorize(...allowedRoles) {
  const flattenedRoles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (!flattenedRoles.includes(req.user.role) && !req.user.isAdmin) {
      return next(new ForbiddenError(`Access denied. Allowed roles: ${flattenedRoles.join(', ')}`));
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

/**
 * Require tab permission for SubAdmins (SuperAdmin bypasses automatically)
 * @param {string} tabId - Tab identifier (e.g. 'festivals', 'categories', 'frames', 'templates')
 */
export function requireTabPermission(tabId) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    // SuperAdmin has unrestricted access across all portal tabs
    if (req.user.isSuperAdmin) {
      return next();
    }

    // SubAdmin must possess granular tab clearance
    if (req.user.isSubAdmin || req.user.role === 'SUB_ADMIN') {
      const allowed = Array.isArray(req.user.allowedTabs) && req.user.allowedTabs.includes(tabId);
      if (allowed) {
        return next();
      }
      return next(
        new ForbiddenError(
          `Access denied. You do not have permission to access or modify the '${tabId}' section.`
        )
      );
    }

    // General user or unauthenticated
    return next(new ForbiddenError('Access denied. Administrator privileges required.'));
  };
}
