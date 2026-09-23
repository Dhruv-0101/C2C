import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as templateCategoryLogic from './templateCategory.logic.js';

/**
 * GET /api/v1/template-categories - Get template categories with pagination, search, and sorting
 */
export async function getTemplateCategories(req, res, next) {
  try {
    const result = await templateCategoryLogic.getTemplateCategories(req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Template categories retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/template-categories/:id - Get a single template category by ID
 */
export async function getTemplateCategoryById(req, res, next) {
  try {
    const category = await templateCategoryLogic.getTemplateCategoryById(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Template category retrieved successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/template-categories - Create a new template category (SuperAdmin & SubAdmin with Template Category Permission)
 */
export async function createTemplateCategory(req, res, next) {
  try {
    const category = await templateCategoryLogic.createTemplateCategory({
      ...req.body,
      createdBy: req.user?.id,
    });
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Template category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/template-categories/:id - Update an existing template category
 */
export async function updateTemplateCategory(req, res, next) {
  try {
    const category = await templateCategoryLogic.updateTemplateCategory(req.params.id, req.body);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Template category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/template-categories/:id - Delete a template category
 */
export async function deleteTemplateCategory(req, res, next) {
  try {
    const result = await templateCategoryLogic.deleteTemplateCategory(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Template category deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
