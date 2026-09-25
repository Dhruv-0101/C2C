/**
 * 🎨 Theme, Roles & Storage Key Constants
 */
export const THEME_MODES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

export const DEFAULT_THEME = THEME_MODES.LIGHT;

export const USER_ROLES = Object.freeze({
  END_USER: 'END_USER',
  ADMIN: 'ADMIN',
  SUB_ADMIN: 'SUB_ADMIN',
});

export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: 'brandflow_access_token',
  USER_DATA: 'brandflow_user_data',
  THEME_MODE: 'brandflow_theme_mode',
  SIDEBAR_COLLAPSED: 'brandflow_sidebar_collapsed',
  ADMIN_SIDEBAR_COLLAPSED: 'brandflow_admin_sidebar_collapsed',
  REMEMBERED_EMAIL: 'brandflow_remembered_email',
});

export default THEME_MODES;
