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
  googleLogin: (payload) => api.post('/auth/google', payload),

  /**
   * Request password reset link email
   * @param {{ email: string }} payload
   */
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),

  /**
   * Reset user password using reset token
   * @param {{ token: string, newPassword: string }} payload
   */
  resetPassword: (payload) => api.post('/auth/reset-password', payload),

  /**
   * Complete 2FA challenge verification on login
   * @param {{ mfaToken: string, code: string }} payload
   */
  verifyLogin2FA: (payload) => api.post('/auth/2fa/verify-login', payload),

  /**
   * Setup 2FA (Generates QR Code and Secret)
   */
  setup2FA: () => api.post('/auth/2fa/setup'),

  /**
   * Enable 2FA with 6-digit verification code
   * @param {{ code: string }} payload
   */
  enable2FA: (payload) => api.post('/auth/2fa/enable', payload),

  /**
   * Disable 2FA
   */
  disable2FA: () => api.post('/auth/2fa/disable'),

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
  createSubAdmin: (data) => api.post('/auth/subadmin', data),

  /**
   * SuperAdmin: Get list of SubAdmins
   */
  getSubAdmins: () => api.get('/auth/subadmins'),

  /**
   * SuperAdmin: Delete SubAdmin account
   * @param {string} id
   */
  deleteSubAdmin: (id) => api.delete(`/auth/subadmin/${id}`),
};
