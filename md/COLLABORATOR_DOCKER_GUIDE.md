# 🤝 Collaborator Docker Workflow Guide for BrandFlow

This guide explains how collaborators on the team can seamlessly write code in **Frontend** and **Backend** while running the application inside Docker, including **when changes sync automatically** and **when Docker commands are required**.

---

## ⚡ 1. Daily Code Editing (Automatic Hot-Reloading)

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

## 📦 2. When Do You Need to Run Docker Commands?

Follow this simple decision rule for when you make specific types of changes:

### Scenario 1: You Installed a New NPM Package
*(e.g., `npm install lucide-react` or `npm install axios` or pulling code with updated `package.json`)*

```bash
# Rebuild container to install new packages into the container image
docker compose up -d --build
```

---

### Scenario 2: You Modified Database Models (`schema.prisma`)
*(e.g., Added a field or table in `backend/prisma/schema.prisma`)*

```bash
# 1. Regenerate Prisma JS Client types inside container
docker exec -it brandflow-backend npx prisma generate

# 2. Push database schema changes to PostgreSQL
docker exec -it brandflow-backend npx prisma db push
```

---

### Scenario 3: You Modified Environment Variables (`.env`)
*(e.g., Added a new API key or updated secret in root `.env`)*

```bash
# Restart containers to load new environment variables
docker compose up -d
```

---

### Scenario 4: Database Data Reset / Fresh Start
*(e.g., You want to wipe local database and start completely fresh)*

```bash
# 1. Wipe containers & database volumes
docker compose down -v

# 2. Start containers & push schema + seed
docker compose up -d --build
docker exec -it brandflow-backend npx prisma db push
docker exec -it brandflow-backend npx prisma db seed
```

---

## 📋 3. Collaborator Summary Matrix

| Change Type | File Location | Requires Docker Rebuild? | Command to Run |
|---|---|---|---|
| **Frontend UI Code** | `frontend/src/**/*.jsx` | ❌ No (Auto Hot-Reload) | None (Save file) |
| **Frontend Styling** | `frontend/src/**/*.css` | ❌ No (Auto Hot-Reload) | None (Save file) |
| **Backend API Route/Logic** | `backend/src/**/*.js` | ❌ No (Auto Server Restart) | None (Save file) |
| **Added NPM Package** | `package.json` | ✅ Yes | `docker compose up -d --build` |
| **Prisma DB Schema** | `backend/prisma/schema.prisma` | ⚠️ Schema Sync Only | `docker exec -it brandflow-backend npx prisma db push` |
| **Environment Keys** | `.env` | ⚠️ Container Restart | `docker compose up -d` |

---

## 🛠️ 4. Useful Helper Commands for Collaborators

```bash
# View live backend logs
docker compose logs -f brandflow-backend

# View live frontend logs
docker compose logs -f brandflow-frontend

# View status of all 4 running containers
docker compose ps

# Open bash terminal inside backend container
docker exec -it brandflow-backend sh

# Stop all containers
docker compose down
```
