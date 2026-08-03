import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Detect execution environment (development | production | test)
const currentEnv = process.env.NODE_ENV || 'development';
const isProd = currentEnv === 'production';

// 1. Dynamic Database URL (Dev Localhost vs Production Neon PostgreSQL)
const activeDbUrl = isProd
  ? process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
  : process.env.DATABASE_URL_DEV || process.env.DATABASE_URL;

if (activeDbUrl) {
  process.env.DATABASE_URL = activeDbUrl;
}

// 2. Dynamic Client Application URL (Dev Frontend vs Production Frontend)
const activeClientUrl = isProd
  ? process.env.CLIENT_URL_PROD || process.env.CLIENT_URL || 'https://c2-c-puce.vercel.app'
  : process.env.CLIENT_URL_DEV || process.env.CLIENT_URL || 'http://localhost:3000';

if (activeClientUrl) {
  process.env.CLIENT_URL = activeClientUrl;
}

// 3. Dynamic Redis Connection Configuration
const activeRedisHost = isProd
  ? process.env.REDIS_HOST_PROD || process.env.REDIS_HOST || '127.0.0.1'
  : process.env.REDIS_HOST_DEV || process.env.REDIS_HOST || '127.0.0.1';

const activeRedisPort = isProd
  ? process.env.REDIS_PORT_PROD || process.env.REDIS_PORT || '6379'
  : process.env.REDIS_PORT_DEV || process.env.REDIS_PORT || '6379';

const activeRedisPassword = isProd
  ? process.env.REDIS_PASSWORD_PROD || process.env.REDIS_PASSWORD
  : process.env.REDIS_PASSWORD_DEV || process.env.REDIS_PASSWORD;

const activeRedisTls = isProd
  ? process.env.REDIS_TLS_PROD || process.env.REDIS_TLS || 'false'
  : process.env.REDIS_TLS_DEV || process.env.REDIS_TLS || 'false';

const activeRedisUrl = isProd
  ? process.env.REDIS_URL_PROD || process.env.REDIS_URL
  : process.env.REDIS_URL_DEV || process.env.REDIS_URL;

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database URLs
  DATABASE_URL_DEV: z.string().optional(),
  DATABASE_URL_PROD: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT Authentication Secrets
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Client URLs
  CLIENT_URL_DEV: z.string().optional(),
  CLIENT_URL_PROD: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:3000'),

  // SMTP Email
  SMTP_HOST: z.string().optional().default('smtp.gmail.com'),
  SMTP_PORT: z.string().optional().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional().default('welcome@brandflow.ai'),

  // Redis Config
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_TLS: z.string().optional().default('false'),

  // Rate Limiting Config ("true" | "false")
  ENABLE_RATE_LIMITER: z.string().optional().default('false'),

  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Cloudinary Media Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse({
  ...process.env,
  DATABASE_URL: activeDbUrl,
  CLIENT_URL: activeClientUrl,
  REDIS_HOST: activeRedisHost,
  REDIS_PORT: activeRedisPort,
  REDIS_PASSWORD: activeRedisPassword,
  REDIS_TLS: activeRedisTls,
  REDIS_URL: activeRedisUrl,
});

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
