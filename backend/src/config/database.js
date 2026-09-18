import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * 🗄️ SINGLETON PRISMA DATABASE CLIENT & CONNECTION POOL
 * 
 * 1. What globalThis Means:
 *    globalThis is a standard JavaScript global object that provides access to the global scope 
 *    across any environment (in Node.js, globalThis points to the global namespace object).
 *    `const globalForPrisma = globalThis;` creates an alias variable pointing to Node's global 
 *    execution context so we can attach long-lived properties to it.
 * 
 * 2. Why It Was Added (The Problem It Solves):
 *    During local development, live-reload tools (like Nodemon, Node --watch, or Vite) continuously 
 *    re-evaluate backend JavaScript modules whenever you save a file.
 * 
 *    - Without this pattern: Every code reload re-executes new PrismaClient(), spawning a brand-new 
 *      connection pool to PostgreSQL. Within 5–10 file saves, PostgreSQL runs out of available client 
 *      connections and crashes with: "FATAL: too many clients already".
 *    - With this pattern: The globalThis object stays alive in memory across code hot-reloads. 
 *      By caching the PrismaClient instance on globalThis, all hot-reloads reuse the exact same 
 *      database connection pool instead of opening new ones.
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
