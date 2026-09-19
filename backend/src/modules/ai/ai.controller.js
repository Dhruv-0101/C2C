import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import { aiLogic } from './ai.logic.js';

export const aiController = {
  /**
   * POST /api/v1/ai/generate-caption
   * Generate AI caption & hashtags tailored to platform, tone, and brand kit
   */
  generateCaption: async (req, res, next) => {
    try {
      const result = await aiLogic.generateCaption(req.user.id, req.body);

      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'AI Caption generated successfully ✨',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/ai/suggest-hashtags
   * Get trending hashtags for a given topic
   */
  suggestHashtags: async (req, res, next) => {
    try {
      const result = await aiLogic.suggestHashtags(req.body);

      return sendSuccessResponse(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Suggested hashtags retrieved successfully #️⃣',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};

