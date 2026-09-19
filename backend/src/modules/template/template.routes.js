import { Router } from 'express';
import { templateController } from './template.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { validateImageUpload } from '../../common/middleware/upload.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import {
  getTemplatesQuerySchema,
  createTemplateSchema,
  createTemplateCategorySchema,
} from './template.validator.js';

const router = Router();

// Public / User Endpoints with pagination validation
router.get('/categories', templateController.getCategories);
router.get('/', validate(getTemplatesQuerySchema), templateController.getTemplates);

// Admin & SubAdmin Template Category Management Endpoints
router.post(
  '/categories',
  authenticate,
  requireTabPermission('templates'),
  validate(createTemplateCategorySchema),
  templateController.createCategory
);

router.delete(
  '/categories/:id',
  authenticate,
  requireTabPermission('templates'),
  templateController.deleteCategory
);

// Admin & SubAdmin Cloudinary Base Template Upload Endpoint
router.post(
  '/upload',
  authenticate,
  requireTabPermission('templates'),
  validateImageUpload,
  templateController.uploadAdminTemplate
);

// Admin & SubAdmin System Template Upload Endpoints
router.post(
  '/',
  authenticate,
  requireTabPermission('templates'),
  validateImageUpload,
  validate(createTemplateSchema),
  templateController.createTemplate
);

router.delete(
  '/:id',
  authenticate,
  requireTabPermission('templates'),
  templateController.deleteTemplate
);

export default router;
