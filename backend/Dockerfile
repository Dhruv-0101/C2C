# Multi-Stage Dockerfile for BrandFlow Backend

# ==========================================
# STAGE 1: Base Dependencies
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat python3 make g++ linux-headers

COPY package*.json ./
COPY prisma ./prisma/

# ==========================================
# STAGE 2: Development Stage
# ==========================================
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["npm", "run", "dev"]

# ==========================================
# STAGE 3: Production Build Stage
# ==========================================
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
