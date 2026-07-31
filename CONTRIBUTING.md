# 🚀 Welcome to BrandFlow (C2C) - Beginner Setup & Developer Guide

Welcome to the **BrandFlow** team! Follow this complete guide to setup your computer, manage database migrations, and follow our daily developer workflow.

---

## 📌 Prerequisites (What to Install First)

Before starting, make sure you have these installed on your computer:
1. 🟩 **Node.js (v20 or higher)**: [Download Node.js](https://nodejs.org/)
2. 🐙 **Git**: [Download Git](https://git-scm.com/)
3. 🐳 **Docker Desktop**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) _(Make sure Docker Desktop is open and running)_

---

## ⚡ 1. Quick Project Setup (Only 3 Commands!)

Open your Terminal (or VS Code Terminal) and run these 3 commands:

### Command 1: Clone the Project
```bash
git clone https://github.com/Dhruv-0101/C2C.git
cd C2C
```

### Command 2: Create Backend Environment File (`backend/.env`)
```bash
cd backend
cp .env.example .env
```
_(On Windows PowerShell, run: `copy .env.example .env`)_

### Command 3: Create Frontend Environment File (`frontend/.env`)
```bash
cd ../frontend
cp .env.example .env
```

---

## ☀️ 2. Daily Workflow - Starting Your Day

Before you begin working each day, follow these steps to keep your branch synchronized:

### 1. Get the latest main branch
- Switch to the `main` branch: `git checkout main`
- Pull latest changes: `git pull origin main`

### 2. Update your working branch with main
- Switch to your current working feature branch: `git checkout YourBranchName`
- Merge `main` into your working branch: `git merge main`
- Resolve any merge conflicts if they occur in VS Code.

### 3. Run Prisma migrations
- Navigate to backend and apply all latest database migrations:
  ```bash
  cd backend
  npx prisma migrate deploy
  ```
  *(This applies any new database migrations created by other developers directly to your local database).*

### 4. Start your work
- You're now ready to begin working with the latest code and database schema!
  ```bash
  # Start with Docker:
  docker-compose up
  ```

> ⚠️ **Important**: Do this at the start of every day to prevent your branch from falling behind and accumulating merge conflicts.

---

## 🌙 3. Daily Workflow - End of Your Day (GitHub PR Instructions)

Before creating a Pull Request (PR), follow these steps to ensure your branch is up-to-date:

### 1. Update the main branch
- Switch to the `main` branch: `git checkout main`
- Pull latest updates: `git pull origin main`

### 2. Update your working branch
- Switch back to your working feature branch: `git checkout YourBranchName`
- Merge `main` into your branch: `git merge main`
- Resolve any merge conflicts if they appear.

### 3. Push your changes
- After merging, push your updated branch to remote GitHub:
  ```bash
  git push origin YourBranchName
  ```
- This ensures your remote branch has all your local changes plus the latest main branch updates.

### 4. Create the Pull Request
- Open [https://github.com/Dhruv-0101/C2C](https://github.com/Dhruv-0101/C2C).
- Click **"Compare & pull request"**.
- Add a clear title and description (list what you implemented, fixed, or modified).
- Assign **`@Dhruv-0101`** (Repository Owner) to review.

> ⚠️ **Important**: Always ensure your branch is updated with the latest `main` branch before creating a PR to avoid merge conflicts later.

---

## 🗄️ 4. Working with Prisma Schema & Database Migrations

We use **Prisma Migrations** so every team member gets the exact same database schema changes automatically when pulling code from GitHub.

### Step 4.1: Adding a New Field or Table (`prisma migrate dev`)
Whenever you add a new field or table to `backend/prisma/schema.prisma`:

1. Open `backend/prisma/schema.prisma` in VS Code and make your schema edits.
2. Run Prisma migration command in `backend/` terminal:
   ```bash
   cd backend
   npx prisma migrate dev --name add_new_user_field
   ```
3. **What this command does**:
   - Creates a new SQL migration file inside `backend/prisma/migrations/`.
   - Applies the SQL migration to your local database.
   - Automatically regenerates the Prisma Client for VS Code autocomplete.

### Step 4.2: Commit the Migration File to Git
Always commit the generated `prisma/migrations/` folder so other team members get the migration:
```bash
git add .
git commit -m "feat: add user schema migration"
git push origin feature/yourname-taskname
```

### Step 4.3: How Other Developers Apply Your Migration (`prisma migrate deploy`)
When other developers pull your PR from `main`, they run `npx prisma migrate deploy` during their **Starting Your Day** workflow, and Prisma applies your SQL migration file automatically to their local database!

### Step 4.4: View Database in Browser (Prisma Studio GUI)
To view your local database like an Excel sheet:
```bash
cd backend
npm run prisma:studio
```
Open [http://localhost:5555](http://localhost:5555) in your browser.

---

## ❓ Frequently Asked Questions (FAQ)

- **Q: Docker command fails with "Docker daemon is not running"?**
  - **A**: Open the Docker Desktop application on your computer first and wait 10 seconds for it to start.

- **Q: Port 5000 or 5173 is already in use?**
  - **A**: Close any previous terminal running `npm run dev` or `docker-compose`.

Happy Coding! 🚀
