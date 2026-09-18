import { vaultRepository } from './vault.repository.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { NotFoundError } from '../../common/errors/custom-errors.js';

export const vaultLogic = {
  /**
   * Fetch user vault items with pagination & search
   */
  getVaultItems: async (userId, queryParams) => {
    const { page, limit, skip, take, search } = parsePaginationParams(queryParams);
    const { vaultItems, totalCount } = await vaultRepository.findPaginatedByUserId(userId, { skip, take, search });
    
    return buildPaginatedResponse({
      items: vaultItems,
      totalCount,
      page,
      limit,
    });
  },

  /**
   * Fetch single vault item by ID
   */
  getVaultItemById: async (id, userId) => {
    const item = await vaultRepository.findById(id, userId);
    if (!item) {
      throw new NotFoundError('Vault item not found or unauthorized');
    }
    return item;
  },

  /**
   * Update vault item details (updates underlying Post occasionName)
   */
  updateVaultItem: async (id, userId, payload) => {
    const existing = await vaultRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Vault item not found or unauthorized');
    }

    const updateData = {};
    if (payload.occasionName !== undefined) updateData.occasionName = payload.occasionName;

    await vaultRepository.update(id, userId, updateData);
    return vaultRepository.findById(id, userId);
  },

  /**
   * Delete item from Vault
   */
  deleteVaultItem: async (id, userId) => {
    const existing = await vaultRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Vault item not found or unauthorized');
    }
    return vaultRepository.delete(id, userId);
  },

  /**
   * Bulk delete items from Vault
   */
  bulkDeleteVaultItems: async (ids, userId) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { count: 0 };
    }
    return vaultRepository.deleteManyByIds(ids, userId);
  },
};
