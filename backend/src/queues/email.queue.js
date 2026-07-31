import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { sendWelcomeEmail } from '../common/services/email.service.js';

export const EMAIL_QUEUE_NAME = 'email-queue';

export const EMAIL_JOB_NAMES = {
  WELCOME_EMAIL: 'SEND_WELCOME_EMAIL',
  PASSWORD_RESET: 'SEND_PASSWORD_RESET',
  TWO_FACTOR_CODE: 'SEND_2FA_CODE',
};

// Initialize Email BullMQ Queue
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s, 10s, 20s backoff
    },
    removeOnComplete: {
      count: 100, // Retain last 100 completed jobs in memory/Redis
    },
    removeOnFail: {
      count: 500, // Retain last 500 failed jobs for audit
    },
  },
});

let hasLoggedQueueWarning = false;
emailQueue.on('error', (err) => {
  if (!hasLoggedQueueWarning) {
    console.warn(`ℹ️ [BullMQ Queue Info] Local Redis is offline (${err.message}). Fallback to direct execution mode.`);
    hasLoggedQueueWarning = true;
  }
});

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
    console.log(`🚀 [BullMQ Producer] Welcome Email Job #${job.id} dispatched for ${email}`);
    return job;
  } catch (error) {
    console.warn(`⚠️ [BullMQ Fallback] Redis unavailable (${error.message}). Executing fallback sendWelcomeEmail for ${email}...`);
    // Fallback: Send email directly if Redis queue is offline
    sendWelcomeEmail({ email, fullName }).catch((e) => {
      console.error('Failed direct fallback email send:', e.message);
    });
  }
}
