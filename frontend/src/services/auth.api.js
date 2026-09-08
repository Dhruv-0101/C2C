import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Authentication & 2FA API Service
 * Centralized HTTP service handling authentication, session lifecycle, 2FA, RBAC SubAdmin management, and User queries.
 */
export const authApi = {
  /**
   * POST /api/v1/auth/login
   * Authenticates user with email and password. Generates JWT access and refresh tokens.
   *
   * @param {Object} credentials
   * @param {string} credentials.email - User registered email address
   * @param {string} credentials.password - Raw user password string
   * @returns {Promise<Object>} Response containing user profile, role, access token, and HTTP-only refresh cookie
   */
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

  /**
   * POST /api/v1/auth/google
   * Authenticates or registers user via Google OAuth 2.0 ID Token.
   *
   * @param {Object} payload
   * @param {string} payload.idToken - Google JWT credential token issued by Google Identity Services
   * @returns {Promise<Object>} User session payload with access token and user role
   */
  googleLogin: (payload) => api.post(API_ENDPOINTS.AUTH.GOOGLE, payload),

  /**
   * POST /api/v1/auth/forgot-password
   * Initiates password recovery flow by sending a password reset email with a secure token.
   *
   * @param {Object} payload
   * @param {string} payload.email - Registered account email address
   * @returns {Promise<Object>} Success status message confirming reset email dispatch
   */
  forgotPassword: (payload) => api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload),

  /**
   * POST /api/v1/auth/reset-password
   * Resets account password using a valid reset token from email link.
   *
   * @param {Object} payload
   * @param {string} payload.token - Verification reset token
   * @param {string} payload.newPassword - New account password
   * @returns {Promise<Object>} Success confirmation message
   */
  resetPassword: (payload) => api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload),

  /**
   * POST /api/v1/auth/2fa/verify-login
   * Verifies 2FA TOTP code during initial login step when 2FA is active.
   *
   * @param {Object} payload
   * @param {string} payload.mfaToken - Temporary MFA session token
   * @param {string} payload.code - 6-digit TOTP authenticator code or emergency backup code
   * @returns {Promise<Object>} Authenticated user profile and full access token
   */
  verifyLogin2FA: (payload) => api.post(API_ENDPOINTS.AUTH.VERIFY_2FA, payload),

  /**
   * POST /api/v1/auth/2fa/setup
   * Generates a new 2FA secret and QR code URL for setting up Google Authenticator/Authy.
   *
   * @returns {Promise<Object>} `{ qrCodeUrl: string, secret: string }`
   */
  setup2FA: () => api.post(API_ENDPOINTS.AUTH.SETUP_2FA),

  /**
   * POST /api/v1/auth/2fa/enable
   * Confirms and activates 2FA on the user's account using a 6-digit TOTP code.
   *
   * @param {Object} payload
   * @param {string} payload.code - 6-digit verification code from authenticator app
   * @returns {Promise<Object>} Returns generated single-use emergency backup recovery codes
   */
  enable2FA: (payload) => api.post(API_ENDPOINTS.AUTH.ENABLE_2FA, payload),

  /**
   * POST /api/v1/auth/2fa/disable
   * Disables 2FA security on the authenticated user's account in the database.
   *
   * @returns {Promise<Object>} Success message confirming 2FA deactivation
   */
  disable2FA: () => api.post(API_ENDPOINTS.AUTH.DISABLE_2FA),

  /**
   * POST /api/v1/auth/signup
   * Registers a new user account in PostgreSQL database and initializes default AI BrandKit.
   *
   * @param {Object} userData
   * @param {string} userData.fullName - Full name of the user/business owner
   * @param {string} userData.email - Account email address
   * @param {string} userData.password - Account password
   * @returns {Promise<Object>} Created user payload and JWT session tokens
   */
  signup: (userData) => api.post(API_ENDPOINTS.AUTH.SIGNUP, userData),

  /**
   * POST /api/v1/auth/logout
   * Invalidates current refresh token in database/Redis and clears HTTP-only authentication cookies.
   *
   * @returns {Promise<Object>} Success message confirming session destruction
   */
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * GET /api/v1/auth/me
   * Fetches current authenticated user profile, permissions, and active 2FA status from database.
   *
   * @returns {Promise<Object>} Logged-in user profile object
   */
  getProfile: () => api.get(API_ENDPOINTS.AUTH.ME),

  /**
   * POST /api/v1/auth/subadmin
   * SuperAdmin: Creates a new SubAdmin staff account with custom tab access permissions.
   *
   * @param {Object} data
   * @param {string} data.fullName - SubAdmin staff name
   * @param {string} data.email - SubAdmin email address
   * @param {string} data.password - SubAdmin password
   * @param {Array<string>} data.allowedTabs - List of allowed portal tabs (e.g. `['festivals', 'templates', 'frames']`)
   * @returns {Promise<Object>} Created SubAdmin record payload
   */
  createSubAdmin: (data) => api.post(API_ENDPOINTS.AUTH.SUBADMIN, data),

  /**
   * GET /api/v1/auth/subadmins
   * SuperAdmin: Fetches paginated list of all SubAdmin accounts from database.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search filter keyword for name or email
   * @returns {Promise<Object>} `{ subAdmins: Array, meta: PaginationMeta }`
   */
  getSubAdmins: (params = {}) => api.get(API_ENDPOINTS.AUTH.SUBADMINS, { params }),

  /**
   * GET /api/v1/auth/users
   * Admin & SubAdmin: Fetches paginated list of all registered platform end-users.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search filter keyword
   * @returns {Promise<Object>} `{ users: Array, meta: PaginationMeta }`
   */
  getUsers: (params = {}) => api.get(API_ENDPOINTS.AUTH.USERS, { params }),

  /**
   * DELETE /api/v1/auth/subadmin/:id
   * SuperAdmin: Deletes a SubAdmin account record from database by ID.
   *
   * @param {string} id - SubAdmin user ID UUID
   * @returns {Promise<Object>} Success deletion message
   */
  deleteSubAdmin: (id) => api.delete(`${API_ENDPOINTS.AUTH.SUBADMIN}/${id}`),

  /**
   * PUT /api/v1/auth/subadmin/:id
   * SuperAdmin: Updates SubAdmin account profile details and tab access permissions in database.
   *
   * @param {string} id - SubAdmin user ID UUID
   * @param {Object} data
   * @param {string} [data.fullName] - Updated staff name
   * @param {string} [data.email] - Updated email address
   * @param {Array<string>} [data.allowedTabs] - Updated array of allowed sidebar tabs
   * @returns {Promise<Object>} Updated SubAdmin record
   */
  updateSubAdmin: (id, data) => api.put(`${API_ENDPOINTS.AUTH.SUBADMIN}/${id}`, data),
};
