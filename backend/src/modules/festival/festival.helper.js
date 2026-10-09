/**
 * 🎆 FESTIVAL DATA SANITIZER HELPER:
 * 
 * Strict Whitelist (Allowlist) Projections for Festival objects returned to the client.
 * Enforces Data Minimization Principles:
 * 1. Only fields strictly needed for calendar views, template pickers, and admin managers are exposed.
 * 2. Nested relationships (creator, templates, counts) are strictly projected with zero internal leakage.
 */

/**
 * Safely parses any boolean-like value (boolean, 'true', 'false', '1', '0', 1, 0)
 * @param {any} val - Input value to inspect
 * @param {boolean} [defaultValue=false] - Default boolean fallback
 * @returns {boolean}
 */
export function parseBoolean(val, defaultValue = false) {
  if (val === undefined || val === null || val === '') return defaultValue;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === 'true' || trimmed === '1') return true;
    if (trimmed === 'false' || trimmed === '0') return false;
  }
  return defaultValue;
}

export function sanitizeFestival(festival) {
  if (!festival) return null;

  return {
    id: festival.id,
    name: festival.name,
    slug: festival.slug,
    description: festival.description || null,
    date: festival.date,
    targetRegion: festival.targetRegion || 'India',
    bannerUrl: festival.bannerUrl || null,
    isActive: festival.isActive !== false,
    createdAt: festival.createdAt,
    updatedAt: festival.updatedAt,
    ...(festival.creator
      ? {
          creator: {
            id: festival.creator.id,
            fullName: festival.creator.fullName,
            email: festival.creator.email,
            role: festival.creator.role,
          },
        }
      : {}),
    ...(festival._count
      ? {
          _count: {
            templates: festival._count.templates || 0,
            posts: festival._count.posts || 0,
          },
        }
      : {}),
    ...(Array.isArray(festival.templates)
      ? {
          templates: festival.templates.map((t) => ({
            id: t.id,
            title: t.title,
            baseImageUrl: t.baseImageUrl,
            isActive: t.isActive,
            festivalId: t.festivalId || festival.id,
          })),
        }
      : {}),
  };
}
