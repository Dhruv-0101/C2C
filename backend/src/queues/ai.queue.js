import { Queue } from 'bullmq';
import { redisConnectionOptions, isRedisConfigured } from '../config/redis.js';
import { logger } from '../config/logger.js';

export const AI_IMAGE_QUEUE_NAME = 'ai-image-queue';
export const AI_CAPTION_QUEUE_NAME = 'ai-caption-queue';

export const AI_JOB_NAMES = {
  GENERATE_IMAGE: 'generate-ai-image',
  GENERATE_CAPTION: 'generate-ai-caption',
};

// Benchmark processing averages (seconds) used for dynamic wait time calculation
export const AI_AVERAGE_PROCESSING_SECONDS = {
  IMAGE: 4.5, // Google Gemini Nano Banana 2.1 + Cloudinary CDN upload
  CAPTION: 1.5, // LLM Copywriting generation
};

export const AI_CONCURRENCY = {
  IMAGE: 4, // Up to 4 concurrent image generations (protects API rate limits)
  CAPTION: 15, // Up to 15 concurrent caption generations
};

/**
 * BullMQ Queues for High-Concurrency AI Generation
 */
export let aiImageQueue = null;
export let aiCaptionQueue = null;

if (isRedisConfigured) {
  try {
    aiImageQueue = new Queue(AI_IMAGE_QUEUE_NAME, {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 1500 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    aiCaptionQueue = new Queue(AI_CAPTION_QUEUE_NAME, {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    const quietErrorHandler = (queueName) => () => {
      logger.warn(`⚠️ [BullMQ AI Engine] Error in queue '${queueName}'. Operating with resilient fallback.`);
    };

    aiImageQueue.on('error', quietErrorHandler(AI_IMAGE_QUEUE_NAME));
    aiCaptionQueue.on('error', quietErrorHandler(AI_CAPTION_QUEUE_NAME));

    logger.info('📦 [BullMQ] AI Image & Caption Queues Initialized.');
  } catch (err) {
    logger.warn('⚠️ [BullMQ] Failed to initialize AI Queues in Redis. Direct synchronous mode active.');
  }
}

/**
 * Add AI Image Generation Job to BullMQ Queue
 * @param {string} userId
 * @param {Object} params
 * @returns {Promise<import('bullmq').Job>}
 */
export async function addAiImageJob(userId, params = {}) {
  if (!aiImageQueue) return null;

  return aiImageQueue.add(
    AI_JOB_NAMES.GENERATE_IMAGE,
    { userId, params, createdAt: Date.now() },
    {
      priority: params.isPriority ? 1 : 10,
    }
  );
}

/**
 * Add AI Caption Generation Job to BullMQ Queue
 * @param {string} userId
 * @param {Object} params
 * @returns {Promise<import('bullmq').Job>}
 */
export async function addAiCaptionJob(userId, params = {}) {
  if (!aiCaptionQueue) return null;

  return aiCaptionQueue.add(
    AI_JOB_NAMES.GENERATE_CAPTION,
    { userId, params, createdAt: Date.now() },
    {
      priority: params.isPriority ? 1 : 10,
    }
  );
}

/**
 * Get current waiting depth for caption queue (used for smart fast-lane routing)
 * @returns {Promise<number>}
 */
export async function getCaptionQueueWaitingCount() {
  if (!aiCaptionQueue) return 0;
  try {
    return await aiCaptionQueue.getWaitingCount();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculate dynamic queue position and estimated wait time
 *
 * @param {import('bullmq').Queue} queue
 * @param {string} jobId
 * @param {'IMAGE' | 'CAPTION'} type
 * @returns {Promise<{ position: number, estimatedWaitSeconds: number }>}
 */
export async function calculateQueuePositionAndTiming(queue, jobId, type = 'IMAGE') {
  if (!queue) {
    return { position: 1, estimatedWaitSeconds: 3 };
  }

  try {
    const waitingJobs = await queue.getWaiting();
    const index = waitingJobs.findIndex((j) => j.id === jobId);

    // If job is in waiting list, index + 1 is its position. If index < 0, it's currently active (position 0)
    const position = index >= 0 ? index + 1 : 0;
    const avgSec = type === 'IMAGE' ? AI_AVERAGE_PROCESSING_SECONDS.IMAGE : AI_AVERAGE_PROCESSING_SECONDS.CAPTION;
    const concurrency = type === 'IMAGE' ? AI_CONCURRENCY.IMAGE : AI_CONCURRENCY.CAPTION;

    // Minimum wait time is 2 seconds
    const estimatedWaitSeconds =
      position === 0
        ? Math.max(2, Math.ceil(avgSec))
        : Math.max(2, Math.ceil((position * avgSec) / concurrency));

    return { position, estimatedWaitSeconds };
  } catch (err) {
    logger.warn(`Failed to calculate queue timing for job ${jobId}: ${err.message}`);
    return { position: 1, estimatedWaitSeconds: 4 };
  }
}

/**
 * Get unified AI job status across Image or Caption queues
 *
 * @param {string} jobId
 * @param {'image' | 'caption'} [type='image']
 * @returns {Promise<Object>}
 */
export async function fetchAiJobStatus(jobId, type = 'image') {
  const targetQueue = type === 'caption' ? aiCaptionQueue : aiImageQueue;
  const fallbackQueue = type === 'caption' ? aiImageQueue : aiCaptionQueue;

  let job = null;
  let resolvedQueue = targetQueue;

  if (targetQueue) {
    job = await targetQueue.getJob(jobId);
  }

  if (!job && fallbackQueue) {
    job = await fallbackQueue.getJob(jobId);
    resolvedQueue = fallbackQueue;
  }

  if (!job) {
    return null;
  }

  const state = await job.getState(); // 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
  const isImageJob = resolvedQueue === aiImageQueue;
  const categoryType = isImageJob ? 'IMAGE' : 'CAPTION';

  if (state === 'completed') {
    return {
      jobId: job.id,
      status: 'COMPLETED',
      progress: 100,
      step: 'COMPLETED',
      result: job.returnvalue,
      queuePosition: 0,
      estimatedWaitSeconds: 0,
    };
  }

  if (state === 'failed') {
    return {
      jobId: job.id,
      status: 'FAILED',
      progress: 0,
      step: 'FAILED',
      error: job.failedReason || 'AI generation encountered an unexpected issue.',
      queuePosition: 0,
      estimatedWaitSeconds: 0,
    };
  }

  if (state === 'active') {
    const rawProgress = typeof job.progress === 'number' ? job.progress : 50;
    const step = rawProgress >= 70 ? 'UPLOADING_CDN' : 'GENERATING_AI';

    return {
      jobId: job.id,
      status: 'ACTIVE',
      progress: Math.min(95, Math.max(25, rawProgress)),
      step,
      queuePosition: 0,
      estimatedWaitSeconds: Math.max(1, Math.ceil(isImageJob ? 2 : 1)),
    };
  }

  // Otherwise, state is 'waiting' or 'delayed'
  const { position, estimatedWaitSeconds } = await calculateQueuePositionAndTiming(
    resolvedQueue,
    job.id,
    categoryType
  );

  return {
    jobId: job.id,
    status: 'WAITING',
    progress: 10,
    step: 'IN_QUEUE',
    queuePosition: position,
    estimatedWaitSeconds,
  };
}
