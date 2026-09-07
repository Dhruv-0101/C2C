# 🚀 BrandFlow Central Deployment Tracker

Central dashboard to track IPs, Web URLs, Database Endpoints, and Credentials for all 3 AWS Deployment Patterns.

---

## 🟢 Pattern 1: AWS EC2 All-In-One ($0 Free Tier)

* **Status**: 🟢 **LIVE & RUNNING**
* **Elastic IP**: `54.144.96.139`
* **Web App URL (Nginx)**: `http://54.144.96.139.nip.io`
* **Backend REST API URL**: `http://54.144.96.139.nip.io:5000/api/v1`
* **API Health Endpoint**: `http://54.144.96.139.nip.io:5000/health`
* **PostgreSQL Database (DBeaver / External)**:
  * **Host**: `54.144.96.139`
  * **Port**: `5432`
  * **Database Name**: `brandflow_db`
  * **User**: `postgres`
  * **Password**: `postgrespassword2026`
* **SuperAdmin Credentials**:
  * **Email**: `admin@brandflow.com`
  * **Password**: `Admin@123456`
* **SSH Server Access**:
  ```bash
  ssh -i "brandflow-key.pem" ubuntu@54.144.96.139
  ```

---

## 🟡 Pattern 2: AWS EC2 + AWS RDS PostgreSQL (Hybrid Cloud)

* **Status**: 🟡 **IN PROGRESS (Guide Created)**
* **EC2 Server IP**: `54.144.96.139`
* **AWS Managed RDS Host**: `[Add RDS Endpoint after creating RDS]`
* **Port**: `5432`
* **Database Name**: `brandflow_db`
* **Master User**: `brandflow_admin`
* **Master Password**: `[Add RDS Password]`
* **Deployment Guide**: `PATTERN_2_AWS_RDS_DEPLOYMENT.md`

---

## 🔴 Pattern 3: AWS ECR + AWS ECS Fargate (Enterprise Serverless)

* **Status**: 🔴 **READY TO DEPLOY (Guide Created)**
* **AWS ECR Backend URI**: `[Add ECR Backend URI]`
* **AWS ECR Frontend URI**: `[Add ECR Frontend URI]`
* **AWS Load Balancer (ALB) URL**: `[Add ALB URL]`
* **ECS Cluster Name**: `brandflow-ecs-cluster`
* **Deployment Guide**: `PATTERN_3_AWS_ECS_FARGATE_DEPLOYMENT.md`

---

## 🛠️ Quick Server Commands & Redeployment Cheat Sheet

```bash
# SSH into EC2 Server:
ssh -i "brandflow-key.pem" ubuntu@54.144.96.139

# Redeploy latest code changes on EC2 (3 Commands):
cd ~/C2C
git pull
docker compose -f docker-compose.prod.yml up -d --build

# View real-time server logs:
docker compose -f docker-compose.prod.yml logs -f backend

# Re-run Database Schema Push & Seed:
docker compose -f docker-compose.prod.yml exec backend npx prisma db push
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```
