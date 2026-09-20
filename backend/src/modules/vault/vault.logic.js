import * as vaultRepository from './vault.repository.js';
import {
  parsePaginationParams,
  buildPaginatedResponse,
} from '../../common/helpers/pagination.helper.js';
import { NotFoundError } from '../../common/errors/custom-errors.js';
import {
  sanitizeVaultItem,
  sanitizeVaultItems,
} from './vault.helper.js';
import {
  DEFAULT_VAULT_SORT_BY,
  DEFAULT_VAULT_SORT_ORDER,
  VAULT_ALLOWED_SORT_FIELDS,
} from './vault.constants.js';

/**
 * 🗄️ VAULT LOGIC (Business & Application Layer)
 * Strictly encapsulates business rules, pagination, ownership security, and response formatting for Graphic Vault.
 * Zero HTTP presentation concerns or direct database queries exist in this layer.
 */

/**
 * Fetch user vault items with pagination, search, and sorting
 * @param {string} userId - Authenticated user ID
 * @param {Object} [queryParams={}] - Query parameters
 * @returns {Promise<{ data: Array<Object>, meta: Object }>}
 */
export async function getVaultItems(userId, queryParams = {}) {
  const { page, limit, skip, take, search, sortBy, sortOrder } = parsePaginationParams(
    queryParams,
    DEFAULT_VAULT_SORT_BY,
    DEFAULT_VAULT_SORT_ORDER,
    VAULT_ALLOWED_SORT_FIELDS
  );

  const { vaultItems, totalCount } = await vaultRepository.findPaginatedByUserId(userId, {
    skip,
    take,
    search,
    sortBy,
    sortOrder,
  });

  const paginatedResult = buildPaginatedResponse({
    items: sanitizeVaultItems(vaultItems),
    totalCount,
    page,
    limit,
  });

  return {
    data: paginatedResult.data,
    meta: paginatedResult.meta,
  };
}

/**
 * Fetch single vault item by ID and User ID
 * @param {string} id - VaultItem UUID
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<Object>}
 */
export async function getVaultItemById(id, userId) {
  const item = await vaultRepository.findById(id, userId);
  if (!item) {
    throw new NotFoundError('Vault item not found or unauthorized');
  }
  return sanitizeVaultItem(item);
}

/**
 * Update vault item details (updates underlying Post occasionName)
 * @param {string} id - VaultItem UUID
 * @param {string} userId - Authenticated user ID
 * @param {Object} [payload={}] - Update payload
 * @returns {Promise<Object>}
 */
export async function updateVaultItem(id, userId, payload = {}) {
  const existing = await vaultRepository.findById(id, userId);
  if (!existing) {
    throw new NotFoundError('Vault item not found or unauthorized');
  }

  const updateData = {};
  if (payload.occasionName !== undefined) {
    updateData.occasionName = payload.occasionName.trim();
  }

  await vaultRepository.update(id, userId, updateData);
  const updated = await vaultRepository.findById(id, userId);
  return sanitizeVaultItem(updated);
}

/**
 * Delete item from Vault
 * @param {string} id - VaultItem UUID
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<{ count: number }>}
 */
export async function deleteVaultItem(id, userId) {
  const existing = await vaultRepository.findById(id, userId);
  if (!existing) {
    throw new NotFoundError('Vault item not found or unauthorized');
  }
  return vaultRepository.deleteVaultItem(id, userId);
}

/**
 * Bulk delete items from Vault
 * @param {Array<string>} [ids=[]] - Array of VaultItem UUIDs
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<{ count: number }>}
 */
export async function bulkDeleteVaultItems(ids = [], userId) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { count: 0 };
  }
  return vaultRepository.deleteManyByIds(ids, userId);
}

// Backwards-compatible object export
export const vaultLogic = {
  getVaultItems,
  getVaultItemById,
  updateVaultItem,
  deleteVaultItem,
  bulkDeleteVaultItems,
};
