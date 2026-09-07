import { Router } from 'express';
import { templateController } from './template.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { validateImageUpload } from '../../common/middleware/upload.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/role.middleware.js';
import {
  getTemplatesQuerySchema,
  createTemplateSchema,
  compositePostSchema,
} from './template.validator.js';

const router = Router();

// Public / User Endpoints with pagination validation
router.get('/categories', templateController.getCategories);
router.get('/', validate(getTemplatesQuerySchema), templateController.getTemplates);
router.post('/composite-post', validate(compositePostSchema), templateController.compositePost);

// Admin & SubAdmin Cloudinary Base Template Upload Endpoint
router.post(
  '/upload',
  authenticate,
  authorize(['ADMIN', 'SUB_ADMIN']),
  validateImageUpload,
  templateController.uploadAdminTemplate
);

// Admin & SubAdmin System Template Upload Endpoints
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'SUB_ADMIN']),
  validate(createTemplateSchema),
  templateController.createTemplate
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'SUB_ADMIN']),
  templateController.deleteTemplate
);

export default router;
