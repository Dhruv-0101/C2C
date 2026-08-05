import { emailWorker } from './email.job.js';
import { logger } from '../config/logger.js';

/**
 * Initialize all BullMQ Workers in the platform
 */
export function initWorkers() {
  logger.info('⚡ [BullMQ Engine] Initializing Background Workers (EmailWorker)...');
}

/**
 * Graceful Shutdown for all Background Workers
 */
export async function closeWorkers() {
  logger.info('🛑 [BullMQ Engine] Closing Background Workers gracefully...');
  await emailWorker.close();
}
