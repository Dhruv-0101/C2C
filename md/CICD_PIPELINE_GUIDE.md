# 🚀 Enterprise CI/CD Pipeline & AWS Deployment Guide

This guide explains BrandFlow's automated **Continuous Integration (CI)** and **Continuous Deployment (CD)** pipeline using **GitHub Actions** and **AWS EC2**.

---

## 🏗️ 1. Pipeline Overview

```
                                GITHUB REPOSITORY
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
           [Pull Request / Push]                     [Push to main]
                    │                                     │
                    ▼                                     ▼
      ┌──────────────────────────┐          ┌──────────────────────────┐
      │  ci-cd.yml (CI Workflow) │          │ deploy-aws.yml (CD)      │
      ├──────────────────────────┤          ├──────────────────────────┤
      │ • Backend & Prisma Check │          │ • SSH to AWS EC2         │
      │ • Frontend React Build   │          │ • Git Reset to Main      │
      │ • Docker Buildx Verify   │          │ • Docker Compose Build   │
      └──────────────────────────┘          │ • Prisma DB Push & Prune │
                                            └──────────────────────────┘
```

---

## 🛠️ 2. Workflow Files Created

### 1. `.github/workflows/ci-cd.yml` (Continuous Integration)
- **Triggers**: On every `push` or `pull_request` to `main`, `master`, or `develop`.
- **Jobs**:
  1. **`backend-ci`**: Validates Prisma schema (`npx prisma validate`) and compiles `@prisma/client`.
  2. **`frontend-ci`**: Compiles Vite production React bundle (`npm run build`).
  3. **`docker-ci`**: Tests building backend & frontend Docker images via Buildx with GitHub Actions layer caching.

### 2. `.github/workflows/deploy-aws.yml` (Continuous Deployment)
- **Triggers**: Automated on `push` to `main` or manual trigger via **GitHub Actions UI (Workflow Dispatch)**.
- **Action**: SSH into AWS EC2 Elastic IP (`54.144.96.139`), pulls the latest `main` commit, executes `docker compose -f docker-compose.prod.yml up -d --build`, and applies database schema updates.

---

## 🔐 3. Configuring GitHub Repository Secrets

To enable automated CD deployment to your AWS EC2 server, configure these 3 secrets in your GitHub repository:

1. Open your GitHub Repository $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Click **New repository secret** and add:

| Secret Name | Description | Example Value |
|---|---|---|
| `EC2_HOST` | AWS EC2 Elastic IP address | `54.144.96.139` |
| `EC2_USER` | SSH Username for EC2 Ubuntu AMI | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH Key contents (`id_rsa` or `.pem` file) | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |

---

## 🧪 4. How to Test & Verify

### Verifying CI (Local / GitHub):
1. Create a branch and push a commit:
   ```bash
   git checkout -b feature/test-ci
   git add .
   git commit -m "feat: add new component"
   git push origin feature/test-ci
   ```
2. Open GitHub $\rightarrow$ **Actions** tab.
3. You will see **`BrandFlow Continuous Integration (CI)`** running parallel jobs for Backend, Frontend, and Docker.

### Verifying CD (Automated Deployment):
1. Merge your Pull Request into `main`.
2. GitHub Actions will automatically trigger **`BrandFlow Automated CD Deployment (AWS EC2)`**.
3. Upon completion, your live server at `http://54.144.96.139.nip.io` will instantly serve the updated build!

---

## ⚙️ 5. Manual Deployment Trigger (Fallback)

If you ever want to trigger deployment manually from GitHub UI without pushing a commit:

1. Go to GitHub Repository $\rightarrow$ **Actions** tab.
2. Select **`BrandFlow Automated CD Deployment (AWS EC2)`** from the left sidebar.
3. Click **Run workflow** $\rightarrow$ Select branch `main` $\rightarrow$ Click **Run workflow**.
