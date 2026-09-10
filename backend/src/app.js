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

/**
 * 🔒 1. SECURITY & REVERSE PROXY CONFIGURATION:
 * 
 * A) app.disable('x-powered-by'):
 *    - Real World Analogy: Removing the brand label from your safe so thieves don't know what key lock picking tool to use.
 *    - Tech Reason: By default Express sends 'X-Powered-By: Express' header in every response. Disabling it prevents 
 *      hackers from fingerprinting our tech stack & targeting Express-specific exploits.
 * 
 * B) app.set('trust proxy', 1):
 *    - Real World Analogy: If 1,000 customers send letters via 1 Courier Boy (Nginx/Cloudflare/AWS), Express without this 
 *      thinks all 1,000 letters came from Courier Boy's home! Rate-limiters would block the Courier Boy & lock out EVERY user.
 *    - Tech Reason: Trusting 1st hop proxy reads 'X-Forwarded-For' header so req.ip returns the ACTUAL user's IP address.
 */
app.disable('x-powered-by');
app.set('trust proxy', 1);

/**
 * 🌐 2. CROSS-ORIGIN RESOURCE SHARING (CORS) & PREFLIGHT HANDLING:
 * 
 * A) What is CORS?
 *    - Real World Analogy: Browser = Strict Nightclub Bouncer.
 *    - If Frontend (Vite localhost:5173 or Vercel) calls Backend (localhost:5000), Browser BLOCKS it unless 
 *      Backend attaches a VIP Access Pass ('Access-Control-Allow-Origin').
 * 
 * B) Detailed breakdown of corsOptions:
 *    - origin: true -> Dynamic VIP Gate Pass. Echoes back whatever Frontend domain is knocking (Vite dev, Vercel prod).
 *    - credentials: true -> VIP Identity Wristband. Allows sending sensitive JWT Auth headers & HttpOnly cookies across domains.
 *    - methods -> Allowed Activities inside. Lists permitted HTTP actions (GET, POST, PUT, PATCH, DELETE, OPTIONS).
 *    - allowedHeaders -> Permitted Baggage items. Specifies allowed headers (Content-Type for JSON, Authorization for JWT).
 *    - optionsSuccessStatus: 200 -> Smooth Green Light. Sends '200 OK' instead of legacy '204 No Content' for preflight checks.
 * 
 * C) Why app.options('*', cors(corsOptions))? (PREFLIGHT POOCH-TAACH):
 *    - Real World Analogy: Phone call before visiting a restaurant to check if tables & credit cards are accepted.
 *    - Tech Reason: Before sending POST/PUT/DELETE requests with JWT headers, Chrome sends a secret HTTP 'OPTIONS' request 
 *      asking: "Hey Backend, will you allow a POST with JWT auth?". 
 *      app.options('*') acts as the automatic receptionist instantly replying "200 OK! Yes, come on in!".
 *      Without this line, browser preflights fail with red CORS errors in Developer Tools.
 */
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/**
 * 🛡️ 3. SECURITY HTTP HEADERS (HELMET):
 * 
 * A) What is Helmet?
 *    - Real World Analogy: Putting Bulletproof Armor & Tinted Glass on your HTTP responses.
 *    - Tech Reason: Injects 15+ security headers (X-Content-Type-Options, X-Frame-Options) to stop Clickjacking & XSS.
 * 
 * B) ENGINEERING USE CASES & RATIONALE FOR EACH OPTION:
 *    1. crossOriginResourcePolicy: 'cross-origin'
 *       - USE CASE: Allows React frontend (Vite/Vercel) to load backend BrandKit logos & render them inside HTML5 Canvas.
 *       - WHY: Default 'same-origin' causes browser to throw Canvas Taint errors & block image downloads.
 * 
 *    2. crossOriginOpenerPolicy: false
 *       - USE CASE: Allows "Login with Google" & "Login with LinkedIn" OAuth popup windows to communicate with main tab.
 *       - WHY: If true, COOP isolates the popup window & wipes 'window.opener', breaking OAuth callback handshake.
 * 
 *    3. crossOriginEmbedderPolicy: false
 *       - USE CASE: Allows rendering external media (e.g. Google profile avatars, Cloudinary CDN assets) inside frontend.
 *       - WHY: If true, browser blocks sub-resources unless external CDNs send explicit CORP opt-in headers.
 * 
 *    4. contentSecurityPolicy: false
 *       - USE CASE: Pure REST JSON API & Interactive Swagger Docs (/api/v1/docs).
 *       - WHY: CSP is for HTML websites to block inline <script> tags. REST APIs serve raw JSON (browsers never execute 
 *         script inside JSON). Enabling CSP adds 500-byte header overhead to every JSON response & breaks Swagger UI scripts.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

/**
 * 📥 4. REQUEST BODY & COOKIE PARSERS (PAYLOAD SECURITY & AUTH DECODING):
 * 
 * A) express.json({ limit: '10mb' }):
 *    - Real World Analogy: Package Weight Scale at the Mailroom.
 *    - USE CASE: Converts incoming JSON payloads into 'req.body'.
 *    - WHY 10MB: Caps memory allocation to allow base64 image & logo uploads while preventing Denial of Service (DoS) 
 *      attacks where hackers send 500MB payload bombs to crash Node.js process memory.
 * 
 * B) express.urlencoded({ extended: true, limit: '10mb' }):
 *    - USE CASE: Converts standard HTML form submissions ('application/x-www-form-urlencoded') into 'req.body'.
 *    - WHY extended: true: Uses the rich 'qs' library to parse complex nested objects & arrays from form posts.
 * 
 * C) cookieParser():
 *    - Real World Analogy: Decoder Badge for Secret Messages.
 *    - USE CASE: Reads raw HTTP 'Cookie' headers ("brandflow_refresh_token=...") & decodes them into 'req.cookies'.
 *    - WHY: Essential for JWT Refresh Token rotation (req.cookies[REFRESH_TOKEN_COOKIE_NAME]) during silent re-auth.
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

/**
 * 🏥 5. INFRASTRUCTURE & LOAD BALANCER HEALTH CHECK:
 * 
 * - Root /health vs /api/v1/health:
 *   1. Root '/health' (Here): AWS ALB / Docker Healthcheck / Render pings this un-rate-limited endpoint 
 *      every 10s to verify the Node.js container is healthy & ready to accept traffic.
 *   2. '/api/v1/health' (in router): Used by Postman & Frontend status dashboards under the versioned API router.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/v1', globalLimiter, apiRouter);

// 7. 404 Not Found & Global Error Handler Middleware
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});
app.use(errorHandler);

export default app;