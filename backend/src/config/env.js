import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Detect execution environment (development | production | test)
const currentEnv = process.env.NODE_ENV || 'development';
const isProd = currentEnv === 'production';

// 1. Dynamic Database URL (Prioritizes explicit DATABASE_URL passed by Docker/System, then falls back to Dev/Prod variants)
const activeDbUrl = process.env.DATABASE_URL || (isProd
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_DEV);

if (activeDbUrl) {
  process.env.DATABASE_URL = activeDbUrl;
}

// 2. Dynamic Client Application URL
const activeClientUrl = process.env.CLIENT_URL || (isProd
  ? process.env.CLIENT_URL_PROD || 'https://c2-c-puce.vercel.app'
  : process.env.CLIENT_URL_DEV || 'http://localhost:5173');

if (activeClientUrl) {
  process.env.CLIENT_URL = activeClientUrl;
}

// 3. Dynamic Redis Connection Configuration
const activeRedisHost = process.env.REDIS_HOST || (isProd
  ? process.env.REDIS_HOST_PROD || '127.0.0.1'
  : process.env.REDIS_HOST_DEV || '127.0.0.1');

const activeRedisPort = process.env.REDIS_PORT || (isProd
  ? process.env.REDIS_PORT_PROD || '6379'
  : process.env.REDIS_PORT_DEV || '6379');

const activeRedisPassword = process.env.REDIS_PASSWORD || (isProd
  ? process.env.REDIS_PASSWORD_PROD
  : process.env.REDIS_PASSWORD_DEV);

const activeRedisTls = process.env.REDIS_TLS || (isProd
  ? process.env.REDIS_TLS_PROD || 'false'
  : process.env.REDIS_TLS_DEV || 'false');

const activeRedisUrl = process.env.REDIS_URL || (isProd
  ? process.env.REDIS_URL_PROD
  : process.env.REDIS_URL_DEV);

const activeMetaRedirectUri = process.env.META_REDIRECT_URI || (isProd
  ? process.env.META_REDIRECT_URI_PROD || 'https://c2c-negk.onrender.com/api/v1/social/meta/callback'
  : process.env.META_REDIRECT_URI_DEV || 'http://localhost:5000/api/v1/social/meta/callback');

const activeLinkedinRedirectUri = process.env.LINKEDIN_REDIRECT_URI || (isProd
  ? process.env.LINKEDIN_REDIRECT_URI_PROD || 'https://c2c-negk.onrender.com/api/v1/social/linkedin/callback'
  : process.env.LINKEDIN_REDIRECT_URI_DEV || 'http://localhost:5000/api/v1/social/linkedin/callback');


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
  GOOGLE_CLIENT_ID: z
    .string()
    .optional()
    .default('723882466133-dktl5rijt0uld6rcsbsui5oovted7jpo.apps.googleusercontent.com'),

  // Cloudinary Media Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Meta / Instagram Graph API Credentials
  META_APP_ID: z.string().optional().default(''),
  META_APP_SECRET: z.string().optional().default(''),
  META_REDIRECT_URI: z.string().optional().default('http://localhost:5000/api/v1/social/meta/callback'),

  // LinkedIn OAuth Credentials
  LINKEDIN_CLIENT_ID: z.string().optional().default('862ua0tj5ebtmp'),
  LINKEDIN_CLIENT_SECRET: z.string().optional().default(''),
  LINKEDIN_REDIRECT_URI: z.string().optional().default('https://c2c-negk.onrender.com/api/v1/social/linkedin/callback'),

  // Social Encryption & Publisher Mode ('LIVE' | 'MOCK')
  SOCIAL_TOKEN_ENCRYPTION_KEY: z.string().optional().default('brandflow_social_encryption_secret_key_32b'),
  SOCIAL_PUBLISHER_MODE: z.enum(['LIVE', 'MOCK']).optional().default('MOCK'),
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
  META_REDIRECT_URI: activeMetaRedirectUri,
  LINKEDIN_REDIRECT_URI: activeLinkedinRedirectUri,
});


if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
