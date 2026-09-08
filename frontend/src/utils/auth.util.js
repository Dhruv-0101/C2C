/**
 * Helper utility to determine post-authentication navigation path based on user role & RBAC tab permissions.
 */
export const getRoleRedirectPath = (user) => {
  if (!user) return "/welcome";

  const isSuperAdmin = Boolean(
    user.isSuperAdmin ||
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN"
  );

  const isSubAdmin = Boolean(
    user.isSubAdmin ||
    user.role === "SUBADMIN" ||
    user.role === "SUB_ADMIN"
  );

  if (isSuperAdmin) {
    return "/admin?tab=dashboard";
  }

  if (isSubAdmin) {
    const firstAllowed =
      Array.isArray(user.allowedTabs) && user.allowedTabs.length > 0
        ? user.allowedTabs[0]
        : "dashboard";
    return `/admin?tab=${firstAllowed}`;
  }

  return "/dashboard";
};
