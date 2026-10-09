import { Router } from 'express';
import * as systemController from './system.controller.js';

const router = Router();

/**
 * 🛣️ System Routes
 * Public health & status endpoints for frontend status dashboard and external monitors.
 */

// GET /api/v1/system/status
router.get('/status', systemController.getSystemStatus);

export default router;
