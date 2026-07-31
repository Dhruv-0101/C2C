# 🚀 BrandFlow - AI-Powered Social Media Management Platform

BrandFlow is an enterprise-grade social media management platform built for small businesses and agencies. It features AI brand kit generation, automated post scheduling, multi-platform publishing, analytics dashboard, and team role-based access control (RBAC).

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, Redux Toolkit, TanStack Query, Tailwind CSS, Shadcn UI, React Hook Form, Zod.
- **Backend**: Node.js, Express.js (ES Modules), Prisma ORM, PostgreSQL.
- **Caching & Queues**: Redis, BullMQ.
- **Infrastructure**: Docker, Docker Compose, GitHub Actions CI/CD.

---

## ⚡ Quickstart Guide

### Option 1: Run with Docker Compose (Recommended)

Spins up PostgreSQL, Redis, Backend, and Frontend in a single isolated environment.

1. **Clone the Repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd C2C
   ```

2. **Setup Environment Files**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start All Services**:
   ```bash
   docker-compose up --build -d
   ```
   - 🎨 **Frontend**: [http://localhost:5173](http://localhost:5173)
   - ⚙️ **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
   - 🗄️ **PostgreSQL**: `localhost:5432`
   - 🔴 **Redis**: `localhost:6379`

4. **Stop Services**:
   ```bash
   docker-compose down
   ```

---

### Option 2: Local Development Setup

If you prefer running services locally:

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Run Prisma Database Migrations
npx prisma migrate dev --name init

# Start Backend Dev Server
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env

# Start Frontend Dev Server
npm run dev
```

---

## 📂 Project Structure

```
├── .github/              # GitHub Actions CI/CD Workflows
│   └── workflows/
│       └── ci-cd.yml
├── backend/              # Node.js Express API & Prisma ORM
│   ├── prisma/           # Database Schema & Migrations
│   ├── src/
│   │   ├── common/       # Middleware, Validators, Error Handlers
│   │   ├── config/       # Env, Database, Redis, Logger
│   │   ├── modules/      # Independent Feature Modules (auth, users, posts, etc.)
│   │   └── routes/       # API Route Index
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React.js Vite Single Page Application
│   ├── src/
│   │   ├── components/   # Reusable UI Components
│   │   ├── features/     # Feature-Based Modules
│   │   ├── hooks/        # Custom React Hooks & TanStack Query Hooks
│   │   ├── routes/       # Application Routing
│   │   └── services/     # API Service Layer
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Full-Stack Orchestration
└── README.md
```

---

## 🤝 Team Collaboration & Guidelines

Please refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming conventions, Pull Request guidelines, and code review standards.

---

## 🛡️ License

Private repository owned by BrandFlow Team. All rights reserved.
