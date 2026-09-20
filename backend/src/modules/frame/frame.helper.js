/**
 * 🖼️ FRAME DATA SANITIZER HELPER
 * 
 * Strict Whitelist (Allowlist) Projections for Frame objects returned to the client.
 * Enforces OWASP Data Minimization Principles:
 * 1. Exposes only attributes strictly needed by the canvas compositor, frame picker, and admin management UI.
 * 2. Nested relationships (creator, relations) are strictly projected without leaking internal credentials or audit details.
 */

/**
 * Sanitize a single frame object
 * @param {Object} frame - Raw frame record from database
 * @returns {Object|null} Sanitized frame
 */
export function sanitizeFrame(frame) {
  if (!frame) return null;

  return {
    id: frame.id,
    title: frame.title,
    description: frame.description || null,
    overlayPngUrl: frame.overlayPngUrl,
    previewUrl: frame.previewUrl || null,
    configJson: frame.configJson || null,
    isActive: frame.isActive,
    createdAt: frame.createdAt,
    updatedAt: frame.updatedAt,
    ...(frame.creator
      ? {
          creator: {
            id: frame.creator.id,
            fullName: frame.creator.fullName,
            email: frame.creator.email,
            role: frame.creator.role,
          },
        }
      : {}),
    ...(frame._count
      ? {
          _count: {
            posts: frame._count.posts || 0,
          },
        }
      : {}),
  };
}

/**
 * Sanitize an array of frame objects
 * @param {Array<Object>} frames - Raw frame records from database
 * @returns {Array<Object>} Sanitized frames array
 */
export function sanitizeFrames(frames) {
  if (!Array.isArray(frames)) return [];
  return frames.map(sanitizeFrame);
}
