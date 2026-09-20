import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { CATEGORY_TAB_PERMISSION } from './category.constants.js';
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

// Admin & SubAdmin with Category Tab Permission
router.post(
  '/',
  authenticate,
  requireTabPermission(CATEGORY_TAB_PERMISSION),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  requireTabPermission(CATEGORY_TAB_PERMISSION),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireTabPermission(CATEGORY_TAB_PERMISSION),
  validate(deleteCategorySchema),
  categoryController.deleteCategory
);

export default router;
