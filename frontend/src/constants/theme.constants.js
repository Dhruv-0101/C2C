/**
 * Theme & UI Constants
 */
export const USER_ROLES = {
  END_USER: 'END_USER',
  ADMIN: 'ADMIN',
  SUB_ADMIN: 'SUB_ADMIN',
};

export const ADMIN_TABS = [
  { id: 'templates', label: 'AI Base Templates', description: 'Manage graphic base templates' },
  { id: 'festivals', label: 'Festival Calendar', description: 'Interactive monthly festival events & special days' },
  { id: 'frames', label: 'Canva Vector Frames', description: 'Manage transparent Canva frames' },
  { id: 'styles', label: 'Design System & Palettes', description: 'Manage brand color palettes & typography' },
  { id: 'categories', label: 'Business Categories', description: 'Manage industry category tags' },
  { id: 'subadmins', label: 'SubAdmin Directory', description: 'Manage sub-admin privileges' },
  { id: 'users', label: 'SMB User Directory', description: 'Manage platform users and SMB accounts' },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'brandflow_access_token',
  USER_DATA: 'brandflow_user_data',
  THEME_MODE: 'brandflow_theme_mode',
};
