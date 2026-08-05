import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as categoryLogic from './category.logic.js';

/**
 * GET /api/v1/categories - Get business categories with pagination
 */
export async function getCategories(req, res, next) {
  try {
    const result = await categoryLogic.getCategories(req.query);
    return sendSuccessResponse(res, {
      message: 'Business categories retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/categories - Create a new business category (SuperAdmin)
 */
export async function createCategory(req, res, next) {
  try {
    const category = await categoryLogic.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Business category created successfully',
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/categories/:id - Delete a business category (SuperAdmin)
 */
export async function deleteCategory(req, res, next) {
  try {
    await categoryLogic.deleteCategory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Business category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
