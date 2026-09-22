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

/**
 * Generates a 100% transparent SVG overlay URI from configJson/blueprint elements.
 * Used as a guaranteed transparent overlay fallback when no external PNG is uploaded.
 * @param {Array|Object} elementsOrConfig - Array of frame elements or config object
 * @returns {string} data:image/svg+xml Data URI
 */
export function createSvgOverlayUri(elementsOrConfig) {
  let elements = [];
  if (Array.isArray(elementsOrConfig)) {
    elements = elementsOrConfig;
  } else if (elementsOrConfig?.elements && Array.isArray(elementsOrConfig.elements)) {
    elements = elementsOrConfig.elements;
  }

  if (elements.length > 0) {
    const svgShapes = elements
      .filter(
        (el) =>
          el.slotCategory === 'STATIC_SHAPE' ||
          el.dynamicSlot === 'NONE' ||
          el.dynamicSlot === 'AVATAR_CIRCLE' ||
          (el.type !== 'TEXT' && el.type !== 'IMAGE_SLOT')
      )
      .map((el) => {
        const fill = encodeURIComponent(el.fillColor || 'none');
        const stroke = encodeURIComponent(el.borderColor || 'transparent');
        const strokeWidth = el.borderWidth || 0;

        if (el.type === 'CAPSULE') {
          const rx = el.height / 2;
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        } else if (el.type === 'CIRCLE') {
          const cx = el.x + el.width / 2;
          const cy = el.y + (el.height || el.width) / 2;
          const r = el.width / 2;
          const circleFill = el.dynamicSlot === 'AVATAR_CIRCLE' ? 'none' : fill;
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${circleFill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        } else {
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        }
      })
      .join('');

    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${svgShapes}</svg>`;
    return `data:image/svg+xml;utf8,${svgStr}`;
  }

  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"></svg>';
}

