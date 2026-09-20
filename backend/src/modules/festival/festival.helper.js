/**
 * 🎆 FESTIVAL DATA SANITIZER HELPER:
 * 
 * Strict Whitelist (Allowlist) Projections for Festival objects returned to the client.
 * Enforces Data Minimization Principles:
 * 1. Only fields strictly needed for calendar views, template pickers, and admin managers are exposed.
 * 2. Nested relationships (creator, templates, counts) are strictly projected with zero internal leakage.
 */

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
          })),
        }
      : {}),
  };
}
