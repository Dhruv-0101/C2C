import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  vaultIdParamSchema,
  getVaultItemsQuerySchema,
  updateVaultItemSchema,
  bulkDeleteVaultItemsSchema,
} from './vault.validator.js';
import * as vaultController from './vault.controller.js';

const router = Router();

// All Vault endpoints require authentication
router.use(authenticate);

// POST /api/v1/vault/bulk-delete
router.post(
  '/bulk-delete',
  validate(bulkDeleteVaultItemsSchema),
  vaultController.bulkDeleteVaultItems
);

// GET /api/v1/vault - Fetch user's stored vault posts with pagination and search
router.get(
  '/',
  validate(getVaultItemsQuerySchema),
  vaultController.getVaultItems
);

// GET /api/v1/vault/:id - Fetch single vault item
router.get(
  '/:id',
  validate(vaultIdParamSchema),
  vaultController.getVaultItemById
);

// PUT /api/v1/vault/:id - Update vault item details
router.put(
  '/:id',
  validate(vaultIdParamSchema),
  validate(updateVaultItemSchema),
  vaultController.updateVaultItem
);

// DELETE /api/v1/vault/:id - Delete vault item
router.delete(
  '/:id',
  validate(vaultIdParamSchema),
  vaultController.deleteVaultItem
);

export default router;
