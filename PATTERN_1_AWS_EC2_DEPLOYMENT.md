# 🟢 Pattern 1: AWS EC2 All-In-One Free Tier Deployment Guide ($0/Month) 🚀

This is the complete, step-by-step production deployment guide for running **BrandFlow** on an **AWS EC2 Virtual Machine** using **Docker Compose** (`docker-compose.prod.yml`).

---

## 🏗️ 1. High-Level Architecture Overview

All 4 application micro-components run inside a single, free-tier AWS EC2 instance (`t2.micro` or `t3.micro`):

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
│         Port 5432 (Internal)                Port 6379 (Internal)            │
│                     ▼                                 ▼                     │
│   ┌──────────────────────────────────┐   ┌──────────────────────────────┐   │
│   │ 3. POSTGRESQL DATABASE CONTAINER │   │ 4. REDIS QUEUE ENGINE        │   │
│   │    - PostgreSQL 16 Alpine        │   │    - Redis 7 Alpine          │   │
│   │    - Volume: postgres_data       │   │    - Volume: redis_data      │   │
│   └──────────────────────────────────┘   └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 2. Prerequisites Checklist

Before beginning, ensure you have:
1. An active **AWS Management Console** account.
2. A local terminal / SSH client (Terminal on macOS/Linux, Git Bash or PuTTY on Windows).
3. Access to your project's Git Repository URL (GitHub/GitLab).

---

## 🚀 3. Step-by-Step Deployment Instructions

### Step 3.1: Launch AWS EC2 Instance
1. Log into **AWS Console** ➔ Navigate to **EC2** ➔ Click **Launch Instance**.
2. **Name**: `brandflow-ec2-prod`
3. **Application and OS Image (AMI)**: Select **Ubuntu** (Choose **Ubuntu Server 24.04 LTS** or **22.04 LTS**).
4. **Instance Type**: Select **`t2.micro`** or **`t3.micro`** (Free Tier Eligible).
5. **Key Pair**: Click *Create new key pair*:
   - Key pair name: `brandflow-key`
   - Private key file format: `.pem`
   - Click **Create key pair** and save `brandflow-key.pem` to your laptop.
6. **Network Settings (Security Group)**:
   - Check ✅ **Allow SSH traffic from** (`Anywhere 0.0.0.0/0` or `My IP`)
   - Check ✅ **Allow HTTP traffic from the internet** (`0.0.0.0/0`)
   - Check ✅ **Allow HTTPS traffic from the internet** (`0.0.0.0/0`)
   - Click **Edit** ➔ Add Security Group Rule:
     - Type: `Custom TCP`
     - Port Range: `5000`
     - Source: `0.0.0.0/0` (Description: Express Backend API)
7. Click **Launch Instance**.

---

### Step 3.2: Connect to EC2 Server via SSH

Open Terminal on your laptop, navigate to the folder containing `brandflow-key.pem`, and execute:

```bash
# 1. Secure private key permissions (macOS/Linux mandatory)
chmod 400 brandflow-key.pem

# 2. SSH into your EC2 Ubuntu instance (Replace <EC2_PUBLIC_IP> with your actual EC2 IP)
ssh -i "brandflow-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

---

### Step 3.3: Install Docker Engine & Git on EC2

Once logged into your EC2 Ubuntu terminal, run the following commands:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker Engine, Docker Compose V2, and Git
sudo apt install -y docker.io docker-compose-v2 git

# 3. Add ubuntu user to Docker group (allows running docker without sudo)
sudo usermod -aG docker ubuntu

# 4. Activate new group membership immediately
newgrp docker

# 5. Verify Docker installation
docker --version
docker compose version
```

---

### Step 3.4: Clone Project & Set Up Production `.env`

```bash
# 1. Clone repository to EC2
git clone <YOUR_GIT_REPO_URL> C2C
cd C2C
```

---

#### 💡 How to Create `.env` on EC2 (Choose Method 1 or Method 2):

#### Method 1: Interactive `nano` Editor (Step-by-Step)

1. Open `.env` in `nano` editor:
   ```bash
   nano .env
   ```
2. **Paste Content**:
   - **Mac**: Press `Cmd + V` or Right-click in Terminal
   - **Windows**: Press `Ctrl + Shift + V` or Right-click in Git Bash / PuTTY
3. Copy-paste this complete `.env` block into `nano` *(Replace `<YOUR_EC2_PUBLIC_IP>` with your actual EC2 Public IP address)*:

```env
# APPLICATION SERVER CONFIGURATION
NODE_ENV=production
PORT=5000
VITE_PORT=5173
ENABLE_RATE_LIMITER="true"

# POSTGRESQL RELATIONAL DATABASE CONFIGURATION
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgrespassword2026
POSTGRES_DB=brandflow_db
POSTGRES_PORT=5432

# PRISMA ORM DATABASE CONNECTION URL (Docker internal DNS 'postgres')
DATABASE_URL="postgresql://postgres:postgrespassword2026@postgres:5432/brandflow_db?schema=public"

# REDIS IN-MEMORY STORE & BULLMQ QUEUE CONFIGURATION
REDIS_HOST=redis
REDIS_PORT=6379

# INITIAL SUPERADMIN BOOTSTRAP CREDENTIALS
INITIAL_ADMIN_EMAIL=admin@brandflow.com
INITIAL_ADMIN_PASSWORD=Admin@123456
INITIAL_ADMIN_NAME="Super Admin"

# JWT AUTHENTICATION SECRETS & KEYS
JWT_ACCESS_SECRET=super_secret_access_key_brandflow_2026
JWT_REFRESH_SECRET=super_secret_refresh_key_brandflow_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# FRONTEND & CORS CROSS-ORIGIN URLS (Replace <YOUR_EC2_PUBLIC_IP> with your EC2 IP)
CLIENT_URL=http://<YOUR_EC2_PUBLIC_IP>
VITE_API_BASE_URL=http://<YOUR_EC2_PUBLIC_IP>:5000/api/v1

# GOOGLE OAUTH 2.0 CREDENTIALS
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# NODEMAILER / GMAIL SMTP EMAIL CONFIGURATION
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_smtp_app_password"
FROM_EMAIL="your_email@gmail.com"

# CLOUDINARY MEDIA STORAGE CONFIGURATION
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# META / INSTAGRAM GRAPH API CONFIGURATION
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
META_REDIRECT_URI="http://<YOUR_EC2_PUBLIC_IP>:5000/api/v1/social/meta/callback"

# LINKEDIN OAUTH 2.0 CONFIGURATION
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
LINKEDIN_REDIRECT_URI="http://<YOUR_EC2_PUBLIC_IP>:5000/api/v1/social/linkedin/callback"

# SOCIAL PUBLISHER & ENCRYPTION
SOCIAL_TOKEN_ENCRYPTION_KEY="brandflow_social_encryption_secret_key_32b"
SOCIAL_PUBLISHER_MODE="LIVE"
```

4. **Save & Exit `nano`**:
   - Press **`Ctrl + O`** ➔ Press **`Enter`** (Saves the file)
   - Press **`Ctrl + X`** (Exits `nano` editor)

---

#### Method 2: Automatic One-Shot Command (No Editor Needed)

Alternatively, you can create `.env` in 1 second by running this single command directly in your EC2 terminal *(Replace `<YOUR_EC2_PUBLIC_IP>` with your EC2 Public IP address before pasting)*:

```bash
cat << 'EOF' > .env
NODE_ENV=production
PORT=5000
VITE_PORT=5173
ENABLE_RATE_LIMITER="true"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgrespassword2026
POSTGRES_DB=brandflow_db
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:postgrespassword2026@postgres:5432/brandflow_db?schema=public"
REDIS_HOST=redis
REDIS_PORT=6379
INITIAL_ADMIN_EMAIL=admin@brandflow.com
INITIAL_ADMIN_PASSWORD=Admin@123456
INITIAL_ADMIN_NAME="Super Admin"
JWT_ACCESS_SECRET=super_secret_access_key_brandflow_2026
JWT_REFRESH_SECRET=super_secret_refresh_key_brandflow_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://<YOUR_EC2_PUBLIC_IP>
VITE_API_BASE_URL=http://<YOUR_EC2_PUBLIC_IP>:5000/api/v1
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_smtp_app_password"
FROM_EMAIL="your_email@gmail.com"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
META_REDIRECT_URI="http://<YOUR_EC2_PUBLIC_IP>:5000/api/v1/social/meta/callback"
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
LINKEDIN_REDIRECT_URI="http://<YOUR_EC2_PUBLIC_IP>:5000/api/v1/social/linkedin/callback"
SOCIAL_TOKEN_ENCRYPTION_KEY="brandflow_social_encryption_secret_key_32b"
SOCIAL_PUBLISHER_MODE="LIVE"
EOF
```

---

#### 🔍 How to Verify `.env` File on EC2:

Run this command in terminal to view the contents of `.env` and verify it is written properly:

```bash
# Print contents of .env file:
cat .env

# Or check file existence and size:
ls -la .env
```

---

### Step 3.5: Build & Launch Production Docker Stack

Execute the following command to build the production images (Nginx static bundle + Node production image) and start all 4 services in background:

```bash
# Build and start production stack
docker compose -f docker-compose.prod.yml up -d --build
```

To verify all 4 containers are running and healthy:

```bash
docker compose -f docker-compose.prod.yml ps
```

---

### Step 3.6: Run Database Schema Sync & Initial Seed

Initialize your production PostgreSQL database and seed the default SuperAdmin user:

```bash
# 1. Sync Prisma schema directly with database:
docker compose -f docker-compose.prod.yml exec backend npx prisma db push

# 2. Seed initial SuperAdmin & Master Data:
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

---

## 🌐 4. Live Verification & Testing

Open your browser and test the live application:

* **Frontend Web App (Nginx)**: `http://<EC2_PUBLIC_IP>`
* **Backend API Health Check**: `http://<EC2_PUBLIC_IP>:5000/health`
* **Default SuperAdmin Credentials**:
  - **Email**: `admin@brandflow.com`
  - **Password**: `Admin@123456`

---

## 🛠️ 5. Cheat Sheet & Server Management Commands

```bash
# View real-time logs for backend container:
docker compose -f docker-compose.prod.yml logs -f backend

# View real-time logs for all containers:
docker compose -f docker-compose.prod.yml logs -f

# Restart production stack:
docker compose -f docker-compose.prod.yml restart

# Gracefully stop production stack:
docker compose -f docker-compose.prod.yml down

# Re-run database seed manually:
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

---

## 🔄 6. Future Code Updates & Redeployment Workflow

Future me jab bhi aap apne local laptop par Frontend, Backend, ya Database me koi naya feature ya bug fix karenge, to deploy karne ke 3 simple steps honge:

### Step 1: Local Laptop Par Code Push Karein
```bash
git add .
git commit -m "feat: added new feature"
git push origin main
```

### Step 2: EC2 Terminal Par Code Pull Karein
SSH ke zariye EC2 me login karke project folder (`C2C`) me run karein:
```bash
git pull origin main
```

### Step 3: Production Containers Rebuild & Restart Karein
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

*(Optional - Agar `schema.prisma` change kiya hai)*:
```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma db push
```

