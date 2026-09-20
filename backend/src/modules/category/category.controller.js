import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as categoryLogic from './category.logic.js';

/**
 * GET /api/v1/categories - Get business categories with pagination, search, and sorting
 */
export async function getCategories(req, res, next) {
  try {
    const result = await categoryLogic.getCategories(req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Business categories retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/categories/:id - Get a single business category by ID
 */
export async function getCategoryById(req, res, next) {
  try {
    const category = await categoryLogic.getCategoryById(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Business category retrieved successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/categories - Create a new business category (SuperAdmin & SubAdmin with Category Tab Permission)
 */
export async function createCategory(req, res, next) {
  try {
    const category = await categoryLogic.createCategory({
      ...req.body,
      createdBy: req.user?.id,
    });
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Business category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/categories/:id - Update an existing business category (SuperAdmin & SubAdmin with Category Tab Permission)
 */
export async function updateCategory(req, res, next) {
  try {
    const category = await categoryLogic.updateCategory(req.params.id, req.body);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Business category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/categories/:id - Delete a business category (SuperAdmin & SubAdmin with Category Tab Permission)
 */
export async function deleteCategory(req, res, next) {
  try {
    const result = await categoryLogic.deleteCategory(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Business category deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
