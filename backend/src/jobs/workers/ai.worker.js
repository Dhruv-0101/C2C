import { Worker } from 'bullmq';
import { redisConnectionOptions, isRedisConfigured } from '../../config/redis.js';
import {
  AI_IMAGE_QUEUE_NAME,
  AI_CAPTION_QUEUE_NAME,
  AI_CONCURRENCY,
} from '../../queues/ai.queue.js';
import { generatePostImage, generateCaption } from '../../modules/ai/ai.logic.js';
import { logger } from '../../config/logger.js';

/**
 * 🛠️ BULLMQ AI WORKERS
 * High-concurrency, rate-limit protected background consumers for AI Generation.
 * - aiImageWorkerInstance: Generates visuals via Google Gemini Nano Banana 2.1 & uploads to Cloudinary CDN
 * - aiCaptionWorkerInstance: Generates high-converting social media copywriting & hashtags
 */

export let aiImageWorkerInstance = null;
export let aiCaptionWorkerInstance = null;

if (isRedisConfigured) {
  try {
    // 🍌 AI Image Generation Worker (Protected Concurrency)
    aiImageWorkerInstance = new Worker(
      AI_IMAGE_QUEUE_NAME,
      async (job) => {
        logger.info(`🚀 [AiWorker] Starting AI Image job #${job.id} for user ${job.data?.userId}...`);
        await job.updateProgress(15);

        // Progress updater callback passed down to AI Logic
        const onProgress = async (percent) => {
          await job.updateProgress(percent).catch(() => {});
        };

        const result = await generatePostImage(job.data.userId, job.data.params, onProgress);
        await job.updateProgress(100);
        return result;
      },
      {
        connection: redisConnectionOptions,
        concurrency: AI_CONCURRENCY.IMAGE, // Max 4 simultaneous image operations
      }
    );

    aiImageWorkerInstance.on('completed', (job) => {
      logger.info(`✅ [AiWorker] Completed AI Image job #${job.id}`);
    });

    aiImageWorkerInstance.on('failed', (job, err) => {
      logger.warn(`⚠️ [AiWorker] AI Image job #${job?.id} failed: ${err.message}`);
    });

    // ✍️ AI Caption Generation Worker (High Throughput)
    aiCaptionWorkerInstance = new Worker(
      AI_CAPTION_QUEUE_NAME,
      async (job) => {
        logger.info(`🚀 [AiWorker] Starting AI Caption job #${job.id} for user ${job.data?.userId}...`);
        await job.updateProgress(25);

        const result = await generateCaption(job.data.userId, job.data.params);
        await job.updateProgress(100);
        return result;
      },
      {
        connection: redisConnectionOptions,
        concurrency: AI_CONCURRENCY.CAPTION, // Max 15 simultaneous caption generations
      }
    );

    aiCaptionWorkerInstance.on('completed', (job) => {
      logger.info(`✅ [AiWorker] Completed AI Caption job #${job.id}`);
    });

    aiCaptionWorkerInstance.on('failed', (job, err) => {
      logger.warn(`⚠️ [AiWorker] AI Caption job #${job?.id} failed: ${err.message}`);
    });

    logger.info(
      `⚙️ [BullMQ Engine] AI Workers Initialized (Image Concurrency: ${AI_CONCURRENCY.IMAGE}, Caption Concurrency: ${AI_CONCURRENCY.CAPTION}).`
    );
  } catch (err) {
    logger.warn(`⚠️ [BullMQ] Failed to initialize AI Workers: ${err.message}`);
  }
}
