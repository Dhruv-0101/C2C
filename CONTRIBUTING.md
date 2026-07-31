# 🤝 BrandFlow Contribution Guidelines

Welcome to the **BrandFlow** development team! To ensure seamless collaboration, high code quality, and fast release cycles, all developers are required to follow these guidelines.

---

## 🌿 1. Branching Strategy

We follow the **Feature Branch Workflow**:

- **`main`**: Production-ready code only. **Direct pushes to `main` are strictly forbidden.**
- **`develop`**: Integration branch for upcoming releases.
- **`feature/<feature-name>`**: New features (e.g., `feature/ai-caption-generator`, `feature/auth-jwt`).
- **`bugfix/<bug-name>`**: Bug fixes (e.g., `bugfix/token-refresh-loop`).
- **`hotfix/<fix-name>`**: Critical production fixes directly branched from `main`.

---

## 🔄 2. Developer Workflow (Step-by-Step)

### Step 1: Sync Your Local Repository
Before starting work on a new feature, always pull the latest updates:
```bash
git checkout develop
git pull origin develop
```

### Step 2: Create a Dedicated Feature Branch
```bash
git checkout -b feature/my-new-feature
```

### Step 3: Write Code & Test Locally
- Follow the SOLID, DRY, and Clean Architecture principles defined in project documentation.
- Make sure local build checks pass (`npm run build` in both frontend and backend).

### Step 4: Commit Your Changes
Use conventional commit messages:
- `feat: add AI caption generation endpoint`
- `fix: resolve CORS issue for frontend API requests`
- `docs: update setup instructions in README`
- `refactor: extract JWT verification middleware`

```bash
git add .
git commit -m "feat: add user profile update feature"
```

### Step 5: Push Branch & Open a Pull Request (PR)
```bash
git push origin feature/my-new-feature
```
1. Go to GitHub and open a **Pull Request** targeting `develop` (or `main`).
2. Fill out the PR template with a clear description of changes.
3. Request review from at least 1 teammate.
4. Ensure all automated GitHub Actions CI/CD checks pass.

---

## 🧪 3. Code Quality Standards

1. **Keep Controllers & Components Thin**:
   - Business logic belongs in `*.logic.js` files in backend modules.
   - API data fetching belongs in TanStack Query custom hooks (`hooks/`) in frontend.
2. **Environment Variables**:
   - Never commit API keys, secrets, or `.env` files to Git.
   - Always update `.env.example` when introducing new environment variables.
3. **No Direct Database Access in Controllers**:
   - Database queries must stay inside `*.repository.js` files using Prisma.

---

Thank you for contributing to BrandFlow! 🚀
