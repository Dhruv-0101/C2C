# BrandFlow Docker Architecture & Deployment Guide 🐳
================================================================================

This document provides a comprehensive, step-by-step technical explanation of how the BrandFlow application operates inside Docker across both **Local Development** and **Live Production** environments.

---

## 🏗️ 1. High-Level System Architecture

BrandFlow is orchestrated into **4 independent, self-contained micro-services**:

```
                              ┌──────────────────────────────────┐
                              │          HOST BROWSER            │
                              └─────────────┬───────┬────────────┘
                                            │       │
                     Port 5173 (Dev) / 80 (Prod)   Port 5000 (API)
                                            │       │
                                            ▼       ▼
    ┌─────────────────────────┐                   ┌─────────────────────────┐
    │     FRONTEND SERVICE    │ ─── API (5000) ─► │     BACKEND SERVICE     │
    │  (Vite Dev / Nginx Prod)│                   │  (Express + Prisma ORM) │
    └─────────────────────────┘                   └────────────┬────────────┘
                                                               │
                                         ┌─────────────────────┴─────────────────────┐
                                         │                                           │
                                  Port 5432 (Internal)                        Port 6379 (Internal)
                                         ▼                                           ▼
                            ┌─────────────────────────┐                 ┌─────────────────────────┐
                            │    POSTGRESQL SERVICE   │                 │      REDIS SERVICE      │
                            │   (PostgreSQL 16 Alpine)│                 │     (Redis 7 Alpine)    │
                            │   [Volume: postgres_data]│                │    [Volume: redis_data] │
                            └─────────────────────────┘                 └─────────────────────────┘
```

---

## 💻 2. Local Development Environment (`docker-compose.yml`)

### Primary Objective:
Fast developer feedback loop with **Instant Hot-Reloading** and zero manual database/cache setup.

### How It Works:
1. **Source Code Bind Mounts (`./backend:/app` & `./frontend:/app`):**
   - Whenever you save a file in VS Code on your laptop, the file is instantly mirrored inside the running container.
   - Vite (Frontend) triggers **Fast Refresh (HMR)** in `~50ms`.
   - Node.js (Backend) restarts the Express process automatically (`--watch`).

2. **Volume Masking (`/app/node_modules`):**
   - An anonymous volume prevents your Windows host machine's `node_modules` from overwriting the Linux-compiled `node_modules` inside the container.

3. **Wildcard Host Binding (`--host 0.0.0.0`):**
   - Allows your laptop browser (`http://localhost:5173`) to cross the Docker container network boundary.

4. **Ordered Health-Dependent Startup (`depends_on.condition: service_healthy`):**
   - The Express backend **waits** until PostgreSQL (`pg_isready`) and Redis (`redis-cli ping`) are 100% ready before booting.

### How to Run Development:
```bash
# 1. Start all 4 containers with real-time logs:
docker compose up --build

# 2. Start in background (detached mode):
docker compose up -d

# 3. View live logs:
docker compose logs -f backend

# 4. Stop development containers:
docker compose down
```

| Service | Local URL / Port | Technology |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | React 18 + Vite Dev Server |
| **Backend REST API** | `http://localhost:5000` | Node.js 20 Express Server |
| **PostgreSQL Database** | `localhost:5432` | PostgreSQL 16 Alpine |
| **Redis Queue & Cache** | `localhost:6379` | Redis 7 Alpine (BullMQ) |

---

## 🚀 3. Live Production Environment (`docker-compose.prod.yml`)

### Primary Objective:
Maximum throughput, security hardening, minimal memory footprint, and 24/7 high-availability.

### How It Works:
1. **Ultra-Lightweight Static Nginx Web Server (Frontend):**
   - Multi-stage Docker build compiles React into a static production bundle (`/app/dist`).
   - The Node.js build tools (~1GB) are completely discarded.
   - The final production container uses **Nginx Alpine (~25MB image)** to serve static files with gzip compression on **Port 80**.

2. **Security Hardening (`USER node` in Backend):**
   - The container runs as the unprivileged system user `node` (Principle of Least Privilege).
   - Prevents container-escape vulnerabilities in production.

3. **Deterministic Clean Install (`npm ci --omit=dev`):**
   - Installs production-only dependencies strictly from `package-lock.json`.
   - Leaves out devDependencies (Nodemon, testing suites, build scripts).

4. **Zero Code Mounts:**
   - Source code is immutably baked into the Docker image layers.

5. **Auto-Recovery (`restart: always`):**
   - If the VPS/EC2 server reboots or a container crashes due to high traffic spikes, Docker automatically brings the container back online.

### How to Run Production (e.g. on AWS EC2 / VPS):
```bash
# 1. Build and start production stack in background:
docker compose -f docker-compose.prod.yml up -d --build

# 2. Run Database Migrations & Initial Master Seeds:
docker compose -f docker-compose.prod.yml exec backend npm run db:deploy

# 3. View production container status & health:
docker compose -f docker-compose.prod.yml ps

# 4. Gracefully stop production stack:
docker compose -f docker-compose.prod.yml down
```

---

## 🔐 4. Environment Variables Architecture

Environment variables use the **`${VARIABLE:-fallback_default}`** interpolation standard:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-postgres}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgrespassword2026}
  POSTGRES_DB: ${POSTGRES_DB:-brandflow_db}
```

### Flow of Variables:
1. **Local Development:**
   - Docker Compose reads from the root **`.env`** file.
   - If a key is missing, the safe local fallback (`:-default`) applies automatically.
2. **Production Server (AWS EC2 / VPS):**
   - The server has a private `.env` file (created from `.env.example`).
   - Real database passwords and API secrets override the local fallbacks.
3. **Cloud PaaS (Render / AWS ECS / Railway):**
   - Secrets are injected via the Cloud Provider's Web Dashboard directly into `process.env`.

---

## 💾 5. Data Persistence (Zero Data Loss)

Docker containers are ephemeral (temporary). To prevent database loss when containers are stopped or updated:

```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

- **`postgres_data`**: Stores PostgreSQL database tables, user records, and schema data permanently on the host disk.
- **`redis_data`**: Stores Redis cache snapshots and BullMQ queue state permanently on the host disk.
- Even if you run `docker compose down`, your data remains **100% safe and intact**.

---

## 🩺 6. Automated Healthchecks & Self-Healing

Every service is equipped with automated healthcheck probes:

| Service | Healthcheck Command | Purpose |
| :--- | :--- | :--- |
| **PostgreSQL** | `pg_isready -U postgres -d brandflow_db` | Confirms database is accepting SQL queries |
| **Redis** | `redis-cli ping` | Confirms in-memory queue engine is active |
| **Backend** | `wget --no-verbose --spider http://localhost:5000/health` | Tests Express API server responsiveness |
| **Frontend** | `wget --no-verbose --spider http://localhost:80/` | Tests Nginx web server HTTP responses |

If an unhealthy state is detected for 3 consecutive intervals, orchestrators trigger an automatic container restart.

---

## 🛠️ 7. Developer Cheat Sheet & Useful Commands

```bash
# Open interactive shell inside running backend container:
docker compose exec backend sh

# Run database seed manually:
docker compose exec backend npm run db:seed

# Inspect PostgreSQL directly via psql CLI inside container:
docker compose exec postgres psql -U postgres -d brandflow_db

# Check real-time resource consumption (CPU & RAM):
docker stats

# Clean up all unused images & dangling build caches:
docker system prune -f
```
