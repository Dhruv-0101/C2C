import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as brandKitLogic from './brandkit.logic.js';

/**
 * 🏢 GET /api/v1/brandkit
 * Retrieve the authenticated user's active BrandKit identity profile
 */
export async function getBrandKit(req, res, next) {
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
}

/**
 * 🏢 PUT /api/v1/brandkit
 * Create or update the authenticated user's BrandKit identity profile
 */
export async function updateBrandKit(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = req.body;
    const fileBuffers = req.brandKitFiles || (req.fileBuffer ? { logo: req.fileBuffer } : {});

    const brandKit = await brandKitLogic.updateBrandKit(userId, payload, fileBuffers);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'BrandKit saved successfully',
      data: { brandKit },
    });
  } catch (error) {
    next(error);
  }
}
