import { Router } from 'express';
import * as templateController from './template.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { uploadSingleImage } from '../../common/middleware/upload.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireTabPermission } from '../../common/middleware/role.middleware.js';
import { TEMPLATE_TAB_PERMISSION } from './template.constants.js';
import {
  getTemplatesQuerySchema,
  getTemplateByIdSchema,
  createTemplateSchema,
  deleteTemplateSchema,
} from './template.validator.js';

const router = Router();

// ==============================================================================
// 🌐 PUBLIC / AUTHENTICATED USER ENDPOINTS
// ==============================================================================

// 🔍 Get Paginated System Templates with Filters
router.get(
  '/',
  validate(getTemplatesQuerySchema),
  templateController.getTemplates
);

// 🔍 Get Single System Template by ID
router.get(
  '/:id',
  validate(getTemplateByIdSchema),
  templateController.getTemplateById
);

// ==============================================================================
// 🛡️ ADMIN & SUB-ADMIN MANAGEMENT ENDPOINTS (Dynamically linked RBAC)
// ==============================================================================


// 🎨 Master Graphic Template Creation
router.post(
  '/',
  authenticate,
  requireTabPermission(TEMPLATE_TAB_PERMISSION),
  uploadSingleImage('image', { required: true }),
  validate(createTemplateSchema),
  templateController.createTemplate
);

// 🗑️ Delete Master Graphic Template
router.delete(
  '/:id',
  authenticate,
  requireTabPermission(TEMPLATE_TAB_PERMISSION),
  validate(deleteTemplateSchema),
  templateController.deleteTemplate
);

export default router;
