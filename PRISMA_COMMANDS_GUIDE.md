# 💎 Prisma ORM Commands & Workflow Guide for BrandFlow

This guide explains **when**, **why**, and **how** to run every Prisma ORM command in BrandFlow so developers can safely manage database schemas, migrations, seeding, and client generation without making mistakes.

---

## 🚀 1. Quick Reference Matrix

| Command | Environment | When to Run? | What Does it Do? |
|---|---|---|---|
| `npx prisma generate` | **Local / Docker Build** | After editing `schema.prisma` or pulling code with schema changes | Re-compiles `@prisma/client` JS/TS types in `node_modules` so code completion & queries work |
| `npx prisma db push` | **Local Dev / Docker Reset** | Rapid prototyping, fresh setup, or local DB reset | Directly updates database tables to match `schema.prisma` **without** generating `.sql` migration files |
| `npx prisma migrate dev` | **Local Dev / Team Collab** | When creating structured version-controlled DB migrations | Creates timestamped SQL migration files in `prisma/migrations/` and updates the database |
| `npx prisma migrate deploy` | **Staging / Production (AWS)** | During CI/CD or production server startup | Applies pending `.sql` migration files from `prisma/migrations/` to the production database |
| `npx prisma db seed` | **Local / Staging / Fresh DB** | After resetting DB or initializing fresh database | Runs `prisma/seed.js` to create SuperAdmin (`admin@brandflow.com`), default templates, categories & styles |
| `npx prisma studio` | **Local Dev** | Any time you need a visual database GUI | Opens a browser UI at `http://localhost:5555` to view, edit, and filter database tables |

---

## 🛠️ 2. Standard Developer Workflows

### Scenario A: Fresh Project Setup (First Time Docker Start)
When setting up BrandFlow on a new machine or after `docker compose down -v`:

```bash
# 1. Start Docker containers
docker compose up -d --build

# 2. Push database schema to PostgreSQL
docker exec -it brandflow-backend npx prisma db push

# 3. Seed initial SuperAdmin user & master default categories
docker exec -it brandflow-backend npx prisma db seed
```

---

### Scenario B: Adding a New Field or Model to `schema.prisma`
When you add a new model (e.g., `BrandKit`) or modify a field in `backend/prisma/schema.prisma`:

```bash
# Step 1: Regenerate TypeScript/JavaScript Prisma Client types
docker exec -it brandflow-backend npx prisma generate

# Step 2: Sync schema changes to database
# For rapid local testing:
docker exec -it brandflow-backend npx prisma db push

# OR for team version control (creates SQL migration file):
docker exec -it brandflow-backend npx prisma migrate dev --name add_brandkit_model
```

---

### Scenario C: Complete Database Reset (Clean Slate)
When database state gets corrupted or after major structural changes:

```bash
# 1. Wipe containers & database volumes
docker compose down -v

# 2. Re-start containers
docker compose up -d --build

# 3. Push schema & re-seed
docker exec -it brandflow-backend npx prisma db push
docker exec -it brandflow-backend npx prisma db seed
```

---

### Scenario D: Deploying Schema Changes to Production (AWS / EC2 / Neon)
**NEVER** use `prisma db push` or `prisma migrate dev` directly in production! Use `migrate deploy`:

```bash
# On production server (AWS EC2 / Render / Neon):
npx prisma migrate deploy
```

---

## ⚡ 3. Docker Exec vs Local Terminal Syntax

You can run Prisma commands either **inside Docker container** or **locally inside the `backend/` folder**:

| Action | Running Inside Docker (Recommended) | Running Locally (Inside `backend/` directory) |
|---|---|---|
| **Generate Client** | `docker exec -it brandflow-backend npx prisma generate` | `cd backend && npx prisma generate` |
| **Sync Schema** | `docker exec -it brandflow-backend npx prisma db push` | `cd backend && npx prisma db push` |
| **Migrate Dev** | `docker exec -it brandflow-backend npx prisma migrate dev` | `cd backend && npx prisma migrate dev` |
| **Seed Database** | `docker exec -it brandflow-backend npx prisma db seed` | `cd backend && npx prisma db seed` |
| **Open Studio GUI** | `docker exec -it brandflow-backend npx prisma studio` | `cd backend && npx prisma studio` |

---

## ⚠️ 4. Common Mistakes & Pro Tips

> [!IMPORTANT]
> **Always run `prisma generate` after editing `schema.prisma`**  
> If you edit `schema.prisma` but forget to run `prisma generate`, your code (`prisma.user.findMany()`) will throw runtime errors because the JS client inside `node_modules` doesn't know about the new fields yet.

> [!TIP]
> **When to use `db push` vs `migrate dev`**  
> - Use **`db push`** when developing locally, testing ideas, or doing a fresh database setup. It is fast and doesn't clutter your repository with `.sql` files.  
> - Use **`migrate dev`** when you want to share schema history with team members via Git.

> [!WARNING]
> **Production Safety**  
> `prisma migrate dev` can prompt to drop the database if non-compatible changes are made. Always use `prisma migrate deploy` in production environments!
