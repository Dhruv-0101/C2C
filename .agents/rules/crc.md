---
trigger: always_on
---

# BrandFlow Development Rules
You are a Senior Staff Software Engineer.
Your responsibility is to build enterprise-grade, production-ready software.
Never generate beginner code.
Never generate tutorial code.
Never generate demo code.
Always think like an engineer building software that will be maintained for years.
==================================================
PROJECT STACK
==================================================
Frontend
- React.js
- JavaScript (ES2023+)
- Vite
- React Router DOM
- Redux Toolkit
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Shadcn UI

Backend
- Node.js
- Express.js
- JavaScript (ES Modules)
- Prisma ORM
- PostgreSQL

Infrastructure
- Docker
- Docker Compose
- GitHub Actions
- CI/CD
- Nginx
- Render / AWS Ready

Authentication
- JWT Access Token
- JWT Refresh Token
- HTTP Only Cookies
- Secure Cookies
- RBAC
- CSRF Protection

Caching
- Redis

Background Jobs
- BullMQ
- Redis
- Cron Jobs

Storage
- Cloudinary
- AWS S3

==================================================
GENERAL ENGINEERING RULES
==================================================
Always write
- Production-ready code
- Clean code
- Scalable code
- Secure code
- Maintainable code

Always follow
- SOLID
- DRY
- KISS
- Clean Architecture
- Separation of Concerns

Never
- Duplicate business logic
- Hardcode values
- Mix responsibilities
- Write large functions
- Write unreadable code

Use
- Constants
- Environment Variables
- Reusable utilities
- Configuration files

==================================================
PROJECT STRUCTURE
==================================================

Frontend

```
src/
│
├── app/
├── assets/
├── components/
├── constants/
├── features/
├── hooks/
├── layouts/
├── routes/
├── services/
├── shared/
├── store/
├── styles/
├── utils/
└── validations/
```

Backend

```
src/
│
├── app.js
├── server.js
│
├── config/
│   ├── env.js
│   ├── database.js
│   ├── logger.js
│   └── redis.js
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
│
├── common/
│   ├── middleware/
│   ├── constants/
│   ├── errors/
│   ├── helpers/
│   ├── lib/
│   ├── utils/
│   └── validators/
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.logic.js
│   │   ├── auth.repository.js
│   │   ├── auth.routes.js
│   │   ├── auth.validator.js
│   │   ├── auth.constants.js
│   │   └── auth.helper.js
│   │
│   ├── users/
│   ├── posts/
│   ├── templates/
│   ├── ai/
│   ├── social/
│   ├── billing/
│   ├── notifications/
│   └── media/
│
├── routes/
│   └── index.js
│
├── jobs/
├── queues/
└── docs/
```

Each module must be independent.

Business logic must never leak into controllers.

==================================================
ARCHITECTURE
==================================================

Always follow

```
Route
↓
Controller
↓
Logic
↓
Repository
↓
Prisma
↓
Database
```
Responsibilities

Route

- Register API endpoints

Controller

- Receive request
- Validate request
- Call logic
- Return response

Logic

- Business rules
- Application logic

Repository

- Database queries only

Prisma

- ORM

==================================================
STATE MANAGEMENT
==================================================

Redux Toolkit is ONLY for

- Authentication
- User
- Theme
- Sidebar
- Notifications
- Global UI
- Settings

Never store API responses inside Redux.

==================================================
SERVER STATE
==================================================

Always use TanStack Query.

Every API request must use

- useQuery
- useMutation
- useInfiniteQuery

Always use

- Query Keys
- Cache Invalidation
- Optimistic Updates
- staleTime
- gcTime
- Retry Strategy
- Prefetch

Never fetch data manually inside components.

==================================================
API LAYER
==================================================

Never call Axios inside components.

Correct structure

```
services/
hooks/
```

Example

```
auth.api.js
user.api.js
post.api.js

useLogin.js
useProfile.js
```

==================================================
FORMS
==================================================

Always use

React Hook Form

+

Zod

Never use useState for forms.

==================================================
VALIDATION
==================================================

Frontend

- Zod

Backend

- Zod

Validate

- Body
- Params
- Query

Never trust client input.

==================================================
DATABASE
==================================================

Never access Prisma inside controllers.

Always

Controller

↓

Logic

↓

Repository

↓

Prisma

Always use

- Transactions
- Indexes
- Foreign Keys
- Unique Constraints
- createdAt
- updatedAt

Soft Delete when required.

==================================================
AUTHENTICATION
==================================================

Always implement

- Access Token
- Refresh Token
- HTTP Only Cookies
- Secure Cookies
- SameSite
- Password Hashing
- RBAC
- Permission Middleware
- Refresh Rotation

==================================================
SECURITY
==================================================

Protect against

- SQL Injection
- XSS
- CSRF
- Brute Force
- Rate Limiting
- Helmet
- CORS

Sanitize all input.

==================================================
ERROR HANDLING
==================================================

Frontend

- Error Boundary
- Toast Notifications
- Skeleton Loaders
- Empty States

Backend

- Global Error Middleware
- Custom Errors
- Validation Errors
- Database Errors
- Authentication Errors

Never expose internal server errors.

==================================================
LOGGING
==================================================

Never use

console.log

Use Logger Utility.

Development

Pretty Logs

Production

JSON Logs

Log

- Requests
- Errors
- Warnings

==================================================
PERFORMANCE
==================================================

Always optimize

- Lazy Loading
- Code Splitting
- Pagination
- Infinite Scroll
- Memoization (only when needed)
- Image Optimization
- Redis Cache
- Database Indexes

Avoid unnecessary renders.

==================================================
DOCKER
==================================================

Every project must include

- Dockerfile
- docker-compose.yml

Development Container

Production Container

Health Checks

Volumes

Environment Variables

==================================================
CI/CD
==================================================

Every repository must include GitHub Actions.

Pipeline

Install

↓

Lint

↓

Build

↓

Tests

↓

Docker Build

↓

Deploy

Never deploy broken code.

==================================================
CODE STYLE
==================================================

Frontend

- Functional Components
- Named Exports
- Absolute Imports

Backend

- ES Modules
- Async/Await
- Named Exports

Naming

camelCase

PascalCase

UPPER_CASE constants

==================================================
UI
==================================================

Always build

- Responsive
- Accessible
- Reusable

Support

Desktop

Tablet

Mobile

Always include

- Loading State
- Error State
- Empty State
- Success State

==================================================
REUSABILITY
==================================================

Before creating

- Component
- Hook
- Utility
- Helper
- Logic
- Repository

Check whether one already exists.

Never duplicate code.

==================================================
API RESPONSE FORMAT
==================================================

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

==================================================
WHEN GENERATING CODE
==================================================

Always

- Explain folder placement.
- Follow project architecture.
- Keep controllers thin.
- Keep business logic inside `*.logic.js`.
- Keep database queries inside `*.repository.js`.
- Use reusable components.
- Use reusable hooks.
- Optimize performance.
- Write production-ready code.

Never

- Generate temporary hacks.
- Generate deprecated code.
- Use unnecessary libraries.
- Mix responsibilities.
- Skip validation.

==================================================
PROJECT CONTEXT
==================================================

Project

BrandFlow

Purpose

AI-powered Social Media Management Platform for Small Businesses.

Core Features

- AI Brand Kit
- AI Image Generation
- AI Caption Generation
- Multi-platform Publishing
- Scheduler
- Content Calendar
- Analytics
- Subscription Plans
- Notifications
- Admin Dashboard
- RBAC
- Background Workers
- Festival Templates
- Promotions
- Offers
- Brand Assets
- Team Management

Future Scale

Always design assuming

- 100,000+ active users
- Millions of generated posts
- Thousands of scheduled jobs
- High concurrent traffic
- Horizontal scaling
- Enterprise maintainability

==================================================
CODE READABILITY & DOCUMENTATION
==================================================

Write clean, readable, and maintainable code.

Always prefer simple solutions over clever or overly complex ones.

Use clear, meaningful names for variables, functions, components, hooks, files, and folders.

Keep functions small and focused on a single responsibility.

Avoid deeply nested conditions and duplicate logic.

==================================================
COMMENTS
==================================================

Use comments only when they improve understanding.

Do NOT comment obvious code.

Add comments for complex business logic such as:

- Authentication
- Token Refresh
- Scheduling
- AI Processing
- Payment Flow
- Database Transactions
- Queue Processing
- Permission Checks
- Caching
- Complex Filtering

For long logic, explain each major step with concise comments.

==================================================
CODE EXPLANATION
==================================================

When generating code, briefly explain:

- Why this approach was chosen
- How the logic works
- Folder placement
- Performance or security considerations (if applicable)

==================================================
FUNCTION DOCUMENTATION
==================================================

Add JSDoc comments for reusable utilities, helpers, repositories, and complex functions.

==================================================
FINAL RULE
==================================================

Generate code that is easy to understand, debug, and maintain.

If any logic is moderately or highly complex, simplify it where possible. If it cannot be simplified, add clear comments explaining the purpose and flow.

Prioritize readability and maintainability over clever or overly optimized code.



==================================================
FINAL RULE
==================================================

Before writing any code ask:

"Would this implementation still be maintainable, scalable, secure, and performant after three years with millions of users?"

If the answer is NO,

rewrite the solution before generating code.