import * as categoryLogic from './category.logic.js';

/**
 * GET /api/v1/categories - Get all business categories
 */
export async function getCategories(req, res, next) {
  try {
    const categories = await categoryLogic.getCategories();
    res.status(200).json({
      success: true,
      message: 'Business categories retrieved successfully',
      data: {
        categories,
      },
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
