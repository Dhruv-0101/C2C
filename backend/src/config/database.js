import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Singleton Prisma Database Client Instance
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info(`✅ PostgreSQL Database connected successfully via Prisma ORM [Mode: ${env.NODE_ENV}].`);
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL Database:', error.message);
    process.exit(1);
  }
}
