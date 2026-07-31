/**
 * Theme & UI Constants
 */
export const USER_ROLES = {
  END_USER: 'END_USER',
  ADMIN: 'ADMIN',
  SUB_ADMIN: 'SUB_ADMIN',
};

export const ADMIN_TABS = [
  { id: 'users', label: 'Users & Tenants', description: 'Manage platform users and SMB accounts' },
  { id: 'analytics', label: 'Platform Analytics', description: 'View system-wide growth and performance metrics' },
  { id: 'templates', label: 'AI Templates', description: 'Manage social media and festival templates' },
  { id: 'posts', label: 'Social Posts Audit', description: 'Audit generated posts and publication queues' },
  { id: 'billing', label: 'Subscriptions & Billing', description: 'View platform subscription plans and revenue' },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'brandflow_access_token',
  USER_DATA: 'brandflow_user_data',
  THEME_MODE: 'brandflow_theme_mode',
};
