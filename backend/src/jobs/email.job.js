import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EMAIL_QUEUE_NAME, EMAIL_JOB_NAMES } from '../queues/email.queue.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../common/services/email.service.js';
import { logger } from '../config/logger.js';

/**
 * BullMQ Worker: Processes Email Jobs from the Redis Queue
 */
let emailWorker = null;

try {
  emailWorker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      logger.info(`⚙️ [BullMQ Worker] Processing Job #${job.id} (${job.name}) for ${job.data.email}...`);

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

        case EMAIL_JOB_NAMES.TWO_FACTOR_CODE:
          // Future expansion for 2FA Email Code Job
          break;

        default:
          logger.warn(`⚠️ [BullMQ Worker] Unknown job name: ${job.name}`);
      }
    },
    {
      connection: redisConnection,
      concurrency: 5, // Process up to 5 concurrent email jobs
    }
  );

  // Worker Event Listeners
  emailWorker.on('completed', (job) => {
    logger.info(`✅ [BullMQ Worker] Job #${job.id} (${job.name}) successfully completed!`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`❌ [BullMQ Worker] Job #${job?.id} (${job?.name}) failed:`, err.message);
  });

  let hasLoggedWorkerWarning = false;
  emailWorker.on('error', (err) => {
    if (!hasLoggedWorkerWarning) {
      logger.warn(`ℹ️ [BullMQ Worker Info] Local Redis is offline (${err.message}). Queue fallback active.`);
      hasLoggedWorkerWarning = true;
    }
  });
} catch (err) {
  logger.warn('⚠️ [BullMQ Email Worker] Initialization deferred (Redis offline or non-configured).');
}

export { emailWorker };
