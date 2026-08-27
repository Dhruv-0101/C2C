import app from './app.js';
import { connectDatabase, prisma } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initWorkers, closeWorkers } from './jobs/index.js';

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

