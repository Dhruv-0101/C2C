import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createCategorySchema, getCategoriesQuerySchema } from './category.validator.js';
import * as categoryController from './category.controller.js';

const router = Router();

// Public / Authenticated route to get business categories with pagination
router.get('/', validate(getCategoriesQuerySchema), categoryController.getCategories);

// SuperAdmin Restricted Routes
router.post(
  '/',
  authenticate,
  requireSuperAdmin,
  validate(createCategorySchema),
  categoryController.createCategory
);

router.delete(
  '/:id',
  authenticate,
  requireSuperAdmin,
  categoryController.deleteCategory
);

export default router;
