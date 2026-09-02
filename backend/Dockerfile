# Multi-Stage Dockerfile for BrandFlow Backend

# ==========================================
# STAGE 1: Base Dependencies
# ==========================================
# Use lightweight Node.js 20 on Alpine Linux as base image
FROM node:20-alpine AS base

# Set the working directory inside the container
WORKDIR /app

# Install essential system runtime dependencies for Alpine Linux:
# - openssl     : Provides cryptographic and SSL/TLS libraries required by Prisma ORM engine & security calls.
# - libc6-compat: Provides glibc compatibility layer for Alpine (musl libc) so Prisma native query engine runs smoothly.
RUN apk add --no-cache openssl libc6-compat

# Copy dependency manifests and Prisma schema for efficient Docker layer caching
COPY package*.json ./
COPY prisma ./prisma/

# ==========================================
# STAGE 2: Development Stage
# ==========================================
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including devDependencies)
RUN npm install

# Copy application source code into the container
COPY . .

# Generate Prisma Client binaries
RUN npx prisma generate

EXPOSE 5000

# Container Healthcheck Configuration:
# - --interval=30s    : Poll server health every 30 seconds
# - --timeout=5s     : Max response wait time before test times out
# - --start-period=10s: App initialization grace period before counting test failures
# - --retries=3       : Flag container as UNHEALTHY after 3 consecutive failures
# - --no-verbose      : Suppress noisy request output to keep container logs clean
# - --tries=1         : Attempt request only once without internal retries (delegates retries to Docker)
# - wget --spider     : Perform HTTP HEAD check to /health route without downloading body
# - || exit 1         : Signal failure (exit code 1) to Docker/Orchestrator if health route fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start application in hot-reload development mode
CMD ["npm", "run", "dev"]

# ==========================================
# STAGE 3: Production Build Stage
# ==========================================
FROM base AS production
ENV NODE_ENV=production

# Install production-only dependencies strictly from lockfile
RUN npm ci --omit=dev

# Copy application source code into container
COPY . .

# Generate Prisma Client binaries for production environment
RUN npx prisma generate

# Security & Networking Configuration:
# - USER node   : Switch from default 'root' user to unprivileged 'node' user (Principle of Least Privilege).
#                 Prevents container escape vulnerabilities and unauthorized filesystem access in production.
# - EXPOSE 5000 : Documents that the Express backend server inside the container listens on port 5000.
#                 Used by Docker networking, Nginx reverse proxy, and cloud orchestrators.
USER node
EXPOSE 5000

# Production Container Healthcheck Configuration:
# - --interval=30s    : Poll server health every 30 seconds
# - --timeout=5s     : Max response wait time before test times out
# - --start-period=15s: Extended grace period for production app & DB connection boot
# - --retries=3       : Flag container as UNHEALTHY after 3 consecutive failures to trigger auto-restart
# - --no-verbose      : Suppress noisy request output to keep container logs clean
# - --tries=1         : Attempt request only once without internal retries (delegates retries to Docker)
# - wget --spider     : Perform HTTP HEAD check to /health route without downloading body
# - || exit 1         : Signal failure (exit code 1) to Docker/Orchestrator if health route fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start production application server
CMD ["node", "src/server.js"]

