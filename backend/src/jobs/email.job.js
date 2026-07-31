import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EMAIL_QUEUE_NAME, EMAIL_JOB_NAMES } from '../queues/email.queue.js';
import { sendWelcomeEmail } from '../common/services/email.service.js';

/**
 * BullMQ Worker: Processes Email Jobs from the Redis Queue
 */
export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    console.log(`⚙️ [BullMQ Worker] Processing Job #${job.id} (${job.name}) for ${job.data.email}...`);

    switch (job.name) {
      case EMAIL_JOB_NAMES.WELCOME_EMAIL:
        await sendWelcomeEmail({
          email: job.data.email,
          fullName: job.data.fullName,
        });
        break;

      case EMAIL_JOB_NAMES.PASSWORD_RESET:
        // Future expansion for Password Reset Email Job
        break;

      case EMAIL_JOB_NAMES.TWO_FACTOR_CODE:
        // Future expansion for 2FA Email Code Job
        break;

      default:
        console.warn(`⚠️ [BullMQ Worker] Unknown job name: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 concurrent email jobs
  }
);

// Worker Event Listeners
emailWorker.on('completed', (job) => {
  console.log(`✅ [BullMQ Worker] Job #${job.id} (${job.name}) successfully completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ [BullMQ Worker] Job #${job?.id} (${job?.name}) failed:`, err.message);
});

let hasLoggedWorkerWarning = false;
emailWorker.on('error', (err) => {
  if (!hasLoggedWorkerWarning) {
    console.warn(`ℹ️ [BullMQ Worker Info] Local Redis is offline (${err.message}). Queue fallback active.`);
    hasLoggedWorkerWarning = true;
  }
});
