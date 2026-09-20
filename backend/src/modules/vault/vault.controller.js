import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as vaultLogic from './vault.logic.js';

/**
 * 🗄️ VAULT CONTROLLER (HTTP Presentation Layer)
 * Strictly orchestrates incoming HTTP requests, validates authorization, and dispatches to vault business logic.
 * Zero business logic or database queries exist in this layer.
 */

/**
 * GET /api/v1/vault
 * Fetch user's stored vault posts with pagination and search
 */
export async function getVaultItems(req, res, next) {
  try {
    const result = await vaultLogic.getVaultItems(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Vault items retrieved successfully',
      data: {
        data: result.data,
        vaultItems: result.data,
      },
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/vault/:id
 * Fetch single vault item by ID
 */
export async function getVaultItemById(req, res, next) {
  try {
    const item = await vaultLogic.getVaultItemById(req.params.id, req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Vault item retrieved successfully',
      data: { vaultItem: item },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/vault/:id
 * Update vault item details (e.g. occasion name)
 */
export async function updateVaultItem(req, res, next) {
  try {
    const updatedItem = await vaultLogic.updateVaultItem(req.params.id, req.user.id, req.body);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Vault item updated successfully',
      data: { vaultItem: updatedItem },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/vault/:id
 * Delete single vault item
 */
export async function deleteVaultItem(req, res, next) {
  try {
    await vaultLogic.deleteVaultItem(req.params.id, req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Vault item deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/vault/bulk-delete
 * Bulk delete vault items
 */
export async function bulkDeleteVaultItems(req, res, next) {
  try {
    const { ids } = req.body;
    const result = await vaultLogic.bulkDeleteVaultItems(ids, req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: `Successfully deleted ${result.count || ids.length} vault items`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Backwards-compatible object export
export const vaultController = {
  getVaultItems,
  getVaultItemById,
  updateVaultItem,
  deleteVaultItem,
  bulkDeleteVaultItems,
};
