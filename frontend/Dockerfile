# Multi-Stage Dockerfile for BrandFlow Frontend (Vite + React)

# ==========================================
# STAGE 1: Base Dependencies
# ==========================================
# Use lightweight Node.js 20 on Alpine Linux as base image
FROM node:20-alpine AS base

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests for efficient Docker layer caching
COPY package*.json ./

# ==========================================
# STAGE 2: Development Stage
# ==========================================
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including devDependencies like Vite)
RUN npm install

# Copy application source code into container
COPY . .

EXPOSE 5173

# Development Container Healthcheck:
# Verify Vite dev server is responding on port 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Start Vite dev server in Docker:
# - ["npm", "run", "dev", ...]: Array Exec Form to handle container termination signals (SIGTERM/SIGINT) cleanly
# - --                       : Pass-through separator for passing flags directly to Vite CLI
# - --host 0.0.0.0           : Bind Vite to wildcard IP (all interfaces) so host machine browser (localhost:5173) can reach the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ==========================================
# STAGE 3: Production Build Stage
# ==========================================
FROM base AS builder
ENV NODE_ENV=production

# Clean install dependencies strictly from package-lock.json
RUN npm ci

# Copy application source code into container
COPY . .

# Build static production bundle (outputs to /app/dist)
RUN npm run build

# ==========================================
# STAGE 4: Production Web Server (Nginx)
# ==========================================
# Use ultra-lightweight Nginx Alpine image to serve static assets
FROM nginx:alpine AS production

# Copy compiled static HTML/JS/CSS assets from builder stage into Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Production Container Healthcheck Configuration:
# - --interval=30s    : Poll Nginx web server health every 30 seconds
# - --timeout=5s     : Max wait time before test times out
# - --start-period=5s : Startup grace period for Nginx boot
# - --retries=3       : Flag container UNHEALTHY after 3 consecutive failures
# - --no-verbose      : Keep Nginx container logs clean
# - --tries=1         : Attempt single check without internal retries
# - wget --spider     : Perform HTTP HEAD check to Nginx root (port 80)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx Web Server:
# - nginx             : Nginx web server binary executable
# - -g "daemon off;" : Run Nginx in foreground (non-daemon) mode to prevent Docker main process (PID 1) from exiting immediately
CMD ["nginx", "-g", "daemon off;"]

