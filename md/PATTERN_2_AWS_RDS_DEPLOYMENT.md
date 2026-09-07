# 🟡 Pattern 2: AWS EC2 + AWS Managed RDS PostgreSQL Deployment Guide 🚀

This is the complete, step-by-step production deployment guide for **Pattern 2 (Hybrid Cloud)**. In this pattern, the application runs on **AWS EC2**, while the **PostgreSQL Database** is offloaded to **AWS Managed RDS** for automated daily backups, high availability, and zero data-loss risk.

---

## 🏗️ 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / CLIENT BROWSER                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         Port 80 (HTTP) / 443 (HTTPS)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AWS EC2 UBUNTU VIRTUAL MACHINE                        │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. FRONTEND SERVICE: Nginx Production Web Server (Port 80)          │   │
│   │    - Serves compiled React + Vite static bundle (/app/dist)         │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                               API Requests (Port 5000)                      │
│                                      │                                      │
│   ┌──────────────────────────────────▼──────────────────────────────────┐   │
│   │ 2. BACKEND SERVICE: Node.js / Express REST API (Port 5000)          │   │
│   │    - Handles Authentication, Prisma ORM, BullMQ Queues              │   │
│   └─────────────────┬─────────────────────────────────┬─────────────────┘   │
│                     │                                 │                     │
│         Port 5432 (SSL Connection)               Port 6379 (Internal)     │
│                     │                                 │                     │
│                     │                       ┌─────────▼─────────────────┐   │
│                     │                       │ 3. REDIS QUEUE ENGINE     │   │
│                     │                       │    - Redis 7 Alpine       │   │
│                     │                       │    - Volume: redis_data   │   │
│                     │                       └───────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               AWS MANAGED RDS POSTGRESQL DATABASE SERVICE                   │
│                                                                             │
│   - Database Engine: PostgreSQL 16                                          │
│   - DB Instance: db.t3.micro / db.t4g.micro (20 GB Storage)                │
│   - Automated Daily Backups & Point-In-Time Recovery                        │
│   - Security: Restricted strictly to EC2 Security Group                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 2. Step-by-Step Execution Guide

---

### Step 2.1: Launch a NEW Separate EC2 Instance & Allocate Elastic IP

1. Go to **AWS Management Console** ➔ **EC2** ➔ Click **Launch Instance**.
2. **Name**: `brandflow-pattern2-ec2`
3. **AMI**: **Ubuntu 24.04 LTS**
4. **Instance Type**: `t2.micro` or `t3.micro` (Free Tier)
5. **Key Pair**: Use your existing `brandflow-key` (or create a new `.pem` key pair).
6. **Network Settings (Security Group)**:
   - Create Security Group: `brandflow-pattern2-ec2-sg`
   - Inbound Rules:
     - `SSH` (Port 22) -> `0.0.0.0/0`
     - `HTTP` (Port 80) -> `0.0.0.0/0`
     - `HTTPS` (Port 443) -> `0.0.0.0/0`
     - `Custom TCP` (Port 5000) -> `0.0.0.0/0`
7. Click **Launch Instance**.
8. **Allocate a New Elastic IP**:
   - Go to **EC2** ➔ **Elastic IPs** ➔ Click **Allocate Elastic IP**.
   - Associate this new Elastic IP with `brandflow-pattern2-ec2`.

---

### Step 2.2: Create AWS RDS PostgreSQL Database

1. Log into **AWS Management Console** ➔ Navigate to **RDS** ➔ Click **Create database**.
2. **Choose a database creation method**: Select **Standard create**.
3. **Engine options**: Select **PostgreSQL** (Version: PostgreSQL 16.x).
4. **Templates**: Select **Free Tier** (or **Production** / **Dev/Test**).
5. **Settings**:
   - **DB instance identifier**: `brandflow-prod-db`
   - **Master username**: `brandflow_admin`
   - **Master password**: Set a strong password (e.g. `SecurePassword2026!`)
6. **Instance configuration**: Select **`db.t3.micro`** or **`db.t4g.micro`**.
7. **Storage**: **gp3**, 20 GB Storage, Enable storage autoscaling.
8. **Connectivity**:
   - **VPC**: Default VPC
   - **Public Access**: Select **No** (Recommended for security) or **Yes** (if accessing directly from DBeaver).
   - **VPC security group**: Select **Create new** ➔ Name: `brandflow-rds-sg`.
9. **Additional configuration**:
   - **Initial database name**: `brandflow_db`
   - Enable **Automated backups** (7 days retention).
10. Click **Create database**. *(Database creation takes ~3 to 5 minutes).*

---

### Step 2.3: Configure RDS Security Group Linking (Critical Step)

To allow your new Pattern 2 EC2 instance to connect to RDS:

1. Go to **AWS Console** ➔ **RDS** ➔ Select `brandflow-prod-db` ➔ **Connectivity & security**.
2. Click on the **Security Group** link (`brandflow-rds-sg`).
3. Click **Edit inbound rules** ➔ Click **Add rule**:
   - **Type**: `PostgreSQL` (Port 5432)
   - **Source**: Select **Custom** ➔ Search & Select your **Pattern 2 EC2 Security Group ID** (`brandflow-pattern2-ec2-sg`).
4. Click **Save rules**.

> 🔒 **Security Guarantee**: Only your new Pattern 2 EC2 server can talk to the database. External internet traffic cannot reach your database directly.

---

### Step 2.3: Get RDS Endpoint & Update EC2 `.env`

1. Go to **RDS Console** ➔ Click `brandflow-prod-db` ➔ Copy the **Endpoint** address:
   - Example Endpoint: `brandflow-prod-db.c9k9...us-east-1.rds.amazonaws.com`

2. SSH into your EC2 server:
   ```bash
   ssh -i "brandflow-key.pem" ubuntu@54.144.96.139
   cd ~/C2C
   ```

3. Open `.env` file:
   ```bash
   nano .env
   ```

4. Update **`DATABASE_URL`** to point to your new AWS RDS Endpoint:

```env
# AWS Managed RDS PostgreSQL Connection String
DATABASE_URL="postgresql://brandflow_admin:SecurePassword2026!@brandflow-prod-db.c9k9...us-east-1.rds.amazonaws.com:5432/brandflow_db?sslmode=require"
```

Save & Exit `nano`: Press **`Ctrl + O`** ➔ **`Enter`** ➔ **`Ctrl + X`**.

---

### Step 2.4: Launch Hybrid Docker Stack (Frontend + Backend + Redis)

In Pattern 2, PostgreSQL runs on AWS RDS, so we do NOT run the local PostgreSQL container on EC2!

Launch only the `backend`, `frontend`, and `redis` services:

```bash
# Start backend, frontend, and redis services on EC2:
docker compose -f docker-compose.prod.yml up -d --build backend frontend redis
```

---

### Step 2.5: Deploy Database Schema & SuperAdmin Seed to RDS

Sync Prisma schema to AWS RDS PostgreSQL and seed default SuperAdmin data:

```bash
# 1. Sync Prisma schema to AWS RDS Database:
docker compose -f docker-compose.prod.yml exec backend npx prisma db push

# 2. Seed SuperAdmin user & master categories into AWS RDS:
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

- **SuperAdmin Email**: `admin@brandflow.com`
- **SuperAdmin Password**: `Admin@123456`

---

## 🌐 3. Live Verification & Testing

* **Web App URL**: `http://54.144.96.139.nip.io`
* **Backend API Health**: `http://54.144.96.139.nip.io:5000/health`
* **SuperAdmin Login**: `admin@brandflow.com` / `Admin@123456`

---

## 🛠️ 4. Cheat Sheet & Management Commands

```bash
# View live backend logs on EC2:
docker compose -f docker-compose.prod.yml logs -f backend

# Restart Hybrid Stack:
docker compose -f docker-compose.prod.yml restart backend frontend redis

# Stop Hybrid Stack:
docker compose -f docker-compose.prod.yml stop backend frontend redis
```
