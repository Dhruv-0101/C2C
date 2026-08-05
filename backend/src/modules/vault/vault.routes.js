import { Router } from 'express';
import { vaultController } from './vault.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { updateVaultItemSchema } from './vault.validator.js';

const router = Router();

// All Vault endpoints require authentication
router.use(authenticate);

// GET /api/v1/vault
router.get('/', vaultController.getVaultItems);

// GET /api/v1/vault/:id
router.get('/:id', vaultController.getVaultItemById);

// PUT /api/v1/vault/:id
router.put('/:id', validate(updateVaultItemSchema), vaultController.updateVaultItem);

// DELETE /api/v1/vault/:id
router.delete('/:id', vaultController.deleteVaultItem);

export default router;
