import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as templateLogic from './template.logic.js';

/**
 * 🎨 POST /api/v1/templates
 * Master Graphic Template Creation Endpoint
 */
export async function createTemplate(req, res, next) {
  try {
    const template = await templateLogic.createTemplate(
      {
        ...req.body,
        fileBuffer: req.fileBuffer || req.file?.buffer,
      },
      req.user?.id
    );

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'System template created & published successfully.',
      data: { template },
    });
  } catch (error) {
    next(error);
  }
}




/**
 * 🔍 GET /api/v1/templates
 * Get Paginated System Templates with Filters
 */
export async function getTemplates(req, res, next) {
  try {
    const result = await templateLogic.getTemplates(req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Templates retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🔍 GET /api/v1/templates/:id
 * Get Single System Template by ID
 */
export async function getTemplateById(req, res, next) {
  try {
    const template = await templateLogic.getTemplateById(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Template retrieved successfully',
      data: { template },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🗑️ DELETE /api/v1/templates/:id
 * Delete Master System Template (Admin Restricted)
 */
export async function deleteTemplate(req, res, next) {
  try {
    const result = await templateLogic.deleteTemplate(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Template deleted successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

