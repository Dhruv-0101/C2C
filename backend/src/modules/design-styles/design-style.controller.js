import * as designStyleLogic from './design-style.logic.js';

/**
 * GET /api/v1/design-styles - Get all master design styles
 */
export async function getDesignStyles(req, res, next) {
  try {
    const designStyles = await designStyleLogic.getDesignStyles();
    res.status(200).json({
      success: true,
      message: 'Design styles retrieved successfully',
      data: {
        designStyles,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/design-styles - Create a new master design style
 */
export async function createDesignStyle(req, res, next) {
  try {
    const designStyle = await designStyleLogic.createDesignStyle(req.body);
    res.status(201).json({
      success: true,
      message: 'Master design style created successfully',
      data: {
        designStyle,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/design-styles/:id - Delete a design style by ID
 */
export async function deleteDesignStyle(req, res, next) {
  try {
    await designStyleLogic.deleteDesignStyle(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Design style deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
