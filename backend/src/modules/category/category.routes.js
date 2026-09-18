import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createCategorySchema, getCategoriesQuerySchema } from './category.validator.js';
import * as categoryController from './category.controller.js';

const router = Router();

// Public / Authenticated route to get business categories with pagination
router.get('/', validate(getCategoriesQuerySchema), categoryController.getCategories);

// SuperAdmin & SubAdmin with Category Tab Permission
router.post(
  '/',
  authenticate,
  requireTabPermission('categories'),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.delete(
  '/:id',
  authenticate,
  requireTabPermission('categories'),
  categoryController.deleteCategory
);

export default router;
