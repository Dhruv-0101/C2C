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

// Trust reverse proxy headers from Render/Vercel/Nginx
app.set('trust proxy', 1);

// 1. Universal Bulletproof CORS & Preflight Interceptor (FIRST MIDDLEWARE IN PIPELINE)
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods');

  // Immediately terminate OPTIONS preflight requests with HTTP 200 OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Fallback Standard CORS Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);
app.options('*', cors());

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
