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

## 🔄 3. Complete Dev-to-Prod Workflow (How to Deploy Changes While Doing Development)

Follow this 5-step loop whenever you finish writing new features or bug fixes locally and want to release them to production:

```
[1. Local Development] ➔ [2. Build Frontend on Mac] ➔ [3. Push to Git] ➔ [4. Pull on EC2 & SCP Dist] ➔ [5. Restart Containers]
```

### Step 1: Work in Local Development Mode
While coding, run your local development environment:
```bash
# Start local development containers (with hot-reload):
docker compose up -d

# Frontend runs at: http://localhost:5173
# Backend runs at: http://localhost:5000/api/v1
```

---

### Step 2: Compile Frontend for Production on Your Mac (3 Seconds)
Once your changes are tested, build the production frontend bundle locally using your production Elastic IP or Domain:

```bash
cd frontend

# Compile with your production API URL:
VITE_API_BASE_URL="http://<YOUR_EC2_PUBLIC_IP>:5000/api/v1" npm run build
```
*(This produces the production assets in `frontend/dist/`)*

---

### Step 3: Push Your Code to Git
Commit and push your backend and configuration changes to your repository:

```bash
git add .
git commit -m "feat: your new feature or bug fix"
git push origin main
```

---

### Step 4: Deploy to Production EC2 Server

#### A. Pull updated code on EC2:
In your **EC2 SSH terminal**:
```bash
cd ~/C2C
git pull origin main
```

#### B. Upload the compiled `dist` folder from your Mac:
In your **Mac terminal** (inside `frontend/` folder):
```bash
# Ensure key permissions:
chmod 400 "path/to/brandflow-key.pem"

# Upload dist directly:
scp -i "path/to/brandflow-key.pem" -r dist ubuntu@<YOUR_EC2_PUBLIC_IP>:~/C2C/frontend/
```

---

### Step 5: Apply Changes on EC2

In your **EC2 SSH terminal**:

1. **If you changed Backend code**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build brandflow-backend
   ```

2. **If you changed Database Schema (`schema.prisma`)**:
   ```bash
   docker compose -f docker-compose.prod.yml exec brandflow-backend npx prisma db push
   ```

3. **If you only changed Frontend code**:
   - Done! Nginx immediately serves the updated `dist` files without needing any container restart.

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
# Push schema updates directly to PostgreSQL
docker compose -f docker-compose.prod.yml exec brandflow-backend npx prisma db push

# Seed production master data (SuperAdmin, Categories, Festivals, Frames, Templates)
docker compose -f docker-compose.prod.yml exec brandflow-backend npm run db:seed
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
