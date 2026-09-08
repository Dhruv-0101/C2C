import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * 🗄️ SINGLETON PRISMA DATABASE CLIENT & CONNECTION POOL:
 * 
 * A) Real World Analogy: Single Toll Booth Gatekeeper 🎫.
 *    Without Singleton pattern, every time Nodemon / Node watch reloads code during development, Node creates 
 *    a NEW database connection pool. Within 5 reloads, PostgreSQL crashes with "FATAL: too many clients already".
 * 
 * B) How globalThis Prevents DB Crashes:
 *    Storing 'prisma' on globalThis preserves the existing PostgreSQL connection pool across hot-reloads, 
 *    reusing 1 singleton client instead of spawning duplicate connections.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
    // Log raw SQL queries in development for debugging; log only errors in production
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Preserve singleton DB client across Node hot-reloads in non-production environments
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * 🔌 Pre-flight Database Connection Health Check
 * Pings PostgreSQL on server startup. If DB connection fails (wrong credentials or DB down), 
 * logs the error and gracefully exits so server doesn't serve broken traffic.
 */
export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info(`✅ PostgreSQL Database connected successfully via Prisma ORM [Mode: ${env.NODE_ENV}].`);
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL Database:', error.message);
    process.exit(1);
  }
}
