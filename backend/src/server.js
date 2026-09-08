import app from './app.js';
import { connectDatabase, prisma } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initWorkers, closeWorkers } from './jobs/index.js';

import sharp from 'sharp';

/**
 * 🖼️ SHARP C++ NATIVE IMAGE ENGINE MEMORY OPTIMIZATION:
 * 
 * A) What is Sharp?
 *    - High-performance C++ native library (libvips) used to resize user logos, overlay frames on festival posts, 
 *      and crop graphics.
 * 
 * B) Why sharp.cache(false) & sharp.concurrency(1)?
 *    - Real World Analogy: Clearing the photographic printing tray after every photo instead of storing 1,000 photos in RAM.
 *    - Tech Reason: Sharp by default caches processed image buffers in C++ native memory (outside Node.js V8 Garbage Collector).
 *      In 512MB RAM cloud containers (Render / AWS t3.micro / Docker), default C++ caching consumes 400MB+ RAM and triggers 
 *      'Out Of Memory' (OOM) container crashes. Disabling cache & setting concurrency to 1 keeps RAM rock-solid at ~50MB!
 */
try {
  sharp.cache(false);
  sharp.concurrency(1);
} catch (e) {}

let server;

async function startServer() {
  try {
    // Verify database connection
    await connectDatabase();

    // Initialize BullMQ Background Workers
    initWorkers();

    const PORT = env.PORT || 5000;
    server = app.listen(PORT, () => {
      logger.info(`🚀 BrandFlow Backend Server running on http://localhost:${PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

// Graceful Shutdown Handler
async function gracefulShutdown(signal) {
  logger.warn(`⚠️ ${signal} received. Initiating graceful shutdown...`);
  await closeWorkers();
  if (server) {
    server.close(async () => {
      logger.info('🔒 HTTP Server closed.');
      await prisma.$disconnect();
      logger.info('🔒 Database connection closed.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception thrown:', error);
  process.exit(1);
});

startServer();

