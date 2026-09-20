import { emailWorker } from './workers/email.worker.js';
import { workerInstance, processPostJob } from './workers/post.worker.js';
import { analyticsWorkerInstance, processAnalyticsJob } from './workers/analytics.worker.js';
import { initCronDispatcher, stopCronDispatcher, triggerScheduledPostsNow } from './cron/postCron.job.js';
import { initAnalyticsCron, stopAnalyticsCron, syncAnalyticsMetrics } from './cron/analyticsCron.job.js';
import { logger } from '../config/logger.js';

/**
 * ⚡ MASTER BACKGROUND JOBS & WORKERS ORCHESTRATOR:
 * Initializes all BullMQ Worker consumers and scheduled Cron Tickers across the platform.
 */
export function initWorkers() {
  logger.info('⚡ [BullMQ Engine] Initializing Background Workers & Cron Dispatchers...');
  
  // 1. Start 1-minute Post Dispatcher Cron (* * * * *)
  initCronDispatcher();

  // 2. Start 15-minute Social Analytics Sync Cron (*/15 * * * *)
  initAnalyticsCron();
}

/**
 * Graceful Shutdown for all Background Workers & Cron Schedulers
 */
export async function closeWorkers() {
  logger.info('🛑 [BullMQ Engine] Closing Background Workers gracefully...');
  
  // Stop scheduled cron tasks
  stopCronDispatcher();
  stopAnalyticsCron();

  // Close BullMQ worker consumers cleanly
  if (emailWorker) await emailWorker.close().catch(() => {});
  if (workerInstance) await workerInstance.close().catch(() => {});
  if (analyticsWorkerInstance) await analyticsWorkerInstance.close().catch(() => {});
}

// Re-export job & worker functions for backward compatibility across domain modules
export {
  processPostJob,
  processAnalyticsJob,
  triggerScheduledPostsNow,
  syncAnalyticsMetrics,
  emailWorker,
  workerInstance,
  analyticsWorkerInstance,
  initCronDispatcher,
  stopCronDispatcher,
  initAnalyticsCron,
  stopAnalyticsCron,
};

