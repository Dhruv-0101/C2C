/**
 * 🏷️ ADMIN & SUBADMIN PORTAL TAB IDENTIFIERS
 * Single source of truth for tab routing, UI views, and RBAC permissions.
 * Prevents magic strings and typo bugs across the application.
 */
export const ADMIN_TABS = Object.freeze({
  DASHBOARD: 'dashboard',
  TEMPLATES: 'templates',
  FESTIVALS: 'festivals',
  FRAMES: 'frames',
  CATEGORIES: 'categories',
  USERS: 'users',
  SUB_ADMINS: 'subadmins',
  SUB_ADMIN_ACTIVITY: 'subadmin-activity',
  FINANCE: 'finance',
  POSTS: 'posts',
});

/**
 * List of all valid Admin Tab strings for iteration and validation.
 */
export const ADMIN_TAB_LIST = Object.freeze(Object.values(ADMIN_TABS));

/**
 * Permitted tabs that SuperAdmin can grant to SubAdmin accounts.
 */
export const SUBADMIN_PERMITTED_TABS = Object.freeze([
  ADMIN_TABS.FESTIVALS,
  ADMIN_TABS.CATEGORIES,
  ADMIN_TABS.FRAMES,
  ADMIN_TABS.TEMPLATES,
  ADMIN_TABS.POSTS,
]);

/**
 * Metadata configuration for subadmin permission checkboxes and UI selectors
 */
export const SUBADMIN_TAB_CONFIG = Object.freeze([
  {
    id: ADMIN_TABS.FESTIVALS,
    label: "Festival Calendar",
    description: "Manage monthly festival events, dates, and special promotional days.",
    icon: "Calendar",
  },
  {
    id: ADMIN_TABS.CATEGORIES,
    label: "Business Categories",
    description: "Manage industry category tags, emojis, and display classifications.",
    icon: "FolderKanban",
  },
  {
    id: ADMIN_TABS.FRAMES,
    label: "Brand Frame Studio",
    description: "Create and publish Canva-style custom brand frames and overlays.",
    icon: "Layers",
  },
  {
    id: ADMIN_TABS.TEMPLATES,
    label: "Graphic Templates",
    description: "Upload and maintain AI base graphic background templates.",
    icon: "FileCode2",
  },
  {
    id: ADMIN_TABS.POSTS,
    label: "Generated Posts Audit",
    description: "Audit and track user post creations across templates and festivals.",
    icon: "Sparkles",
  },
]);
