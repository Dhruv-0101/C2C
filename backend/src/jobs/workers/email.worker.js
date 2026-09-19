import { Worker } from 'bullmq';
import { redisConnection, isRedisConfigured } from '../../config/redis.js';
import { EMAIL_QUEUE_NAME, EMAIL_JOB_NAMES } from '../../queues/email.queue.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendInvoiceEmail } from '../../common/services/email.service.js';
import { logger } from '../../config/logger.js';

/**
 * 🛠️ BULLMQ EMAIL WORKER (ASYNC BACKGROUND CONSUMER)
 * 
 * Real World Analogy: Dedicated Postal Mail Service Counter.
 * Consumes email jobs (welcome email, password reset email, invoice email) off the Redis Queue asynchronously
 * so HTTP API requests return instantly to users without waiting for SMTP network calls.
 */
let emailWorker = null;

if (isRedisConfigured) {
  try {
    emailWorker = new Worker(
      EMAIL_QUEUE_NAME,
      async (job) => {
        logger.info(`⚙️ [EmailWorker] Processing Job #${job.id} (${job.name})...`);

        switch (job.name) {
          case EMAIL_JOB_NAMES.WELCOME_EMAIL:
            await sendWelcomeEmail({
              email: job.data.email,
              fullName: job.data.fullName,
            });
            break;

          case EMAIL_JOB_NAMES.PASSWORD_RESET:
            await sendPasswordResetEmail({
              email: job.data.email,
              fullName: job.data.fullName,
              resetUrl: job.data.resetUrl,
            });
            break;

          case EMAIL_JOB_NAMES.INVOICE_EMAIL:
            await sendInvoiceEmail({
              userId: job.data.userId,
              transactionId: job.data.transactionId,
            });
            break;

          default:
            logger.warn(`⚠️ [EmailWorker] Unknown job name: ${job.name}`);
        }
      },
      {
        connection: redisConnection,
        // Concurrency: 2 = Process 2 email jobs in parallel simultaneously
        concurrency: 2,
      }
    );

    emailWorker.on('completed', (job) => {
      logger.info(`✅ [EmailWorker] Job #${job.id} (${job.name}) completed!`);
    });

    emailWorker.on('failed', (job, err) => {
      logger.error(`❌ [EmailWorker] Job #${job?.id} (${job?.name}) failed:`, err.message);
    });

    emailWorker.on('stalled', (jobId) => {
      logger.warn(`⚠️ [EmailWorker] Job #${jobId} stalled and will be re-processed.`);
    });

    let hasLoggedWorkerError = false;
    emailWorker.on('error', (err) => {
      if (!hasLoggedWorkerError) {
        logger.warn(`ℹ️ [EmailWorker] Connection notice: ${err.message}. Direct execution fallback active.`);
        hasLoggedWorkerError = true;
      }
    });
  } catch (err) {
    logger.warn('⚠️ [EmailWorker] Email worker initialization deferred:', err.message);
  }
}

export { emailWorker };
