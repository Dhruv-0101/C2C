import { emailWorker } from './email.job.js';
import { workerInstance } from './postWorker.js';
import { initCronDispatcher } from './cronDispatcher.js';
import { logger } from '../config/logger.js';

/**
 * Initialize all BullMQ Workers and Cron Dispatchers in the platform
 */
export function initWorkers() {
  logger.info('⚡ [BullMQ Engine] Initializing Background Workers & Cron Dispatchers...');
  initCronDispatcher();
}

/**
 * Graceful Shutdown for all Background Workers
 */
export async function closeWorkers() {
  logger.info('🛑 [BullMQ Engine] Closing Background Workers gracefully...');
  if (emailWorker) await emailWorker.close().catch(() => {});
  if (workerInstance) await workerInstance.close().catch(() => {});
}
