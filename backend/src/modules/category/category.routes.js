import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  getCategoriesQuerySchema,
  getCategoryByIdSchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './category.validator.js';
import * as categoryController from './category.controller.js';

const router = Router();

// Public / Authenticated route to get business categories with pagination, search, and sorting
router.get('/', validate(getCategoriesQuerySchema), categoryController.getCategories);

// Public / Authenticated route to fetch a single business category by ID
router.get('/:id', validate(getCategoryByIdSchema), categoryController.getCategoryById);

// SuperAdmin Only: Business Category Management
router.post(
  '/',
  authenticate,
  requireSuperAdmin,
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  requireSuperAdmin,
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireSuperAdmin,
  validate(deleteCategorySchema),
  categoryController.deleteCategory
);

export default router;
