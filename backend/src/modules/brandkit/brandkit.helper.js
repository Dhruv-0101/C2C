/**
 * 🏢 BRANDKIT DATA SANITIZER HELPER:
 * 
 * Strict Whitelist (Allowlist) Projections for BrandKit objects returned to the client.
 * Enforces OWASP Data Minimization Principles:
 * 1. Exposes only fields required by the brand kit editor, poster compositor, and social scheduler.
 * 2. Whitelists category relation ({ id, name, slug }) with zero internal leakage.
 * 3. Never leaks internal foreign keys or sensitive metadata.
 */

/**
 * Sanitize a single BrandKit entity
 * @param {Object} brandKit - Raw Prisma BrandKit entity or default fallback
 * @returns {Object|null} Sanitized BrandKit object
 */
export function sanitizeBrandKit(brandKit) {
  if (!brandKit) return null;

  return {
    id: brandKit.id || null,
    userId: brandKit.userId,
    businessName: brandKit.businessName,
    categoryId: brandKit.categoryId || null,
    category: brandKit.category
      ? {
          id: brandKit.category.id,
          name: brandKit.category.name,
          slug: brandKit.category.slug,
        }
      : null,
    logoUrl: brandKit.logoUrl || null,
    avatarUrl: brandKit.avatarUrl || null,
    phone: brandKit.phone || null,
    whatsapp: brandKit.whatsapp || null,
    email: brandKit.email || null,
    instagramHandle: brandKit.instagramHandle || null,
    facebookHandle: brandKit.facebookHandle || null,
    address: brandKit.address || null,
    city: brandKit.city || null,
    state: brandKit.state || null,
    country: brandKit.country || 'India',
    tagline: brandKit.tagline || null,
    targetAudience: brandKit.targetAudience || null,
    captionLanguage: brandKit.captionLanguage || 'English',
    businessUsps: brandKit.businessUsps || null,
    linkedinHandle: brandKit.linkedinHandle || null,
    gmbReviewUrl: brandKit.gmbReviewUrl || null,
    upiVpa: brandKit.upiVpa || null,
    upiQrUrl: brandKit.upiQrUrl || null,
    workingHours: brandKit.workingHours || null,
    createdAt: brandKit.createdAt || null,
    updatedAt: brandKit.updatedAt || null,
    ...(brandKit.syncedPendingPostsCount !== undefined
      ? { syncedPendingPostsCount: brandKit.syncedPendingPostsCount }
      : {}),
  };
}
