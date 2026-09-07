# 🐳 Production Docker Architecture & Operations Guide

This guide details everything you need to know about running **BrandFlow in Production using Docker** (`docker-compose.prod.yml`), focusing strictly on production Docker containers, multi-stage builds, performance optimizations, security, and container lifecycle management.

---

## 🏗️ 1. Production Docker Stack Architecture

Production uses `docker-compose.prod.yml` to orchestrate 4 hardened, high-performance containers:

```
                                  PORT 80 (HTTP)
                                        │
                                        ▼
                   ┌──────────────────────────────────────────┐
                   │          brandflow-frontend-prod         │
                   │  (Nginx Alpine - Static React Bundle)    │
                   └────────────────────┬─────────────────────┘
                                        │
                                  PORT 5000 (API)
                                        │
                                        ▼
                   ┌──────────────────────────────────────────┐
                   │          brandflow-backend-prod          │
                   │   (Node 20 Alpine - Production Mode)     │
                   └────────────────────┬─────────────────────┘
                                        │
                   ┌────────────────────┴────────────────────┐
                   │                                         │
            Port 5432 (Internal)                      Port 6379 (Internal)
                   ▼                                         ▼
   ┌───────────────────────────────┐         ┌───────────────────────────────┐
   │    brandflow-postgres-prod    │         │     brandflow-redis-prod      │
   │    (PostgreSQL 16 Alpine)     │         │       (Redis 7 Alpine)        │
   │    [Volume: postgres_data]    │         │     [Volume: redis_data]      │
   └───────────────────────────────┘         └───────────────────────────────┘
```

---

## ⚙️ 2. Production Multi-Stage Build Architecture

Production Dockerfiles use **Multi-Stage Targets** (`target: production`) to keep images small, secure, and fast.

### 🎨 Frontend Production Stage (`target: production` in `frontend/Dockerfile`)
- **Stage 1 (Build)**: Compiles React + Vite into static HTML, CSS, and JS bundles (`/dist`).
- **Stage 2 (Nginx Alpine Image)**: Discards Node.js and build tools completely (~1GB $\rightarrow$ **~25MB**). Serves static assets at lightning speed via Nginx with gzip compression on **Port 80**.

### ⚙️ Backend Production Stage (`target: production` in `backend/Dockerfile`)
- **Deterministic Clean Dependencies**: Runs `npm ci --omit=dev` to install only production dependencies (no Nodemon, test frameworks, or dev utilities).
- **Least Privilege Security (`USER node`)**: Switches execution user from `root` to unprivileged system user `node` to prevent container-escape vulnerabilities.

---

## 🚀 3. Production Docker Commands Lifecycle

### A. Starting the Production Docker Stack
Run this command to build and launch production containers in detached (background) mode:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

### B. Checking Production Container Status & Health
Verify that all 4 production containers are running and healthy:

```bash
docker compose -f docker-compose.prod.yml ps
```

---

### C. Viewing Production Logs
Inspect real-time logs for individual containers:

```bash
# View Backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# View Frontend Nginx logs
docker compose -f docker-compose.prod.yml logs -f frontend

# View PostgreSQL DB logs
docker compose -f docker-compose.prod.yml logs -f postgres
```

---

### D. Applying Database Changes in Production
Execute Prisma commands directly inside the running production backend container:

```bash
# Push schema updates to production PostgreSQL
docker exec brandflow-backend-prod npx prisma db push

# Seed production defaults (Categories, Templates, Styles)
docker exec brandflow-backend-prod npx prisma db seed
```

---

### E. Safely Restarting Containers
Restart containers without dropping database volumes or causing data loss:

```bash
# Restart backend container only
docker restart brandflow-backend-prod

# Restart entire production stack
docker compose -f docker-compose.prod.yml restart
```

---

### F. Stopping Production Stack Safely
Stop production containers while keeping all database data intact:

```bash
docker compose -f docker-compose.prod.yml down
```
> [!CAUTION]
> **NEVER use `docker compose -f docker-compose.prod.yml down -v` in production!**  
> The `-v` flag deletes database volumes (`postgres_data`), causing permanent loss of real production database tables!

---

## 💾 4. Production Volume & Database Backups

Database data is stored in the persistent Docker named volume `postgres_data`.

### Creating a Database Backup File:
```bash
docker exec brandflow-postgres-prod pg_dump -U postgres brandflow_db > ~/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restoring a Database Backup File:
```bash
cat ~/backup_20260907.sql | docker exec -i brandflow-postgres-prod psql -U postgres -d brandflow_db
```

---

## 🧹 5. Disk Space Optimization

Over time, building new Docker images leaves unused image layers. Run this command periodically on your server to free disk space:

```bash
# Safely remove unused dangling Docker build layers
docker image prune -f
```

---

## 📋 6. Summary Comparison: Local Dev vs Production Docker

| Feature | Local Dev (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
|---|---|---|
| **Build Target** | `target: development` | `target: production` |
| **Frontend Server** | Vite Dev Server (`port 5173`) | Nginx Web Server (`port 80`) |
| **Code Mirroring** | Host Bind Mounts (`./backend:/app`) | None (Immutably baked into image) |
| **Hot Reloading** | Active (HMR / Node watch) | Off (Compiled static build) |
| **Restart Policy** | `unless-stopped` | `always` (Auto-restarts on server reboot) |
| **Database Port** | Host `5432:5432` | Host `5432:5432` (Persistent volume) |
