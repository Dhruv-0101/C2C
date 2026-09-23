import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { TEMPLATE_CATEGORY_TAB_PERMISSION } from './templateCategory.constants.js';
import {
  getTemplateCategoriesQuerySchema,
  getTemplateCategoryByIdSchema,
  createTemplateCategorySchema,
  updateTemplateCategorySchema,
  deleteTemplateCategorySchema,
} from './templateCategory.validator.js';
import * as templateCategoryController from './templateCategory.controller.js';

const router = Router();

// Public / Authenticated route to get template categories with pagination, search, and sorting
router.get('/', validate(getTemplateCategoriesQuerySchema), templateCategoryController.getTemplateCategories);

// Public / Authenticated route to fetch a single template category by ID
router.get('/:id', validate(getTemplateCategoryByIdSchema), templateCategoryController.getTemplateCategoryById);

// Admin & SubAdmin with Template Category Tab Permission
router.post(
  '/',
  authenticate,
  requireTabPermission(TEMPLATE_CATEGORY_TAB_PERMISSION),
  validate(createTemplateCategorySchema),
  templateCategoryController.createTemplateCategory
);

router.put(
  '/:id',
  authenticate,
  requireTabPermission(TEMPLATE_CATEGORY_TAB_PERMISSION),
  validate(updateTemplateCategorySchema),
  templateCategoryController.updateTemplateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireTabPermission(TEMPLATE_CATEGORY_TAB_PERMISSION),
  validate(deleteTemplateCategorySchema),
  templateCategoryController.deleteTemplateCategory
);

export default router;
