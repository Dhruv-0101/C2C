import { vaultLogic } from './vault.logic.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export const vaultController = {
  /**
   * GET /api/v1/vault - Fetch user's stored vault posts with pagination
   */
  getVaultItems: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const result = await vaultLogic.getVaultItems(userId, req.query);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Vault items retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/vault/:id - Fetch single vault item
   */
  getVaultItemById: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const item = await vaultLogic.getVaultItemById(req.params.id, userId);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Vault item retrieved successfully',
        data: { vaultItem: item },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/vault/:id - Update vault item details
   */
  updateVaultItem: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const updatedItem = await vaultLogic.updateVaultItem(req.params.id, userId, req.body);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Vault item updated successfully',
        data: { vaultItem: updatedItem },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/vault/:id - Delete vault item
   */
  deleteVaultItem: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      await vaultLogic.deleteVaultItem(req.params.id, userId);
      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Vault item deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
