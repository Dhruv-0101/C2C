import { sanitizePost } from '../post/post.helper.js';

/**
 * 🗄️ VAULT DATA SANITIZER HELPER
 * 
 * Strict Whitelist (Allowlist) Projections for VaultItem objects.
 * Enforces OWASP Data Minimization Principles:
 * 1. Exposes only attributes needed by Graphic Vault UI and consumer features.
 * 2. Nested Post relationships are sanitized via sanitizePost to avoid leaking internal user credentials or private data.
 */

/**
 * Sanitize a single vault item record
 * @param {Object} item - Raw vault item record from database
 * @returns {Object|null} Sanitized vault item object
 */
export function sanitizeVaultItem(item) {
  if (!item) return null;

  return {
    id: item.id,
    userId: item.userId,
    postId: item.postId,
    createdAt: item.createdAt,
    post: item.post ? sanitizePost(item.post) : null,
  };
}

/**
 * Sanitize an array of vault item records
 * @param {Array<Object>} items - Array of raw vault item records
 * @returns {Array<Object>} Array of sanitized vault item objects
 */
export function sanitizeVaultItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(sanitizeVaultItem).filter(Boolean);
}
