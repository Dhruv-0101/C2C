import { frameLogic } from './frame.logic.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';

export const frameController = {
  /**
   * GET /api/frames
   */
  getFrames: async (req, res, next) => {
    try {
      const result = await frameLogic.getFrames(req.query);
      return sendSuccessResponse(res, {
        message: 'Frames retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/frames
   */
  createFrame: async (req, res, next) => {
    try {
      const payload = req.body;
      const fileBuffer = req.file?.buffer;

      const frame = await frameLogic.createFrame(payload, fileBuffer);

      return res.status(201).json({
        success: true,
        message: 'Frame created successfully',
        data: { frame },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/frames/:id
   */
  deleteFrame: async (req, res, next) => {
    try {
      const { id } = req.params;
      await frameLogic.deleteFrame(id);

      return res.status(200).json({
        success: true,
        message: 'Frame deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
