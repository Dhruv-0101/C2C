# 🤝 Collaborator Docker Workflow Guide for BrandFlow

This guide explains how collaborators on the team can seamlessly write code in **Frontend** and **Backend** while running the application inside Docker, including **when changes sync automatically**, **when Docker commands are required**, and **how to push changes to production**.

---

## 🚀 1. First-Time Developer Setup (One-Time Onboarding)

If you are joining the BrandFlow project for the first time on a new laptop, follow these 5 quick steps to get running in under 2 minutes:

### Step 1: Clone Repository & Open Folder
```bash
git clone <REPOSITORY_URL> C2C
cd C2C
```

### Step 2: Create Local Environment Configuration
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
*(Pre-set local environment defaults work 100% out-of-the-box with Docker)*

### Step 3: Build & Launch Docker Containers
```bash
docker compose up -d --build
```

### Step 4: Sync Database Schema & Seed Initial Data
```bash
# 1. Apply all tracked migrations to your local database (--user root prevents permission issues):
docker compose exec --user root brandflow-backend npx prisma migrate deploy

# (Or if initializing without migration history):
# docker compose exec --user root brandflow-backend npx prisma db push

# 2. Seed default categories, templates, frames & SuperAdmin:
docker compose exec --user root brandflow-backend npm run db:seed
```

### Step 5: Access Application
- 🎨 **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend REST API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- 🏥 **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- 🔐 **Initial SuperAdmin Credentials**:
  - **Email**: `admin1@gmail.com` (or `admin@brandflow.com`)
  - **Password**: `admin1` (or `Admin@123456`)

---

## ⚡ 2. Daily Code Editing (Automatic Hot-Reloading)

When you make changes to regular source code files, **you DO NOT need to restart or rebuild Docker!**

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      LOCAL CODE EDITING WORKFLOW                          │
├───────────────────────────────────────────────────────────────────────────┤
│ 1. Open project in VS Code / IDE.                                          │
│ 2. Edit any .jsx, .css, .js, or API file.                                 │
│ 3. Press Save (Ctrl+S / Cmd+S).                                           │
│ 4. Docker container syncs code instantly via Bind Mounts!                 │
└───────────────────────────────────────────────────────────────────────────┘
```

### 🎨 Frontend Changes (`frontend/src/...`)
- **What happens?** Vite HMR (Hot Module Replacement) detects file saves instantly.
- **Browser Output**: The browser at `http://localhost:5173` updates automatically in **~50 milliseconds** without losing state or needing a page refresh.

### ⚙️ Backend Changes (`backend/src/...`)
- **What happens?** Node `--watch` process detects saved `.js` files.
- **Server Output**: Express server automatically restarts in **<1 second** inside the container. Check logs via `docker compose logs -f brandflow-backend`.

---

## 🔄 3. Database Migration Workflow & Team Sync (Git Tracking)

To maintain a clean, auditable SQL history across all developers and production without data loss, BrandFlow uses **Prisma Versioned Migrations (`prisma migrate`)**.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE MIGRATION LIFECYCLE                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. Developer edits schema.prisma                                                 │
│ 2. Developer runs: prisma migrate dev --name <feature_name>                      │
│ 3. Prisma creates: backend/prisma/migrations/<timestamp>_<name>/migration.sql    │
│ 4. Developer commits & pushes migrations/ folder to Git                          │
│ 5. Collaborators & Production run: prisma migrate deploy (safe, non-interactive) │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 🅰️ When YOU create or modify models in `schema.prisma`:
1. Edit `backend/prisma/schema.prisma`.
2. Generate the tracked SQL migration file:
   ```bash
   docker compose exec --user root brandflow-backend npx prisma migrate dev --name add_feature_name
   ```
3. Commit both the schema and the generated `migrations` folder to Git:
   ```bash
   git add backend/prisma/schema.prisma backend/prisma/migrations/
   git commit -m "db: add feature_name migration"
   git push origin main
   ```

### 🅱️ When OTHER COLLABORATORS pull schema changes from Git:
When you pull code with new migrations created by a teammate:
```bash
# 1. Pull latest code:
git pull origin main

# 2. Apply pending migrations to your local database (zero data loss):
docker compose exec --user root brandflow-backend npx prisma migrate deploy
```

### 🔍 Check Migration Sync Status:
To see if your local database is in sync with the migration history:
```bash
docker compose exec brandflow-backend npx prisma migrate status
```

---

## 📦 4. When Do You Need to Run Docker Commands?

Follow this simple decision rule for when you make specific types of changes:

### Scenario 1: You Installed a New NPM Package
*(e.g., `npm install lucide-react` in frontend or `npm install axios` in backend, or pulling updated `package.json`)*

```bash
# Rebuild containers to install new packages into the images:
docker compose up -d --build
```

---

### Scenario 2: You Modified Database Models (`schema.prisma`)
*(e.g., Added a field or model in `backend/prisma/schema.prisma`)*

```bash
# Create tracked migration (see Section 3 for full workflow):
docker compose exec --user root brandflow-backend npx prisma migrate dev --name <migration_name>
```

---

### Scenario 3: Inspect Database Tables Visually (Prisma Studio)
Launch Prisma Studio web GUI to browse, query, and edit PostgreSQL rows:

```bash
docker compose exec brandflow-backend npx prisma studio --port 5555
```
Open **[http://localhost:5555](http://localhost:5555)** in your browser!

---

### Scenario 4: You Modified Environment Variables (`.env`)
*(e.g., Added a new API key or secret in root `.env`)*

```bash
# Restart containers to load new environment variables:
docker compose up -d
```

---

### Scenario 5: Complete Database Reset / Fresh Start
*(Wipe all local data and re-seed from scratch)*

```bash
# 1. Stop containers and delete postgres_data volume:
docker compose down -v

# 2. Re-launch stack:
docker compose up -d --build

# 3. Apply all migrations & run master seed:
docker compose exec --user root brandflow-backend npx prisma migrate deploy
docker compose exec --user root brandflow-backend npm run db:seed
```

---

## 📋 5. Collaborator Summary Matrix

| Change Type | File Location | Requires Docker Rebuild? | Command to Run |
|---|---|---|---|
| **Frontend UI Code** | `frontend/src/**/*.jsx` | ❌ No (Auto Hot-Reload) | None (Save file) |
| **Frontend Styling** | `frontend/src/**/*.css` | ❌ No (Auto Hot-Reload) | None (Save file) |
| **Backend API Route/Logic** | `backend/src/**/*.js` | ❌ No (Auto Server Restart) | None (Save file) |
| **Added NPM Package** | `package.json` | ✅ Yes | `docker compose up -d --build` |
| **New Prisma Migration (You)** | `backend/prisma/schema.prisma` | ⚠️ Generate Migration | `docker compose exec --user root brandflow-backend npx prisma migrate dev --name <name>` |
| **Pulled Migration (Teammate)** | `backend/prisma/migrations/` | ⚠️ Apply Migrations | `docker compose exec --user root brandflow-backend npx prisma migrate deploy` |
| **Environment Keys** | `.env` | ⚠️ Container Restart | `docker compose up -d` |

---

## 🛠️ 5. Useful Helper Commands for Collaborators

```bash
# View live backend logs:
docker compose logs -f brandflow-backend

# View live frontend logs:
docker compose logs -f brandflow-frontend

# View status of all 4 running containers:
docker compose ps

# Open interactive shell inside backend container:
docker compose exec brandflow-backend sh

# Stop all containers:
docker compose down
```

---

## ❓ 6. Common Errors & Troubleshooting

### 1. Error: `listen tcp 0.0.0.0:5432: bind: address already in use`

#### Cause:
A local PostgreSQL database service is already running natively on your laptop outside of Docker, occupying host port `5432`.

#### Solution A (Recommended): Stop Local PostgreSQL Service
```bash
# macOS (Homebrew):
brew services stop postgresql

# Stop any process on port 5432:
sudo kill -9 $(sudo lsof -t -i:5432)
```
Then start Docker:
```bash
docker compose up -d --build
```

#### Solution B: Override Port in `.env`
If you want to keep your native local PostgreSQL running, change `POSTGRES_PORT` in your `.env`:
```env
POSTGRES_PORT=5433
```
Then restart Docker:
```bash
docker compose up -d --build
```

---

### 2. Error: `EACCES: permission denied, unlink '/app/node_modules/.prisma/client/index.js'`

#### Cause:
Prisma Client generation requires write access to the `.prisma/client` folder inside the Alpine container.

#### Solution:
Always append `--user root` to the execution command:
```bash
docker compose exec --user root brandflow-backend npx prisma db push
```

---

## 🚀 7. Publishing Changes to Production Server

When your code is tested and ready to release to the AWS EC2 production environment:

- **Frontend Only Changes**:
  Run this single command on your Mac:
  ```bash
  cd frontend && npm run deploy:prod
  ```
  *(Builds with HTTPS and uploads to production in under 4 seconds!)*

- **Backend / Schema Changes**:
  Push to Git, pull on EC2, and rebuild the backend container:
  ```bash
  git push origin main
  ```
  *(See [PRODUCTION_DOCKER_GUIDE.md](PRODUCTION_DOCKER_GUIDE.md) for full step-by-step production instructions).*

