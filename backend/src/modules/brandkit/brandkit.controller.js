import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import { brandKitLogic } from './brandkit.logic.js';

export const brandKitController = {
  /**
   * GET /api/brandkit
   */
  getBrandKit: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const brandKit = await brandKitLogic.getBrandKit(userId);

      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'BrandKit retrieved successfully',
        data: { brandKit },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/brandkit
   */
  updateBrandKit: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const payload = req.body;
      const fileBuffer = req.fileBuffer || req.file?.buffer;

      const brandKit = await brandKitLogic.updateBrandKit(userId, payload, fileBuffer);

      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'BrandKit saved successfully',
        data: { brandKit },
      });
    } catch (error) {
      next(error);
    }
  },
};
