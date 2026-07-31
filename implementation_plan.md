# Implementation Plan - BrandFlow Frontend Setup & Authentication UI

Build the enterprise-grade **BrandFlow React.js (Vite)** frontend application following the strict project rules defined in `crc.md`.

## Key Features & Design Architecture
1. **Centralized Design System & Tokens**:
   - Centralized theme tokens defined in `src/styles/theme.css` and `src/constants/theme.constants.js` using HSL CSS variables (`--bg-primary`, `--marigold`, `--teal`, `--indigo`, `--font-space-grotesk`, `--font-jakarta-sans`, etc.) linked to Tailwind CSS.
   - Editing a single color or font token in `theme.css` instantly updates the entire app's look and feel.
2. **State Management Division**:
   - **Redux Toolkit**: ONLY for global Auth state (`user`, `accessToken`, `isAuthenticated`, `role`), theme, and UI drawer states (`authSlice.js`).
   - **TanStack Query (React Query)**: For all API data fetching, mutations, caching, and optimistic updates (`useRegister`, `useLogin`, `useLogout`).
3. **Form Architecture**:
   - **React Hook Form + Zod**: Zero `useState` for forms. Production validation with custom error feedback.
4. **API Layer**:
   - Modular Axios instances with automatic JWT Bearer token injection and silent HTTP-Only cookie refresh interceptors (`src/services/api.service.js` & `src/services/auth.api.js`).
5. **Unified Single Entry Auth UI**:
   - Premium Glassmorphism UI with Marigold/Teal brand gradients.
   - Pages: `/login` (Login), `/register` (Sign Up), `/` (Role-based Dashboard Redirect).
   - Features: Password toggle, role indicator (`SMB Owner` vs `Admin`), loading skeletons, toast alerts, responsive layouts.

---

## Proposed Folder Structure (`frontend/src/`)

```
frontend/src/
├── app/
│   ├── App.jsx
│   └── main.jsx
├── assets/
│   └── brandflow-logo.svg
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Spinner.jsx
│   │   └── Alert.jsx
│   └── common/
│       ├── Header.jsx
│       └── Footer.jsx
├── constants/
│   ├── api.constants.js
│   └── theme.constants.js
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.jsx
│       │   └── RegisterForm.jsx
│       ├── hooks/
│       │   ├── useLogin.js
│       │   ├── useRegister.js
│       │   └── useLogout.js
│       └── pages/
│           ├── LoginPage.jsx
│           └── RegisterPage.jsx
├── hooks/
│   └── useAuth.js
├── layouts/
│   ├── AuthLayout.jsx
│   └── MainLayout.jsx
├── routes/
│   ├── AppRoutes.jsx
│   ├── ProtectedRoute.jsx
│   └── PublicRoute.jsx
├── services/
│   ├── api.service.js
│   └── auth.api.js
├── store/
│   ├── store.js
│   └── slices/
│       └── authSlice.js
├── styles/
│   ├── index.css
│   └── theme.css
├── utils/
│   └── storage.util.js
└── validations/
    └── auth.validation.js
```

---

## Verification Plan

### Automated Verification
1. Initialize Vite React app in `frontend/` using `npm create vite@latest frontend -- --template react`.
2. Install dependencies: `@reduxjs/toolkit`, `react-redux`, `@tanstack/react-query`, `axios`, `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss`, `postcss`, `autoprefixer`.
3. Run `npm run build` inside `frontend/` to verify zero build or linting errors.

### Manual Verification
1. Launch dev server using `npm run dev` in `frontend/`.
2. Test Login & Register UI flows:
   - Register a new account (`END_USER` / `ADMIN`).
   - Verify JWT Access Token stored in Redux Toolkit and HTTP-Only refresh cookie set by Express.
   - Verify automatic redirect to appropriate dashboard based on role.
