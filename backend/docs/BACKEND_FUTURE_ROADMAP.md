# 🚀 BrandFlow Backend — Future Enhancements & 100/100 Roadmap

> **Audit Baseline Score:** 94 / 100 (Grade A+ Enterprise Production Ready)  
> **Goal:** Complete roadmap guide for future development, team onboarding, and achieving 100/100 architecture score.

---

## 📌 Executive Summary

This document captures prioritized future backend enhancements deferred for later development phases. Whenever your project roadmap priorities focus on documentation auto-generation, testing suites, or database transactions, follow the step-by-step instructions detailed below.

---

## 📑 Roadmap Items

```text
[ ] Phase 1: OpenAPI 3.0 / Swagger Interactive UI (/api/v1/docs)
[ ] Phase 2: Automated Unit & Integration Testing Suite (Jest / Vitest)
[ ] Phase 3: Explicit Prisma Database Transactions ($transaction)
[ ] Phase 4: Dedicated Billing & Stripe Webhook Module
```

---

## 1. 🌐 Phase 1: OpenAPI 3.0 / Swagger Interactive Documentation

### Goal
Provide interactive web-based API documentation at `http://localhost:5000/api/v1/docs` (or live server `/api/v1/docs`) allowing developers to test endpoints with Bearer JWT authentication directly from the browser.

### Step 1.1: Install Required Packages
Run inside the `backend/` directory:
```bash
npm install swagger-ui-express swagger-jsdoc
```

### Step 1.2: Create Swagger Configuration (`src/config/swagger.js`)
Create a singleton configuration file:

```javascript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BrandFlow Master API Documentation',
      version: '1.0.0',
      description: 'Interactive OpenAPI 3.0 documentation for BrandFlow Backend Services',
      contact: {
        name: 'BrandFlow Engineering Team',
        email: 'api@brandflow.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
      {
        url: 'http://54.144.96.139.nip.io/api/v1',
        description: 'AWS Staging / Production EC2 Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from POST /auth/login',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Automatically scans routes for JSDoc @openapi annotations
  apis: ['./src/routes/index.js', './src/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
```

### Step 1.3: Mount Swagger Route in `src/app.js`
In `src/app.js`, add:

```javascript
import { swaggerUi, swaggerSpec } from './config/swagger.js';

// Serve interactive Swagger API Documentation UI
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'BrandFlow API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));
```

### Step 1.4: Annotate Routes with JSDoc
Example annotation in `src/modules/auth/auth.routes.js`:

```javascript
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user & issue JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@brandflow.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login);
```

---

## 🧪 2. Phase 2: Automated Unit & Integration Testing

### Goal
Implement co-located test suites inside each module directory (`src/modules/*/__tests__/`) to ensure continuous code quality during refactoring.

### Step 2.1: Install Testing Framework
```bash
npm install --save-dev jest supertest @types/jest
```

### Step 2.2: Add Test Script to `package.json`
```json
"scripts": {
  "test": "jest --runInBand --detectOpenHandles"
}
```

### Step 2.3: Example Module Unit Test Structure
```text
src/modules/category/
├── __tests__/
│   ├── category.controller.test.js
│   └── category.validator.test.js
├── category.controller.js
├── category.logic.js
...
```

---

## 🔒 3. Phase 3: Explicit Prisma Database Transactions

### Goal
Ensure multi-table writes execute atomically. If any query fails, all previous writes roll back automatically.

### Code Pattern Example (`src/modules/post/post.logic.js`)
```javascript
import { prisma } from '../../config/database.js';

export const createPostWithNotification = async (userId, postData) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create Post
    const newPost = await tx.post.create({
      data: {
        userId,
        ...postData,
      },
    });

    // 2. Create Audit Log / Notification inside same transaction
    await tx.notification.create({
      data: {
        userId,
        title: 'New Post Created',
        message: `Post ${newPost.id} was created successfully`,
        type: 'POST_CREATED',
      },
    });

    return newPost;
  });
};
```

---

## 💳 4. Phase 4: Dedicated Billing Domain Module

### Goal
Isolate Stripe webhooks, checkout sessions, and subscription entitlement logic into a dedicated domain module.

```text
src/modules/billing/
├── billing.controller.js   # Webhook signature verification & checkout callback handlers
├── billing.logic.js        # Stripe API integration & subscription calculations
├── billing.repository.js   # User subscription status & credit balance queries
├── billing.routes.js       # Express routes for /billing/checkout & /billing/webhook
└── billing.validator.js    # Zod payload schemas for plan selection
```

---

## 📚 Related Documentation Links
* [Postman API Collections](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/backend/docs/postman/)
* [Production Deployment Guide](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/PRODUCTION_DEPLOYMENT_GUIDE.md)
* [CI/CD Pipeline Guide](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/CICD_PIPELINE_GUIDE.md)
