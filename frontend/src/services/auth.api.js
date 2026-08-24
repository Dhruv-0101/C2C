import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Authentication & 2FA API Service
 */
export const authApi = {
  /**
   * Login user with credentials
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

  /**
   * Authenticate via Google OAuth 2.0 ID Token
   * @param {{ idToken: string }} payload
   */
  googleLogin: (payload) => api.post(API_ENDPOINTS.AUTH.GOOGLE, payload),

  /**
   * Request password reset link email
   * @param {{ email: string }} payload
   */
  forgotPassword: (payload) => api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload),

  /**
   * Reset user password using reset token
   * @param {{ token: string, newPassword: string }} payload
   */
  resetPassword: (payload) => api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload),

  /**
   * Complete 2FA challenge verification on login
   * @param {{ mfaToken: string, code: string }} payload
   */
  verifyLogin2FA: (payload) => api.post(API_ENDPOINTS.AUTH.VERIFY_2FA, payload),

  /**
   * Setup 2FA (Generates QR Code and Secret)
   */
  setup2FA: () => api.post(API_ENDPOINTS.AUTH.SETUP_2FA),

  /**
   * Enable 2FA with 6-digit verification code
   * @param {{ code: string }} payload
   */
  enable2FA: (payload) => api.post(API_ENDPOINTS.AUTH.ENABLE_2FA, payload),

  /**
   * Disable 2FA
   */
  disable2FA: () => api.post(API_ENDPOINTS.AUTH.DISABLE_2FA),

  /**
   * Register new user account
   * @param {{ fullName: string, email: string, password: string }} userData
   */
  signup: (userData) => api.post(API_ENDPOINTS.AUTH.SIGNUP, userData),

  /**
   * Logout user session
   */
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * Get authenticated user profile
   */
  getProfile: () => api.get(API_ENDPOINTS.AUTH.ME),

  /**
   * SuperAdmin: Create SubAdmin account
   * @param {{ fullName: string, email: string, password: string, allowedTabs: string[] }} data
   */
  createSubAdmin: (data) => api.post(API_ENDPOINTS.AUTH.SUBADMIN, data),

  /**
   * SuperAdmin: Get list of SubAdmins with pagination
   * @param {{ page?: number, limit?: number, search?: string }} [params]
   */
  getSubAdmins: (params = {}) => api.get(API_ENDPOINTS.AUTH.SUBADMINS, { params }),

  /**
   * Admin & SubAdmin: Get list of registered end-users with pagination
   * @param {{ page?: number, limit?: number, search?: string }} [params]
   */
  getUsers: (params = {}) => api.get(API_ENDPOINTS.AUTH.USERS, { params }),

  /**
   * SuperAdmin: Delete SubAdmin account
   * @param {string} id
   */
  deleteSubAdmin: (id) => api.delete(`${API_ENDPOINTS.AUTH.SUBADMIN}/${id}`),

  /**
   * SuperAdmin: Update SubAdmin account permissions
   * @param {string} id
   * @param {{ fullName?: string, email?: string, allowedTabs?: string[] }} data
   */
  updateSubAdmin: (id, data) => api.put(`${API_ENDPOINTS.AUTH.SUBADMIN}/${id}`, data),
};
