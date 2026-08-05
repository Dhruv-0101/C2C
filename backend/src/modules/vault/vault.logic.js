import { vaultRepository } from './vault.repository.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { NotFoundError } from '../../common/errors/custom-errors.js';

export const vaultLogic = {
  /**
   * Fetch user vault items with pagination & search
   */
  getVaultItems: async (userId, queryParams) => {
    // Auto-sync any existing post graphics into VaultItems if missing
    await vaultRepository.syncUserPostsToVault(userId);

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
   * Update vault item details (occasionName, categoryName, graphicUrl)
   */
  updateVaultItem: async (id, userId, payload) => {
    const existing = await vaultRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Vault item not found or unauthorized');
    }

    const updateData = {};
    if (payload.occasionName !== undefined) updateData.occasionName = payload.occasionName;
    if (payload.categoryName !== undefined) updateData.categoryName = payload.categoryName;
    if (payload.graphicUrl !== undefined) updateData.graphicUrl = payload.graphicUrl;

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
};
