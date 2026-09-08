# Admin Feature Architecture & Developer Guide

## Overview
The `admin` feature manages the high-privilege console for **SuperAdmins** and **SubAdmins** (role-based restricted tab access).

---

## 📁 Clean & Symmetrical Directory Structure

```text
src/features/admin/
├── 🔗 index.js                           # Central barrel export (import { AdminDashboardContainer } from "@/features/admin")
├── 📖 README.md                          # Architecture & developer guide
│
├── 🧠 containers/                        # DATA & LOGIC LAYER (Smart Components)
│   ├── AdminDashboardContainer.jsx    # Handles React Query hooks, mutations, & RBAC state
│   └── SubAdminDashboardContainer.jsx # SubAdmin scoped logic container
│
└── 🎨 components/                        # PRESENTATIONAL UI LAYER (Pure Visuals)
    ├── index.js                       # Components barrel export
    ├── AdminDashboardView.jsx         # Main Dashboard Layout Orchestrator
    ├── AdminSidebar.jsx               # Dedicated Admin Left Navigation Sidebar
    ├── AdminStatsHeader.jsx           # Clickable Metric Overview Cards Header
    ├── AdminFestivalManagerView.jsx   # Festival Calendar Manager View
    ├── SubAdminDashboardView.jsx      # SubAdmin View
    │
    ├── 📑 tabs/                       # ALL 7 STANDARDIZED ADMIN TAB VIEWPORTS
    │   ├── AdminTemplatesTab.jsx      # 1. AI Base Templates Tab
    │   ├── AdminFestivalsTab.jsx      # 2. Festival Calendar Tab
    │   ├── AdminFramesTab.jsx         # 3. Brand Frames Studio Tab
    │   ├── AdminStylesTab.jsx         # 4. Design System & Palettes Tab
    │   ├── AdminCategoriesTab.jsx     # 5. Business Categories Tab
    │   ├── AdminUsersTab.jsx          # 6. SMB User Directory Tab
    │   └── AdminSubAdminsTab.jsx      # 7. SubAdmin Directory & RBAC Badges Tab
    │
    └── 📱 screens/                    - IN-PAGE FULL-SCREEN VIEWS (No Overlay Modals)
        ├── CreateSubAdminScreen.jsx   # Full-Screen Create SubAdmin Form
        └── EditSubAdminScreen.jsx     # Full-Screen Edit RBAC Permissions Form
```

---

## 📑 All 7 Standardized Admin Tabs

| Tab Name | Tab Component | What It Renders |
| :--- | :--- | :--- |
| **Templates** | [`AdminTemplatesTab.jsx`](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/frontend/src/features/admin/components/tabs/AdminTemplatesTab.jsx) | AI Base Graphic Templates Manager |
| **Festivals** | [`AdminFestivalsTab.jsx`](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/frontend/src/features/admin/components/tabs/AdminFestivalsTab.jsx) | Festival & Special Days Calendar Manager |
| **Frames** | [`AdminFramesTab.jsx`](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/frontend/src/features/admin/components/tabs/AdminFramesTab.jsx) | Canva Vector Frames Studio Manager |
| **Styles** | [`AdminStylesTab.jsx`](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/frontend/src/features/admin/components/tabs/AdminStylesTab.jsx) | Design System & Color Tokens Manager |
| **Categories** | [`AdminCategoriesTab.jsx`](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/frontend/src/features/admin/components/tabs/AdminCategoriesTab.jsx) | Master Business Categories Manager |
| **Users** | [`AdminUsersTab.jsx`](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/frontend/src/features/admin/components/tabs/AdminUsersTab.jsx) | SMB Registered User Tenants Directory |
| **SubAdmins** | [`AdminSubAdminsTab.jsx`](file:///Users/mac0014/Desktop/dhruvvs-workspace/BrandFlow/C2C/frontend/src/features/admin/components/tabs/AdminSubAdminsTab.jsx) | SubAdmin Directory & RBAC Permission Badges |
