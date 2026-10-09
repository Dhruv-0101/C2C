import { prisma } from '../../config/database.js';

/**
 * 🗄️ System Repository
 * Executes direct database ping queries to measure connection health and latency.
 */

/**
 * Pings PostgreSQL database using a lightweight raw query.
 * @returns {Promise<{ status: 'UP' | 'DOWN', latencyMs: number, error?: string }>}
 */
export async function pingDatabase() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return {
      status: 'UP',
      latencyMs,
    };
  } catch (error) {
    return {
      status: 'DOWN',
      latencyMs: Date.now() - start,
      error: error.message,
    };
  }
}
