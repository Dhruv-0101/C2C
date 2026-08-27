import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { NotFoundError } from './common/errors/custom-errors.js';
import { errorHandler } from './common/middleware/error.middleware.js';
import { globalLimiter } from './common/middleware/rate-limiter.middleware.js';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';

const app = express();

// Trust reverse proxy (Render / Cloudflare) for correct client IP detection
app.set('trust proxy', 1);

// 1. CORS Configuration - MUST BE FIRST BEFORE HELMET OR ANY OTHER MIDDLEWARE
const corsOptions = {
  origin: true, // Dynamically echoes back incoming request origin (e.g. https://c2-c-puce.vercel.app)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  optionsSuccessStatus: 200,
};

// Register Express CORS middleware and wildcard OPTIONS handler
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Bulletproof CORS header fallback middleware to GUARANTEE headers on every single response
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 2. Security HTTP headers configured for cross-origin API access
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Root Route & API Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: env.NODE_ENV });
});

// Apply Global Rate Limiting to API routes
app.use('/api/v1', globalLimiter, apiRouter);

// 404 Route Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
