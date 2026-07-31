import { templateLogic } from './template.logic.js';

export const templateController = {
  createTemplate: async (req, res, next) => {
    try {
      const template = await templateLogic.createTemplate(req.body, req.user?.id);
      return res.status(201).json({
        success: true,
        message: 'System template uploaded successfully.',
        data: { template },
      });
    } catch (error) {
      next(error);
    }
  },

  getTemplates: async (req, res, next) => {
    try {
      const templates = await templateLogic.getTemplates(req.query);
      return res.status(200).json({
        success: true,
        data: { templates },
      });
    } catch (error) {
      next(error);
    }
  },

  compositePost: async (req, res, next) => {
    try {
      const result = await templateLogic.compositePost(req.body);
      return res.status(200).json({
        success: true,
        message: 'Post composited successfully with Sharp.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteTemplate: async (req, res, next) => {
    try {
      await templateLogic.deleteTemplate(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Template deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
};
