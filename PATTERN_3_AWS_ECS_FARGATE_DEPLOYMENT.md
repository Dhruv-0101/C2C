# 🔴 Pattern 3: AWS ECR + AWS ECS Fargate + AWS RDS Enterprise Serverless Guide 🚀

This is the complete, step-by-step production deployment guide for **Pattern 3 (Enterprise Serverless Stack)**. In this pattern, there are **no EC2 servers to manage**. Docker container images are pushed to **AWS ECR (Container Registry)**, executed on **AWS ECS Fargate (Serverless Container Engine)** with automated scaling (2 to 50+ tasks), and routed via an **AWS Application Load Balancer (ALB)**.

---

## 🏗️ 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / CLIENT BROWSER                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        HTTP (Port 80) / HTTPS (Port 443)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 AWS APPLICATION LOAD BALANCER (ALB)                         │
│   - Health Checks & Traffic Distribution across active Fargate tasks        │
└───────────────────┬──────────────────────────────────────┬──────────────────┘
                    │                                      │
                    ▼                                      ▼
┌──────────────────────────────────────┐┌──────────────────────────────────────┐
│  AWS ECS FARGATE TASK (CONTAINER 1)  ││  AWS ECS FARGATE TASK (CONTAINER 2)  │
│  - Frontend (Nginx Static Bundle)    ││  - Frontend (Nginx Static Bundle)    │
│  - Backend (Express REST API)        ││  - Backend (Express REST API)        │
└───────────────────┬──────────────────┘└───────────────────┬──────────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                         (Auto-Scaling 2 to 50+ Tasks)
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               AWS MANAGED RDS POSTGRESQL + AWS ELASTICACHE REDIS            │
│   - Database: AWS RDS PostgreSQL 16 (Multi-AZ High Availability)            │
│   - Queue/Cache: AWS ElastiCache for Redis                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 2. Step-by-Step Execution Guide

---

### Step 2.1: Create AWS ECR Repositories

AWS Elastic Container Registry (ECR) stores your compiled production Docker container images:

```bash
# 1. Create ECR repository for Backend
aws ecr create-repository --repository-name brandflow-backend --region us-east-1

# 2. Create ECR repository for Frontend
aws ecr create-repository --repository-name brandflow-frontend --region us-east-1
```

---

### Step 2.2: Build Production Docker Images & Push to ECR

Run these commands on your local machine (or in GitHub Actions CI/CD pipeline):

```bash
# 1. Authenticate Docker CLI to your AWS ECR Registry (Replace <AWS_ACCOUNT_ID>):
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# 2. Build & Push Production Backend Container:
docker build -t brandflow-backend ./backend --target production
docker tag brandflow-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/brandflow-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/brandflow-backend:latest

# 3. Build & Push Production Frontend Container:
docker build -t brandflow-frontend ./frontend --target production --build-arg VITE_API_BASE_URL="http://<YOUR_ALB_DNS_OR_DOMAIN>/api/v1"
docker tag brandflow-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/brandflow-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/brandflow-frontend:latest
```

---

### Step 2.3: Store Production Environment Secrets in AWS Secrets Manager

Store your sensitive environment variables in **AWS Secrets Manager** (or SSM Parameter Store):

```bash
aws secretsmanager create-secret \
    --name "brandflow/prod/env" \
    --secret-string '{"DATABASE_URL":"postgresql://brandflow_admin:SecurePassword2026!@brandflow-prod-db.c9k9...rds.amazonaws.com:5432/brandflow_db?sslmode=require","JWT_ACCESS_SECRET":"super_secret_access_key_brandflow_2026"}'
```

---

### Step 2.4: Create ECS Task Definition (Fargate)

1. Go to **AWS Console** ➔ **Elastic Container Service (ECS)** ➔ **Task definitions** ➔ **Create new task definition**.
2. **Task definition family**: `brandflow-task-def`
3. **Infrastructure requirements**:
   - Launch type: **AWS Fargate**
   - OS/Architecture: **Linux/X86_64**
   - CPU: **0.5 vCPU** (512 units)
   - Memory: **1 GB RAM**
   - Task role & Execution role: `ecsTaskExecutionRole`
4. **Container 1 (Backend API)**:
   - Name: `backend`
   - Image URI: `<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/brandflow-backend:latest`
   - Container port: `5000`
5. **Container 2 (Frontend Nginx)**:
   - Name: `frontend`
   - Image URI: `<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/brandflow-frontend:latest`
   - Container port: `80`
6. Click **Create**.

---

### Step 2.5: Create Application Load Balancer (ALB)

1. Go to **AWS Console** ➔ **EC2** ➔ **Load Balancers** ➔ Click **Create load balancer**.
2. Select **Application Load Balancer (ALB)**.
3. **Name**: `brandflow-alb`
4. **Scheme**: Internet-facing
5. **Listeners**:
   - HTTP (Port 80) -> Forward to Target Group `brandflow-tg-frontend`
   - HTTP (Port 5000) -> Forward to Target Group `brandflow-tg-backend`
6. Click **Create load balancer**.

---

### Step 2.6: Create ECS Cluster & Launch Fargate Service

1. Go to **AWS Console** ➔ **ECS** ➔ **Clusters** ➔ **Create cluster**.
   - Name: `brandflow-ecs-cluster`
   - Infrastructure: **AWS Fargate (Serverless)**
2. Create **ECS Service**:
   - Launch type: **Fargate**
   - Task definition: `brandflow-task-def:latest`
   - Desired tasks: **2** (For High Availability across multiple Availability Zones)
   - Load balancing: Select **Application Load Balancer** (`brandflow-alb`).
   - Auto-scaling: Min **2 tasks**, Max **50 tasks** (Scales up when CPU > 70%).
3. Click **Create Service**.

---

## 🌐 3. Live Verification & Auto-Scaling

* **Load Balancer DNS Name**: `brandflow-alb-123456.us-east-1.elb.amazonaws.com`
* **Health Endpoint**: `http://<ALB_DNS_NAME>:5000/health`
* **Auto-Scaling Policy**: If traffic spikes (e.g. 100,000+ requests), AWS Fargate automatically provisions new container tasks in seconds without any manual intervention!

---

## 🛠️ 4. Cheat Sheet & Management Commands

```bash
# Force new deployment on ECS Fargate (Zero-downtime rolling update):
aws ecs update-service --cluster brandflow-ecs-cluster --service brandflow-service --force-new-deployment

# Inspect ECS task execution logs:
aws logs tail /ecs/brandflow-task-def --follow
```
