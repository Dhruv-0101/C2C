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
chmod 400 "/Users/mac0011/Downloads/brandflow-c2c.pem"

# 2. SSH into your EC2 Ubuntu instance
ssh -i "/Users/mac0011/Downloads/brandflow-c2c.pem" ubuntu@13.234.177.70
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
3. Copy-paste this complete `.env` block into `nano` (pre-configured for your Elastic IP `13.234.177.70`):

```env
# APPLICATION SERVER CONFIGURATION
NODE_ENV=production
PORT=5000
VITE_PORT=5173
ENABLE_RATE_LIMITER="true"

# POSTGRESQL RELATIONAL DATABASE CONFIGURATION
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_postgres_password
POSTGRES_DB=brandflow_db
POSTGRES_PORT=5432

# PRISMA ORM DATABASE CONNECTION URL (Docker internal DNS 'brandflow-postgres' or 'postgres')
DATABASE_URL="postgresql://postgres:your_secure_postgres_password@brandflow-postgres:5432/brandflow_db?schema=public"

# REDIS IN-MEMORY STORE & BULLMQ QUEUE CONFIGURATION
REDIS_HOST=brandflow-redis
REDIS_PORT=6379

# INITIAL SUPERADMIN BOOTSTRAP CREDENTIALS
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
INITIAL_ADMIN_PASSWORD=YourSecureAdminPassword123!
INITIAL_ADMIN_NAME="Super Admin"

# JWT AUTHENTICATION SECRETS & KEYS
JWT_ACCESS_SECRET=your_jwt_access_secret_key_min_16_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_min_16_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# FRONTEND & CORS CROSS-ORIGIN URLS (13.234.177.70 / 13-234-177-70.sslip.io)
CLIENT_URL=https://13-234-177-70.sslip.io
VITE_API_BASE_URL=https://13-234-177-70.sslip.io/api/v1

# GOOGLE OAUTH 2.0 CREDENTIALS
GOOGLE_CLIENT_ID="your_google_client_id_here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# NODEMAILER / GMAIL SMTP EMAIL CONFIGURATION
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password_here"
FROM_EMAIL="your_email@gmail.com"

# CLOUDINARY MEDIA STORAGE CONFIGURATION
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name_here"
CLOUDINARY_API_KEY="your_cloudinary_api_key_here"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret_here"

# META / INSTAGRAM GRAPH API CONFIGURATION
META_APP_ID="your_meta_app_id_here"
META_APP_SECRET="your_meta_app_secret_here"
META_REDIRECT_URI="https://13-234-177-70.sslip.io/api/v1/social/meta/callback"

# LINKEDIN OAUTH 2.0 CONFIGURATION
LINKEDIN_CLIENT_ID="your_linkedin_client_id_here"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret_here"
LINKEDIN_REDIRECT_URI="https://13-234-177-70.sslip.io/api/v1/social/linkedin/callback"

# SOCIAL PUBLISHER & ENCRYPTION
SOCIAL_TOKEN_ENCRYPTION_KEY="your_32_character_encryption_key_here"
SOCIAL_PUBLISHER_MODE="LIVE"

# DUAL PAYMENT GATEWAYS (RAZORPAY & STRIPE DIRECT API)
RAZORPAY_KEY_ID="your_razorpay_key_id_here"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret_here"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key_here"
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
```

4. **Save & Exit `nano`**:
   - Press **`Ctrl + O`** ➔ Press **`Enter`** (Saves the file)
   - Press **`Ctrl + X`** (Exits `nano` editor)

---

#### Method 2: Automatic One-Shot Command (No Editor Needed)

Alternatively, you can create `.env` in 1 second by running this single command directly in your EC2 terminal:

```bash
cat << 'EOF' > .env
NODE_ENV=production
PORT=5000
VITE_PORT=5173
ENABLE_RATE_LIMITER="true"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_postgres_password
POSTGRES_DB=brandflow_db
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:your_secure_postgres_password@brandflow-postgres:5432/brandflow_db?schema=public"
REDIS_HOST=brandflow-redis
REDIS_PORT=6379
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
INITIAL_ADMIN_PASSWORD=YourSecureAdminPassword123!
INITIAL_ADMIN_NAME="Super Admin"
JWT_ACCESS_SECRET=your_jwt_access_secret_key_min_16_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_min_16_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://13-234-177-70.sslip.io
VITE_API_BASE_URL=https://13-234-177-70.sslip.io/api/v1
GOOGLE_CLIENT_ID="your_google_client_id_here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password_here"
FROM_EMAIL="your_email@gmail.com"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name_here"
CLOUDINARY_API_KEY="your_cloudinary_api_key_here"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret_here"
META_APP_ID="your_meta_app_id_here"
META_APP_SECRET="your_meta_app_secret_here"
META_REDIRECT_URI="https://13-234-177-70.sslip.io/api/v1/social/meta/callback"
LINKEDIN_CLIENT_ID="your_linkedin_client_id_here"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret_here"
LINKEDIN_REDIRECT_URI="https://13-234-177-70.sslip.io/api/v1/social/linkedin/callback"
SOCIAL_TOKEN_ENCRYPTION_KEY="your_32_character_encryption_key_here"
SOCIAL_PUBLISHER_MODE="LIVE"
RAZORPAY_KEY_ID="your_razorpay_key_id_here"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret_here"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key_here"
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
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

### 📌 Exact Variables to Update in `.env` After Getting Your Elastic IP / Domain

Whenever you allocate an **Elastic IP** (e.g. `13.234.177.70`) or assign a custom domain / HTTPS address, update these **4 specific environment variables** in your EC2 `.env` file:

| Environment Variable | HTTP (Elastic IP Example) | HTTPS (Domain / sslip.io Example) | What It Does |
| :--- | :--- | :--- | :--- |
| `CLIENT_URL` | `http://13.234.177.70` | `https://13-234-177-70.sslip.io` | Configures CORS & secure session cookie origin for frontend |
| `VITE_API_BASE_URL` | `http://13.234.177.70:5000/api/v1` | `https://13-234-177-70.sslip.io/api/v1` | Frontend REST API communication endpoint |
| `META_REDIRECT_URI` | `http://13.234.177.70:5000/api/v1/social/meta/callback` | `https://13-234-177-70.sslip.io/api/v1/social/meta/callback` | Facebook / Instagram OAuth redirect endpoint |
| `LINKEDIN_REDIRECT_URI` | `http://13.234.177.70:5000/api/v1/social/linkedin/callback` | `https://13-234-177-70.sslip.io/api/v1/social/linkedin/callback` | LinkedIn OAuth 2.0 redirect endpoint |

#### How to update them on EC2:
1. Open `.env` on your EC2 server:
   ```bash
   nano .env
   ```
2. Find and replace the IP with your new Elastic IP in those 4 lines.
3. Save and exit (`Ctrl + O` ➔ `Enter` ➔ `Ctrl + X`).
4. Restart the backend container to apply the changes immediately:
   ```bash
   docker compose -f docker-compose.prod.yml restart brandflow-backend
   ```

---

### Step 3.4.1: Build Frontend Static Bundle Locally & Upload to EC2 (Ultra-Fast 3-Second Build ⚡)

> [!TIP]
> **Why build locally on your Mac?**
> A `t2.micro` EC2 instance has only 1GB RAM and 1 CPU core, causing Vite builds on the server to freeze or take 20+ minutes. Your Mac builds the complete production bundle in **3 to 5 seconds**!

Open a terminal window **on your Mac** inside your local `C2C` project folder:

```bash
# 1. Navigate to frontend directory:
cd frontend

# 2. Install frontend packages (creates node_modules & vite CLI if not already installed):
npm install

# 3. Compile production bundle with your Elastic IP / HTTPS domain:
VITE_API_BASE_URL="https://13-234-177-70.sslip.io/api/v1" npm run build

# 4. Upload compiled 'dist' directory to EC2 server:

# 👉 Option A: If you are currently INSIDE the 'frontend' folder:
scp -i "/Users/mac0011/Downloads/brandflow-c2c.pem" -r dist ubuntu@13.234.177.70:~/C2C/frontend/

# 👉 Option B: If you return to the root 'C2C' project folder:
cd ..
scp -i "/Users/mac0011/Downloads/brandflow-c2c.pem" -r frontend/dist ubuntu@13.234.177.70:~/C2C/frontend/
```

> [!WARNING]
> #### ⚠️ Troubleshooting: `WARNING: UNPROTECTED PRIVATE KEY FILE! Permissions 0644 ... are too open`
> If SSH or SCP aborts with:
> ```text
> @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
> @         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
> @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
> Permissions 0644 for 'brandflow-c2c.pem' are too open.
> Load key: bad permissions
> ubuntu@13.234.177.70: Permission denied (publickey).
> ```
> **Cause**: SSH and SCP strictly require `.pem` private keys to have restricted `400` permissions (read-only by the owner, not accessible by others).
> 
> **Fix**: Run this command on your Mac terminal to secure the key:
> ```bash
> chmod 400 "/Users/mac0011/Downloads/brandflow-c2c.pem"
> ```
> Then re-run your `scp` upload command.

---

### Step 3.5: Launch Production Docker Stack on EC2

Now, back in your **EC2 terminal**, launch all 4 production containers. Nginx will directly mount and serve your pre-built `dist` assets in under **2 seconds**:

```bash
# Start production stack (Instantly pulls Nginx and starts all 4 services)
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
# 1. Apply all tracked migrations to production PostgreSQL (--user root avoids permission errors):
docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npx prisma migrate deploy

# (Or if initializing without migration history):
# docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npx prisma db push

# 2. Seed initial SuperAdmin & Master Data:
docker compose -f docker-compose.prod.yml exec --user root brandflow-backend npm run db:seed
```

---

### Step 3.7: Set Up Free HTTPS (SSL Certificate) using `sslip.io` & Certbot

To enable **HTTPS (`https://`)** for your Elastic IP (`13.234.177.70`) for **FREE** without buying a domain name:

> **Your Free SSL Domain**: `https://13-234-177-70.sslip.io`  
> *(sslip.io automatically resolves `13-234-177-70.sslip.io` to your Elastic IP `13.234.177.70`, allowing Let's Encrypt to issue a real, valid SSL certificate!)*

---

#### 1. Open Port 443 in AWS EC2 Security Group
- Navigate to **AWS EC2 Console** ➔ **Security Groups** ➔ Select your Security Group.
- Click **Edit Inbound Rules** ➔ Add Rule:
  - **Type**: `HTTPS` (Port `443`)
  - **Source**: `0.0.0.0/0` (Anywhere)
- Click **Save rules**.

---

#### 2. Install Host Nginx & Certbot on EC2
Run these exact commands in your **EC2 SSH terminal**:

```bash
# 1. Install Nginx and Certbot with python plugin:
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Stop any existing process occupying port 80:
sudo systemctl stop nginx

# 3. Ensure Docker frontend is running on internal port 8080 (already pre-configured in docker-compose.prod.yml):
docker compose -f docker-compose.prod.yml up -d

# 4. Create Host Nginx reverse proxy configuration for 13-234-177-70.sslip.io:
sudo bash -c 'cat << "EOF" > /etc/nginx/sites-available/brandflow
server {
    listen 80;
    server_name 13-234-177-70.sslip.io;

    client_max_body_size 50M;

    # Forward web requests to Docker Frontend container on port 8080
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Forward API requests to Docker Backend container on port 5000
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF'

# 5. Enable the site and test configuration:
sudo ln -sf /etc/nginx/sites-available/brandflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 6. Obtain Free Let's Encrypt SSL Certificate:
sudo certbot --nginx -d 13-234-177-70.sslip.io
```
*(When prompted by Certbot, enter your email and agree to terms. Certbot will automatically configure HTTPS on port 443!)*

---

#### 3. Update `.env` on EC2 to use your new HTTPS URL
Now that HTTPS is active, update your EC2 `.env` file:
```bash
nano .env
```
Update these lines:
```env
CLIENT_URL=https://13-234-177-70.sslip.io
VITE_API_BASE_URL=https://13-234-177-70.sslip.io/api/v1
META_REDIRECT_URI=https://13-234-177-70.sslip.io/api/v1/social/meta/callback
LINKEDIN_REDIRECT_URI=https://13-234-177-70.sslip.io/api/v1/social/linkedin/callback
```
Save and exit (`Ctrl + O` ➔ `Enter` ➔ `Ctrl + X`).

Restart backend container to apply the HTTPS settings:
```bash
docker compose -f docker-compose.prod.yml restart brandflow-backend
```

---

#### 4. Rebuild Frontend Bundle with HTTPS on Your Mac
On your **Mac terminal**:
```bash
cd frontend
VITE_API_BASE_URL="https://13-234-177-70.sslip.io/api/v1" npm run build
scp -i "/Users/mac0011/Downloads/brandflow-c2c.pem" -r dist ubuntu@13.234.177.70:~/C2C/frontend/
cd ..
```

---

## 🌐 4. Multi-Environment Live Verification & URL Matrix

The application codebase is fully configured for dynamic multi-environment resolution:

| Deployment Environment | Frontend Web App URL | Backend API Base URL | Reverse Proxy / Host |
| :--- | :--- | :--- | :--- |
| 🟢 **1. Local Development** | `http://localhost:5173` | `http://localhost:5000/api/v1` | Direct Vite Dev Server |
| 🚀 **2. AWS EC2 Production (HTTPS)** | `https://13-234-177-70.sslip.io` | `https://13-234-177-70.sslip.io/api/v1` | Host Nginx Reverse Proxy (Port 80/443 -> Docker 8080/5000) |
| ⚡ **3. Vercel + Render Production** | `https://c2-c-puce.vercel.app` | `https://c2c-negk.onrender.com/api/v1` | Vercel Edge CDN + Render Cloud |

### 🔐 Default SuperAdmin Login Credentials:
- **Email**: `admin@brandflow.com` (or `admin1@gmail.com`)
- **Password**: `Admin@123456` (or `admin1`)

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

