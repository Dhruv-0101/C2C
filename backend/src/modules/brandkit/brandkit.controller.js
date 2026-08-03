import { brandKitLogic } from './brandkit.logic.js';

export const brandKitController = {
  /**
   * GET /api/brandkit
   */
  getBrandKit: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const brandKit = await brandKitLogic.getBrandKit(userId);

      return res.status(200).json({
        success: true,
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
      const fileBuffer = req.file?.buffer;

      const brandKit = await brandKitLogic.updateBrandKit(userId, payload, fileBuffer);

      return res.status(200).json({
        success: true,
        message: 'BrandKit saved successfully',
        data: { brandKit },
      });
    } catch (error) {
      next(error);
    }
  },
};
