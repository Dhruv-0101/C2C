import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EMAIL_QUEUE_NAME, EMAIL_JOB_NAMES } from '../queues/email.queue.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../common/services/email.service.js';
import { logger } from '../config/logger.js';

/**
 * BullMQ Worker: Processes Email Jobs from the Redis Queue
 */
let emailWorker = null;

const isRedisConfigured = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);

if (isRedisConfigured) {
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

          default:
            logger.warn(`⚠️ [BullMQ Worker] Unknown job name: ${job.name}`);
        }
      },
      {
        connection: redisConnection,
        concurrency: 2,
      }
    );

    emailWorker.on('completed', (job) => {
      logger.info(`✅ [BullMQ Worker] Job #${job.id} (${job.name}) completed!`);
    });

    emailWorker.on('failed', (job, err) => {
      logger.error(`❌ [BullMQ Worker] Job #${job?.id} (${job?.name}) failed:`, err.message);
    });

    emailWorker.on('error', () => {});
  } catch (err) {
    logger.warn('⚠️ [BullMQ Worker] Email worker deferred.');
  }
}

export { emailWorker };
