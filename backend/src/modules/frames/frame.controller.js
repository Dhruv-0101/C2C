import { frameLogic } from './frame.logic.js';

export const frameController = {
  /**
   * GET /api/frames
   */
  getFrames: async (req, res, next) => {
    try {
      const frames = await frameLogic.getAllFrames();
      return res.status(200).json({
        success: true,
        message: 'Frames retrieved successfully',
        data: { frames },
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
