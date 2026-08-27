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

// CORS Configuration - Must run FIRST before any security or body parsing middleware
const corsOptions = {
  origin: true, // Echoes back incoming request origin dynamically
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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security HTTP headers configured for cross-origin API access
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
