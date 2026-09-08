import { templateLogic } from './template.logic.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';

export const templateController = {
  /**
   * 🎨 POST /api/v1/templates & POST /api/v1/templates/upload
   * Unified Master System Template Creation Endpoint
   * - Accepts File Attachment (multipart form-data), Base64 Image string, or Direct Image URL
   * - Uploads raw image to Cloudinary ('brandflow/festival-templates') and saves metadata in PostgreSQL
   */
  createTemplate: async (req, res, next) => {
    try {
      const template = await templateLogic.createTemplate(
        {
          fileBuffer: req.fileBuffer || req.file?.buffer,
          base64Image: req.body?.base64Image,
          baseImageUrl: req.body?.baseImageUrl,
          title: req.body?.title,
          description: req.body?.description,
          festivalId: req.body?.festivalId,
          categoryId: req.body?.categoryId,
          styleId: req.body?.styleId,
          category: req.body?.category,
          newCategoryName: req.body?.newCategoryName,
        },
        req.user?.id
      );

      return res.status(201).json({
        success: true,
        message: 'System template created & published successfully.',
        data: { template },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 📤 Helper alias mapping /upload route to the unified createTemplate handler
   */
  uploadAdminTemplate: (req, res, next) => {
    return templateController.createTemplate(req, res, next);
  },

  /**
   * 📂 GET /api/v1/templates/categories
   * Get Master Template Categories List
   * - Public / User accessible list of available business categories for template grouping
   */
  getCategories: async (req, res, next) => {
    try {
      const result = await templateLogic.getCategories(req.query);
      return sendSuccessResponse(res, {
        message: 'Template categories retrieved successfully',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 🔍 GET /api/v1/templates
   * Get Paginated System Templates with Filters
   * - Supports filtering by festivalId, category, search query, and pagination parameters
   */
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

  /**
   * 🗑️ DELETE /api/v1/templates/:id
   * Delete Master System Template (Admin Restricted)
   * - Removes template database record and cleans up associated image from Cloudinary storage
   */
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

