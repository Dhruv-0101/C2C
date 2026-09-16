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

## ⚙️ 2. Production Architecture & Performance Strategy

To ensure zero server freeze, minimal RAM usage, and instant deployments on cloud servers (like AWS EC2 `t2.micro` / `t3.micro`):

### 🎨 Frontend: Ultra-Fast Pre-Built Static Serving (Nginx Alpine)
- **Built on Local Mac (3 to 5 Seconds)**: React + Vite is compiled locally into high-performance static HTML, CSS, and JS bundles (`frontend/dist`).
- **Served by Nginx Container (~15MB)**: On the production server, `brandflow-frontend-prod` runs pure `nginx:alpine` and mounts the pre-compiled `dist` folder.
- **Why this matters**:
  - Eliminates Node.js and `npm` build overhead completely from the server.
  - Zero RAM spikes and zero risk of the server freezing during deployments.
  - Serving static assets through Nginx with Gzip compression and browser caching.

### ⚙️ Backend: Hardened Production Stage (`target: production`)
- **Clean Dependencies**: Runs `npm ci --omit=dev` to install strictly production dependencies (excluding dev tools like nodemon).
- **Prisma Native Engine**: Prisma Client is pre-generated inside Alpine Linux with OpenSSL and libc compatibility.
- **Least Privilege Security (`USER node`)**: Runs as unprivileged system user `node` to prevent container-escape vulnerabilities.

---

## 🔄 3. Fast Dev-to-Prod Workflow (Instant Deployments)

Choose your change scenario below to deploy to production in seconds:

---

### ⚡ Scenario A: YOU ONLY CHANGED FRONTEND (UI, React, CSS, Pages)
*(Takes 4 seconds • Zero downtime • No server restart needed)*

Because the frontend is served statically by Nginx, you don't even need to touch the EC2 terminal!

1. In your **Mac terminal**:
   ```bash
   cd frontend
   npm run deploy:prod
   ```
   > 💡 *What `npm run deploy:prod` does in one shot:*
   > 1. Builds production assets with `VITE_API_BASE_URL="https://13-234-177-70.sslip.io/api/v1"`
   > 2. Secures key permissions (`chmod 400`)
   > 3. Uploads `dist` directly to EC2 via SCP

2. **In your Browser**:
   - Hard refresh to purge browser cache:
     - **Mac**: `Cmd + Shift + R`
     - **Windows**: `Ctrl + Shift + R` or `Ctrl + F5`
   - **Your changes are live immediately!**

---

### ⚡ Scenario B: YOU ONLY CHANGED BACKEND (API, Controllers, Routes, Services)
*(Takes 15 seconds • Frontend, DB & Redis remain 100% online)*

1. On your **Mac terminal**:
   ```bash
   git add backend/
   git commit -m "feat: update backend logic"
   git push origin main
   ```

2. On your **EC2 SSH terminal**:
   ```bash
   cd ~/C2C
   git pull origin main
   docker compose -f docker-compose.prod.yml up -d --build brandflow-backend
   ```
   *Only the backend container will re-build and reload. Everything else stays running.*

---

### ⚡ Scenario C: YOU CHANGED DATABASE SCHEMA (`schema.prisma`)
*(Takes 20 seconds • Safely migrates live PostgreSQL database via tracked migrations)*

1. On your **Mac terminal**:
   ```bash
   # 1. Generate tracked migration file:
   docker compose exec --user root brandflow-backend npx prisma migrate dev --name update_feature
   
   # 2. Commit and push both schema & migrations:
   git add backend/prisma/
   git commit -m "db: update database schema"
   git push origin main
   ```

2. On your **EC2 SSH terminal**:
   ```bash
   cd ~/C2C
   git pull origin main
   # 1. Rebuild backend container with updated Prisma Client:
   docker compose -f docker-compose.prod.yml up -d --build brandflow-backend
   
   # 2. Apply pending migrations safely to live PostgreSQL (Zero data loss):
   docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npx prisma migrate deploy
   ```

---

### ⚡ Scenario D: YOU CHANGED BOTH FRONTEND & BACKEND
1. **Frontend**:
   ```bash
   cd frontend && npm run deploy:prod
   ```
2. **Backend**:
   - On Mac: `git add . && git commit -m "feat: full stack update" && git push origin main`
   - On EC2: `git pull origin main && docker compose -f docker-compose.prod.yml up -d --build brandflow-backend`

---

### ⚡ Scenario E: YOU CHANGED ENVIRONMENT VARIABLES (`.env`)
*(Takes 5 seconds)*

1. On your **EC2 SSH terminal**:
   ```bash
   cd ~/C2C
   nano .env
   ```
2. Edit the variable ➔ Save (`Ctrl + O` ➔ `Enter` ➔ `Ctrl + X`).
3. Restart backend container to apply new env:
   ```bash
   docker compose -f docker-compose.prod.yml restart brandflow-backend
   ```

---

## 🚀 4. Production Docker Commands Cheat Sheet

### A. Starting the Production Docker Stack
Launch all 4 production containers in detached (background) mode:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

### B. Checking Container Status & Health
```bash
docker compose -f docker-compose.prod.yml ps
```

---

### C. Viewing Real-Time Logs
```bash
# View Backend logs (Ctrl + C to exit)
docker compose -f docker-compose.prod.yml logs -f brandflow-backend

# View Frontend Nginx access logs
docker compose -f docker-compose.prod.yml logs -f brandflow-frontend

# View PostgreSQL Database logs
docker compose -f docker-compose.prod.yml logs -f brandflow-postgres
```

---

### D. Applying Database Changes in Production
```bash
# Apply all tracked migrations safely to production PostgreSQL (Recommended):
docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npx prisma migrate deploy

# (Or rapid prototyping / un-tracked push fallback):
# docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npx prisma db push

# Seed production master data (SuperAdmin, Categories, Festivals, Frames, Templates):
docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npm run db:seed
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

## 💾 5. Production Volume & Database Backups

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

## 🧹 6. Disk Space Optimization

Over time, building new Docker images leaves unused image layers. Run this command periodically on your server to free disk space:

```bash
# Safely remove unused dangling Docker build layers
docker image prune -f
```

---

## 📋 7. Summary Comparison: Local Dev vs Production Docker

| Feature | Local Dev (`docker-compose.yml`) | Production (`docker-compose.prod.yml`) |
|---|---|---|
| **Build Target** | `target: development` (Local watch) | `nginx:alpine` + Node prod |
| **Frontend Server** | Vite Dev Server (`port 5173`) | Nginx Web Server (`port 8080/80`) |
| **Frontend Compilation** | Live in-browser (HMR) | Pre-compiled on Mac in 3s (`dist`) |
| **Code Mirroring** | Host Bind Mounts (`./backend:/app`) | Pre-built dist + Baked backend |
| **Hot Reloading** | Active (HMR / Node watch) | Off (Compiled static bundle) |
| **Restart Policy** | `unless-stopped` | `always` (Auto-restarts on reboot) |
| **Database Port** | Host `5432:5432` / `5433` | Host `5432:5432` (Persistent volume) |
