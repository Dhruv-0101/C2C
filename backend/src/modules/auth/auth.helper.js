/**
 * 🛡️ AUTH DATA SANITIZER HELPER:
 * 
 * Strict Whitelist (Allowlist) Projections for objects returned to the client.
 * Enforces OWASP Data Minimization Principles:
 * 1. Only properties strictly required by the frontend UI and business workflows are exposed.
 * 2. Internal credentials, hashes, secrets, and raw gateway identifiers are strictly filtered out.
 * 3. Guarantees that sensitive data (passwordHash, twoFactorSecret, backupCodes, googleId)
 *    NEVER accidentally leak to the client under any circumstances.
 */

/**
 * Sanitize Subscription Object for client response
 * Strips raw internal gateway identifiers/keys while preserving quota and display details
 */
export function sanitizeSubscription(subscription) {
  if (!subscription) return null;

  return {
    id: subscription.id,
    plan: subscription.plan,
    status: subscription.status,
    totalPostsAllowed: subscription.totalPostsAllowed || 0,
    postsUsed: subscription.postsUsed || 0,
    bonusPostsAllowed: subscription.bonusPostsAllowed || 0,
    bonusPostsUsed: subscription.bonusPostsUsed || 0,
    pricePaid: subscription.pricePaid || 0,
    currency: subscription.currency || 'INR',
    paymentGateway: subscription.paymentGateway || null,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}

/**
 * Sanitize BrandKit Object for client response
 * Only returns customer-facing branding metadata
 */
export function sanitizeBrandKit(brandKit) {
  if (!brandKit) return null;

  return {
    businessName: brandKit.businessName,
    phone: brandKit.phone || null,
    city: brandKit.city || null,
    state: brandKit.state || null,
    country: brandKit.country || null,
    ...(brandKit.logoUrl ? { logoUrl: brandKit.logoUrl } : {}),
    ...(brandKit.website ? { website: brandKit.website } : {}),
  };
}

/**
 * Sanitize User Object for client response
 * Strict allowlist projection guaranteeing zero leakage
 */
export function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl || null,
    role: user.role,
    isAdmin: Boolean(user.isAdmin),
    isSuperAdmin: Boolean(user.isSuperAdmin),
    isSubAdmin: Boolean(user.isSubAdmin),
    allowedTabs: Array.isArray(user.allowedTabs) ? user.allowedTabs : [],
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
    isGoogleRegistered: Boolean(user.isGoogleRegistered),
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.subscription ? { subscription: sanitizeSubscription(user.subscription) } : {}),
    ...(user.brandKit ? { brandKit: sanitizeBrandKit(user.brandKit) } : {}),
  };
}
