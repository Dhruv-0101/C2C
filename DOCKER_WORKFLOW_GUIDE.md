# BrandFlow Docker Architecture, Developer Workflow & Troubleshooting Guide 🐳
================================================================================

This guide is the single source of truth for **BrandFlow** developers. It covers **First-Time Collaborator Setup**, **Ongoing Day-to-Day Development Workflow**, **Production Deployment**, and **Comprehensive Troubleshooting**.

---

## 🏗️ 1. High-Level System Architecture

BrandFlow is orchestrated into **4 self-contained microservices**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOCAL / CLIENT BROWSER                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      Port 5173 (Dev) / Port 80 (Prod)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND SERVICE                                 │
│          - Local Dev: Vite Dev Server (HMR enabled on Port 5173)            │
│          - Production: Nginx Static Web Server (Port 80 / 8080)             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                             API Requests (Port 5000)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND SERVICE                                 │
│          - Node.js 20 / Express REST API (Port 5000)                        │
│          - Authentication, Prisma ORM, BullMQ Worker Queues                 │
└──────────────────┬──────────────────────────────────────┬───────────────────┘
                   │                                      │
       Port 5432 (Internal)                     Port 6379 (Internal)
                   ▼                                      ▼
┌─────────────────────────────────────┐┌──────────────────────────────────────┐
│        POSTGRESQL DATABASE          ││             REDIS ENGINE             │
│        - PostgreSQL 16 Alpine       ││             - Redis 7 Alpine         │
│        - Volume: postgres_data      ││             - Volume: redis_data     │
└─────────────────────────────────────┘└──────────────────────────────────────┘
```

---

## 🚀 2. First-Time Collaborator Setup Guide (Step-by-Step)

Follow these exact steps if you are setting up BrandFlow on a new machine for the first time:

### Prerequisites:
1. **Docker Desktop** installed and running on your laptop ([Download Docker](https://www.docker.com/products/docker-desktop/)).
2. **Git** installed ([Download Git](https://git-scm.com/)).
3. **Node.js v20+** installed locally for local helper scripts & frontend bundling ([Download Node.js](https://nodejs.org/)).

---

### Step 2.1: Clone Repository
Open your terminal and clone the project:

```bash
git clone <YOUR_REPOSITORY_URL> C2C
cd C2C
```

---

### Step 2.2: Set Up Environment Variables
Create your local `.env` configuration file from the template:

```bash
# Copy example environment file to .env
cp .env.example .env
```

*(The `.env.example` file contains pre-configured local development defaults for PostgreSQL, Redis, JWT, and ports, so no immediate edits are required to get started locally).*

---

### Step 2.3: Build & Launch Docker Stack
Launch all 4 containers in detached mode:

```bash
docker compose up -d --build
```

Docker will:
1. Pull PostgreSQL 16 and Redis 7 Alpine images.
2. Build local development containers for Backend and Frontend.
3. Automatically wait until PostgreSQL (`pg_isready`) and Redis (`ping`) are fully healthy before starting Express.

---

### Step 2.4: Sync Database Schema & Seed Master Data
Once the containers are running, run Prisma migrations and seed default SuperAdmin & initial data into PostgreSQL:

```bash
# 1. Apply database migrations:
docker compose exec --user root backend npx prisma migrate dev

# 2. Seed initial master data (SuperAdmin, Categories, Templates):
docker compose exec --user root backend npm run db:seed
```

---

### Step 2.5: Verify Application URLs

Open your browser and verify all services:

| Component | Local URL | Default Credentials / Info |
| :--- | :--- | :--- |
| 🟢 **Frontend App** | `http://localhost:5173` | React + Vite UI |
| ⚡ **Backend API** | `http://localhost:5000/api/v1` | Express REST API |
| 🗄️ **PostgreSQL DB** | `localhost:5432` | User: `postgres` \| DB: `brandflow_db` |
| 🔴 **Redis Engine** | `localhost:6379` | BullMQ & Caching |
| 🔐 **SuperAdmin Login** | `http://localhost:5173/login` | **Email**: `admin@brandflow.com`<br>**Password**: `Admin@123456` |

---

## ⚡ 3. Ongoing Development Workflow (Day-to-Day Guide)

Use this section during daily development tasks.

### 3.1: Daily Startup & Shutdown

```bash
# Start development environment:
docker compose up -d

# View live real-time logs for backend:
docker compose logs -f backend

# View live real-time logs for all services:
docker compose logs -f

# Stop development environment (keeps database data safe):
docker compose down
```

---

### 3.2: Making Frontend Changes (UI / React / CSS)
- Edit files inside `./frontend/src/`.
- **Hot Module Replacement (HMR)** is enabled automatically. Changes reflect in your browser in `~50ms` without restarting containers.

---

### 3.3: Making Backend Changes (Routes / Controllers / Logic)
- Edit files inside `./backend/src/`.
- Node.js runs with `--watch` mode inside Docker. Saving any backend file automatically reloads the Express server.

---

### 3.4: Changing Database Schema (`schema.prisma`)
When you add or update models in `./backend/prisma/schema.prisma`:

```bash
# 1. Generate Prisma client & create tracked migration file:
docker compose exec --user root backend npx prisma migrate dev --name <describe_your_change>

# Example:
# docker compose exec --user root backend npx prisma migrate dev --name add_post_analytics
```

---

### 3.5: Installing New NPM Packages

#### For Frontend Packages:
```bash
# Option A (Local Mac/PC install + container mirror):
cd frontend
npm install <package_name>
cd ..

# Re-sync container node_modules:
docker compose up -d --build frontend
```

#### For Backend Packages:
```bash
# Option A (Local Mac/PC install + container mirror):
cd backend
npm install <package_name>
cd ..

# Re-sync container node_modules:
docker compose up -d --build backend
```

---

## 🚀 4. Live Production Deployment Quick Reference

Production uses `docker-compose.prod.yml` with optimized multi-stage builds.

### Deploying Updates to EC2:

1. **Frontend Updates (Ultra-Fast 3-Second Build)**:
   ```bash
   cd frontend
   VITE_API_BASE_URL="https://13-234-177-70.sslip.io/api/v1" npm run build
   scp -i "/Users/mac0011/Downloads/brandflow-c2c.pem" -r dist ubuntu@13.234.177.70:~/C2C/frontend/
   cd ..
   ```

2. **Backend Updates**:
   ```bash
   # On Mac:
   git add backend/ && git commit -m "feat: backend update" && git push origin main

   # On EC2 Terminal:
   cd ~/C2C
   git pull origin main
   docker compose -f docker-compose.prod.yml up -d --build brandflow-backend
   ```

3. **Production Database Migration**:
   ```bash
   docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npx prisma migrate deploy
   ```

---

## 🔍 5. Comprehensive Troubleshooting & Error Resolution Guide

### 🚨 Issue 1: `bind: address already in use` (Port Conflict)

#### Symptom:
`Error response from daemon: driver failed programming external connectivity on endpoint brandflow-postgres: bind: address already in use (5432 / 5000 / 5173 / 6379)`

#### Cause:
A local process (e.g. PostgreSQL installed via Homebrew, local Node server, or Redis background service) is already occupying that port on your laptop.

#### Solution:
Identify and kill the process occupying the port:

```bash
# 1. Find process ID (PID) using port 5432:
sudo lsof -i :5432

# 2. Kill all processes occupying port 5432:
sudo kill -9 $(sudo lsof -t -i:5432)

# (Or for PostgreSQL specifically on Mac Homebrew):
brew services stop postgresql

# (Or for Redis specifically on Mac Homebrew):
brew services stop redis

# 3. Restart Docker stack:
docker compose up -d
```

---

### 🚨 Issue 2: Backend Container Crashing / Cannot Connect to Database (`ECONNREFUSED`)

#### Symptom:
Backend container repeatedly restarts or prints `PrismaClientInitializationError: Can't reach database server at postgres:5432`.

#### Solution:
1. Verify PostgreSQL container status:
   ```bash
   docker compose ps
   ```
2. Check PostgreSQL logs for errors:
   ```bash
   docker compose logs postgres
   ```
3. Restart database container and verify health probe:
   ```bash
   docker compose restart postgres
   ```

---

### 🚨 Issue 3: Prisma Permission Error (`EACCES: permission denied`)

#### Symptom:
Running `npx prisma migrate` throws permission errors inside the container.

#### Cause:
The backend container runs as a non-root user by default for security, but creating migration files requires file system write access.

#### Solution:
Always pass `--user root` when executing Prisma migration commands inside Docker:

```bash
docker compose exec --user root backend npx prisma migrate dev
```

---

### 🚨 Issue 4: `MODULE_NOT_FOUND` / Package Missing Inside Container

#### Symptom:
You installed a package locally (`npm install foo`), but Node inside Docker throws `Error: Cannot find module 'foo'`.

#### Cause:
The host's `node_modules` is isolated from the container's `/app/node_modules` via volume masking.

#### Solution:
Rebuild the container image so `package.json` changes are installed inside Docker:

```bash
docker compose up -d --build backend
```

---

### 🚨 Issue 5: Vite HMR (Hot Refresh) Not Updating in Browser

#### Symptom:
Editing files in `./frontend/src/` does not update the browser UI automatically.

#### Solution:
1. Ensure Vite container is running with polling enabled if using Docker Desktop:
   Check `docker-compose.yml` environment variable for frontend:
   ```yaml
   environment:
     - CHOKIDAR_USEPOLLING=true
   ```
2. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows).

---

### 🚨 Issue 6: Resetting Local Database (Fresh Clean Slate)

#### Symptom:
Data is corrupted or schema migrations are out of sync during local testing, and you want to completely wipe the local database and start fresh.

#### Solution:

```bash
# 1. Stop containers and delete named volumes:
docker compose down -v

# 2. Re-launch stack:
docker compose up -d --build

# 3. Re-run migrations and seeds:
docker compose exec --user root backend npx prisma migrate dev
docker compose exec --user root backend npm run db:seed
```
*(Note: Never run `docker compose down -v` in Production!)*

---

### 🚨 Issue 7: Disk Space Full / Docker Cache Bloat

#### Symptom:
`No space left on device` or Docker builds becoming extremely slow.

#### Solution:
Clean up dangling images, unused build caches, and stopped containers:

```bash
# Safely prune unused build caches and stopped containers:
docker system prune -f

# Include unused volumes (Caution: back up important dev data first):
docker system prune -a --volumes -f
```

---

## 🛠️ 6. Quick Commands Reference Table

| Action | Command |
| :--- | :--- |
| **Start Dev Stack** | `docker compose up -d --build` |
| **Stop Dev Stack** | `docker compose down` |
| **View Live Logs** | `docker compose logs -f [service_name]` |
| **Run Migrations** | `docker compose exec --user root backend npx prisma migrate dev` |
| **Run Database Seed** | `docker compose exec --user root backend npm run db:seed` |
| **Open Container Shell** | `docker compose exec backend sh` |
| **Open Postgres CLI** | `docker compose exec postgres psql -U postgres -d brandflow_db` |
| **Check Container Stats** | `docker stats` |
| **Prune Docker Cache** | `docker system prune -f` |
