import { aiLogic } from './ai.logic.js';
import { generateCaptionSchema, suggestHashtagsSchema } from './ai.validator.js';

export const aiController = {
  /**
   * POST /api/v1/ai/generate-caption
   * Generate AI caption & hashtags tailored to platform, tone, and brand kit
   */
  generateCaption: async (req, res, next) => {
    try {
      const validatedBody = generateCaptionSchema.parse(req.body);
      const result = await aiLogic.generateCaption(req.user.id, validatedBody);

      return res.status(200).json({
        success: true,
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
      const validatedBody = suggestHashtagsSchema.parse(req.body);
      const result = await aiLogic.suggestHashtags(validatedBody);

      return res.status(200).json({
        success: true,
        message: 'Suggested hashtags retrieved successfully #️⃣',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
