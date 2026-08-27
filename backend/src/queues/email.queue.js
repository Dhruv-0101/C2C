import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../common/services/email.service.js';
import { logger } from '../config/logger.js';

export const EMAIL_QUEUE_NAME = 'email-queue';

export const EMAIL_JOB_NAMES = {
  WELCOME_EMAIL: 'SEND_WELCOME_EMAIL',
  PASSWORD_RESET: 'SEND_PASSWORD_RESET',
  // TWO_FACTOR_CODE: 'SEND_2FA_CODE',
};

// Initialize Email BullMQ Queue only if Redis is configured
const isRedisConfigured = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
export const emailQueue = isRedisConfigured
  ? new Queue(EMAIL_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 100 },
      },
    })
  : null;

if (emailQueue) {
  let hasLoggedQueueWarning = false;
  emailQueue.on('error', (err) => {
    if (!hasLoggedQueueWarning) {
      logger.warn(`ℹ️ [BullMQ Queue Info] Redis issue: ${err.message}. Fallback active.`);
      hasLoggedQueueWarning = true;
    }
  });
}

/**
 * Producer: Add Welcome Email Job to BullMQ Queue
 * @param {{ email: string, fullName: string }} data
 */
export async function addWelcomeEmailJob({ email, fullName }) {
  try {
    const job = await emailQueue.add(EMAIL_JOB_NAMES.WELCOME_EMAIL, {
      email,
      fullName,
      createdAt: new Date().toISOString(),
    });
    logger.info(`🚀 [BullMQ Producer] Welcome Email Job #${job.id} dispatched for ${email}`);
    return job;
  } catch (error) {
    logger.warn(`⚠️ [BullMQ Fallback] Redis unavailable (${error.message}). Executing fallback sendWelcomeEmail for ${email}...`);
    // Fallback: Send email directly if Redis queue is offline
    sendWelcomeEmail({ email, fullName }).catch((e) => {
      logger.error('Failed direct fallback email send:', e.message);
    });
  }
}

/**
 * Producer: Add Password Reset Email Job to BullMQ Queue
 * @param {{ email: string, fullName: string, resetUrl: string }} data
 */
export async function addPasswordResetEmailJob({ email, fullName, resetUrl }) {
  try {
    const job = await emailQueue.add(EMAIL_JOB_NAMES.PASSWORD_RESET, {
      email,
      fullName,
      resetUrl,
      createdAt: new Date().toISOString(),
    });
    logger.info(`🚀 [BullMQ Producer] Password Reset Email Job #${job.id} dispatched for ${email}`);
    return job;
  } catch (error) {
    logger.warn(`⚠️ [BullMQ Fallback] Redis unavailable (${error.message}). Executing fallback sendPasswordResetEmail for ${email}...`);
    // Fallback: Send email directly if Redis queue is offline
    sendPasswordResetEmail({ email, fullName, resetUrl }).catch((e) => {
      logger.error('Failed direct fallback password reset email send:', e.message);
    });
  }
}
