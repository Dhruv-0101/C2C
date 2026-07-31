import { emailWorker } from './email.job.js';

/**
 * Initialize all BullMQ Workers in the platform
 */
export function initWorkers() {
  console.log('⚡ [BullMQ Engine] Initializing Background Workers (EmailWorker)...');
}

/**
 * Graceful Shutdown for all Background Workers
 */
export async function closeWorkers() {
  console.log('🛑 [BullMQ Engine] Closing Background Workers gracefully...');
  await emailWorker.close();
}
