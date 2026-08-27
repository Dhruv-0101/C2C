import { templateLogic } from './template.logic.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';

export const templateController = {
  uploadAdminTemplate: async (req, res, next) => {
    try {
      const template = await templateLogic.uploadAdminTemplate({
        fileBuffer: req.fileBuffer,
        base64Image: req.body?.base64Image,
        title: req.body?.title,
        description: req.body?.description,
        festivalId: req.body?.festivalId,
        categoryId: req.body?.categoryId,
        styleId: req.body?.styleId,
        creatorId: req.user?.id,
      });

      return res.status(201).json({
        success: true,
        message: 'Base festival template uploaded to Cloudinary successfully.',
        data: { template },
      });
    } catch (error) {
      next(error);
    }
  },

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

  getCategories: async (req, res, next) => {
    try {
      const categories = await templateLogic.getCategories();
      return sendSuccessResponse(res, {
        message: 'Template categories retrieved successfully',
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  },

  getTemplates: async (req, res, next) => {
    try {
      const result = await templateLogic.getTemplates(req.query);
      return sendSuccessResponse(res, {
        message: 'Templates retrieved successfully',
        data: result.data,
        meta: result.meta,
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
