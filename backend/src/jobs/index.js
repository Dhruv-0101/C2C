import { emailWorker } from './workers/email.worker.js';
import { workerInstance, processPostJob } from './workers/post.worker.js';
import { initCronDispatcher, triggerScheduledPostsNow } from './cron/postCron.job.js';
import { logger } from '../config/logger.js';

/**
 * ⚡ MASTER BACKGROUND JOBS & WORKERS ORCHESTRATOR:
 * Initializes all BullMQ Worker consumers and scheduled Cron Tickers across the platform.
 */
export function initWorkers() {
  logger.info('⚡ [BullMQ Engine] Initializing Background Workers & Cron Dispatchers...');
  initCronDispatcher();
}

/**
 * Graceful Shutdown for all Background Workers & Queues
 */
export async function closeWorkers() {
  logger.info('🛑 [BullMQ Engine] Closing Background Workers gracefully...');
  if (emailWorker) await emailWorker.close().catch(() => {});
  if (workerInstance) await workerInstance.close().catch(() => {});
}

// Re-export job & worker functions for backward compatibility across domain modules
export { processPostJob, triggerScheduledPostsNow, emailWorker, workerInstance };
