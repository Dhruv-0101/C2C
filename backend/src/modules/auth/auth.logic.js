import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors/custom-errors.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generate2FAToken,
  verify2FAToken,
  hashToken,
  generateRandomToken,
  verifyRefreshToken,
} from '../../common/helpers/token.helper.js';
import {
  generateTwoFactorSetup,
  verifyTwoFactorToken,
  generateBackupCodes,
  verifyBackupCode,
} from '../../common/helpers/two-factor.helper.js';
import { addWelcomeEmailJob, addPasswordResetEmailJob, addRegistrationOtpEmailJob } from '../../queues/email.queue.js';
import { generate4DigitOtp, saveRegistrationOtp, verifyRegistrationOtp } from './auth.otp.js';
import { getRefreshTokenExpiryDate } from './auth.constants.js';
import { sanitizeUser } from './auth.helper.js';
import * as authRepository from './auth.repository.js';

const googleClient = new OAuth2Client();

/**
 * Authenticate or Sign Up via Google OAuth 2.0 ID Token
 */
export async function loginWithGoogle({ idToken }) {
  let payload;
  try {
    const clientId = env.GOOGLE_CLIENT_ID;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      ...(clientId ? { audience: clientId } : {}),
    });
    payload = ticket.getPayload();
  } catch (error) {
    logger.error('❌ Google verifyIdToken error:', error?.message || error);
    throw new UnauthorizedError(`Google auth error: ${error?.message || 'Invalid token'}`);
  }

  if (!payload || !payload.email) {
    throw new UnauthorizedError('Unable to retrieve valid profile data from Google account.');
  }

  // Strictly enforce verified email to prevent Google account-linking takeover attacks
  if (!payload.email_verified) {
    logger.warn(`🛑 [AuthLogic] Rejected unverified Google email attempt: ${payload.email}`);
    throw new UnauthorizedError('Your Google email address is not verified. Please verify it with Google before signing in.');
  }

  const email = payload.email.toLowerCase();
  const fullName = payload.name || payload.given_name || 'Google User';
  const avatarUrl = payload.picture || null;
  const googleId = payload.sub || null;

  let user = await authRepository.findUserByEmail(email);

  if (!user) {
    user = await authRepository.createUser({
      email,
      passwordHash: null,
      fullName,
      avatarUrl,
      googleId,
      isGoogleRegistered: true,
      role: 'END_USER',
    });

    // Dispatch Welcome Email Job
    addWelcomeEmailJob({ email: user.email, fullName: user.fullName }).catch(() => { });
  } else {
    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }
    // Update profile with Google fields if linking or missing
    const updates = {};
    if (!user.avatarUrl && avatarUrl) updates.avatarUrl = avatarUrl;
    if (!user.googleId && googleId) updates.googleId = googleId;
    if (!user.isGoogleRegistered) updates.isGoogleRegistered = true;

    if (Object.keys(updates).length > 0) {
      await authRepository.updateUserProfile(user.id, updates).catch(() => { });
    }
  }

  // Check if 2FA is Enabled for user
  if (user.isTwoFactorEnabled) {
    const mfaToken = generate2FAToken({ userId: user.id });
    return {
      require2FA: true,
      mfaToken,
    };
  }

  // Standard Session Token Issuance
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
    isSubAdmin: user.isSubAdmin,
    allowedTabs: user.allowedTabs || [],
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiryDate(false);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    require2FA: false,
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Request a 4-digit verification code before registration
 * Validates uniqueness, enforces 120s cooldown, saves in Redis, and dispatches email asynchronously
 * 
 * @param {{ email: string, fullName?: string }} params
 * @returns {Promise<{ message: string, expiresInSeconds: number, cooldownSeconds: number }>}
 */
export async function sendRegistrationOtp({ email, fullName }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Prevent generating OTPs for already registered email accounts
  const existingUser = await authRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new ConflictError('An account with this email address already exists. Please sign in instead.');
  }

  // 2. Generate 4-digit numeric OTP
  const otp = generate4DigitOtp();

  // 3. Save OTP in Redis with 120s cooldown and 10-minute expiry
  const saveResult = await saveRegistrationOtp(normalizedEmail, otp);

  // 4. Dispatch Email via BullMQ (producer completes in < 5ms)
  addRegistrationOtpEmailJob({
    email: normalizedEmail,
    otp,
    fullName: fullName?.trim() || '',
    expiresInMinutes: 10,
  }).catch((err) => {
    logger.error('Failed to dispatch registration OTP email job:', err.message);
  });

  return {
    message: 'A 4-digit verification code has been sent to your email address.',
    expiresInSeconds: saveResult.expiresInSeconds,
    cooldownSeconds: saveResult.cooldownSeconds,
    ...(env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
  };
}

/**
 * Register a new regular user (by default END_USER, non-admin)
 * Strictly verifies the 4-digit email OTP before database persistence
 */
export async function signupUser({ email, password, fullName, otp }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Verify 4-digit OTP from Redis (checks brute-force limit & single-use burn)
  await verifyRegistrationOtp(normalizedEmail, otp);

  // 2. Concurrency guard: Ensure email wasn't registered in the interim
  const existingUser = await authRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new ConflictError('An account with this email address already exists.');
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await authRepository.createUser({
    email: normalizedEmail,
    passwordHash,
    fullName,
    role: 'END_USER',
  });

  // Dispatch Welcome Email Job to BullMQ Queue (Non-blocking Producer)
  addWelcomeEmailJob({ email: newUser.email, fullName: newUser.fullName }).catch((err) => {
    logger.error('Failed to dispatch welcome email BullMQ job:', err.message);
  });

  const tokenPayload = {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    isAdmin: newUser.isAdmin,
    isSuperAdmin: newUser.isSuperAdmin,
    isSubAdmin: newUser.isSubAdmin,
    allowedTabs: newUser.allowedTabs || [],
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiryDate(false);

  await authRepository.createRefreshToken({
    userId: newUser.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: sanitizeUser(newUser),
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticate existing user and check 2FA status
 */
export async function loginUser({ email, password, rememberMe = false }) {
  const user = await authRepository.findUserByEmail(email.toLowerCase());
  if (!user) {
    throw new UnauthorizedError('Invalid email address or password.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
  }

  if (!user.passwordHash || typeof user.passwordHash !== 'string') {
    throw new UnauthorizedError(
      'This account was created using Google Sign-In. Please sign in with Google, or click "Forgot Password" to set a password.'
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email address or password.');
  }

  // Check if 2FA is Enabled for user
  if (user.isTwoFactorEnabled) {
    const mfaToken = generate2FAToken({ userId: user.id });
    return {
      require2FA: true,
      mfaToken,
    };
  }

  // Standard Login (No 2FA)
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
    isSubAdmin: user.isSubAdmin,
    allowedTabs: user.allowedTabs || [],
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiryDate(rememberMe);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    require2FA: false,
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Verify 2FA TOTP or Backup Code during login challenge
 */
export async function verifyLogin2FA({ mfaToken, code }) {
  let decoded;
  try {
    decoded = verify2FAToken(mfaToken);
  } catch (error) {
    throw new UnauthorizedError('2FA session expired. Please log in again.');
  }

  const user = await authRepository.findUserById(decoded.userId);
  if (!user || !user.isTwoFactorEnabled) {
    throw new UnauthorizedError('User 2FA session is invalid or not enabled.');
  }

  // 1. Check TOTP Code via Authenticator App
  let isValid = verifyTwoFactorToken(code, user.twoFactorSecret);

  // 2. If TOTP fails, check Backup Recovery Codes
  if (!isValid && user.backupCodes?.length > 0) {
    const backupCheck = verifyBackupCode(code, user.backupCodes);
    if (backupCheck.isValid) {
      isValid = true;
      // Consume the used backup code (Single Use)
      const updatedCodes = [...user.backupCodes];
      updatedCodes.splice(backupCheck.matchingIndex, 1);
      await authRepository.updateBackupCodes(user.id, updatedCodes);
    }
  }

  if (!isValid) {
    throw new UnauthorizedError('Invalid 6-digit authenticator or backup code.');
  }

  // Issue final session tokens upon valid 2FA code
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
    isSubAdmin: user.isSubAdmin,
    allowedTabs: user.allowedTabs || [],
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiryDate(false);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Initiate 2FA Setup (Generate QR Code and Secret)
 */
export async function setup2FA(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  // Reuse existing unconfirmed secret if present to avoid overwriting scanned QR code
  let secret = user.twoFactorSecret;
  if (!secret) {
    const setupData = await generateTwoFactorSetup(user.email);
    secret = setupData.secret;
    await authRepository.saveTwoFactorSecret(userId, secret);
  }

  const { qrCodeUrl } = await generateTwoFactorSetup(user.email, secret);

  return {
    secret,
    qrCodeUrl,
  };
}

/**
 * Confirm & Enable 2FA with 6-digit TOTP verification
 */
export async function enable2FA(userId, code) {
  const user = await authRepository.findUserById(userId);
  if (!user || !user.twoFactorSecret) {
    throw new BadRequestError('2FA setup has not been initiated. Please run setup first.');
  }

  const isValid = verifyTwoFactorToken(code, user.twoFactorSecret);
  if (!isValid) {
    throw new BadRequestError('Invalid 6-digit verification code from your authenticator app.');
  }

  const { rawCodes, hashedCodes } = generateBackupCodes();
  await authRepository.enableTwoFactor(userId, hashedCodes);

  return {
    isTwoFactorEnabled: true,
    backupCodes: rawCodes,
  };
}

/**
 * Disable 2FA with mandatory re-authentication verification
 * @param {string} userId
 * @param {Object} [payload] - { password, code }
 */
export async function disable2FA(userId, { password, code } = {}) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  if (!user.isTwoFactorEnabled) {
    return { isTwoFactorEnabled: false };
  }

  let isVerified = false;

  // 1. Check TOTP Authenticator code or backup recovery code
  if (code) {
    if (user.twoFactorSecret && verifyTwoFactorToken(code, user.twoFactorSecret)) {
      isVerified = true;
    } else if (user.backupCodes?.length > 0) {
      const backupCheck = verifyBackupCode(code, user.backupCodes);
      if (backupCheck.isValid) {
        isVerified = true;
      }
    }
  }

  // 2. Check current account password
  if (!isVerified && password && user.passwordHash) {
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (isPasswordValid) {
      isVerified = true;
    }
  }

  if (!isVerified) {
    throw new UnauthorizedError(
      'Security verification failed: Incorrect password or invalid 6-digit authenticator code.'
    );
  }

  await authRepository.disableTwoFactor(userId);
  return {
    isTwoFactorEnabled: false,
  };
}

/**
 * Create SubAdmin user account (SuperAdmin Privilege only)
 */
export async function createSubAdmin({ email, password, fullName, allowedTabs = [] }) {
  const existingUser = await authRepository.findUserByEmail(email.toLowerCase());
  if (existingUser) {
    throw new ConflictError('A user with this email address already exists.');
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const subAdminUser = await authRepository.createSubAdminUser({
    email: email.toLowerCase(),
    passwordHash,
    fullName,
    allowedTabs,
  });

  return sanitizeUser(subAdminUser);
}

/**
 * List SubAdmin accounts with pagination
 */
export async function getSubAdmins(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { subAdmins, totalCount } = await authRepository.findPaginatedSubAdmins(pagination);

  const paginatedResponse = buildPaginatedResponse({
    items: subAdmins,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      subAdmins: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Retrieve activity feed and creations made by SubAdmins with summary metrics
 *
 * @param {Object} queryParams
 * @returns {Promise<Object>} { data: { items, summary }, meta }
 */
export async function getSubAdminActivity(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { subAdminId, type } = queryParams;

  // Ensure sortOrder defaults to 'desc' so latest creations always appear at the top
  const sortOrder = queryParams.sortOrder === 'asc' ? 'asc' : 'desc';

  const { items, totalCount, summary } = await authRepository.findSubAdminActivity({
    subAdminId,
    type,
    search: pagination.search,
    page: pagination.page,
    limit: pagination.limit,
    sortOrder,
  });

  const paginatedResponse = buildPaginatedResponse({
    items,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      items: paginatedResponse.data,
      summary,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * List registered end-users with pagination
 */
export async function getUsers(queryParams = {}) {
  const pagination = parsePaginationParams(queryParams);
  const { users, totalCount } = await authRepository.findPaginatedUsers(pagination);

  const paginatedResponse = buildPaginatedResponse({
    items: users,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return {
    data: {
      users: paginatedResponse.data,
    },
    meta: paginatedResponse.meta,
  };
}

/**
 * Toggle User Account Active/Deactivated Status (Admin Privilege)
 * Strictly ensures:
 * - SuperAdmin accounts can never be deactivated
 * - Only SuperAdmin can activate/deactivate SubAdmin staff accounts
 * - Users cannot deactivate their own active session
 */
export async function toggleUserActiveStatus(requestingUser, userId, isActive) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User account not found.');
  }

  // Prevent self-deactivation
  if (requestingUser?.id === userId && !isActive) {
    throw new BadRequestError('You cannot deactivate your own account.');
  }

  // SuperAdmin accounts can never be deactivated
  if (user.isSuperAdmin) {
    throw new ForbiddenError('SuperAdmin account status cannot be modified.');
  }

  // SubAdmins cannot deactivate fellow SubAdmins (SuperAdmin only privilege)
  if ((user.isSubAdmin || user.role === 'SUB_ADMIN') && !requestingUser?.isSuperAdmin) {
    throw new ForbiddenError('Access denied. Only SuperAdmin can activate or deactivate SubAdmin accounts.');
  }

  const updatedUser = await authRepository.updateUserActiveStatus(userId, isActive);

  if (!isActive) {
    // Revoke all active refresh sessions for deactivated user
    await authRepository.revokeAllUserTokens(userId).catch(() => {});
  }

  return sanitizeUser(updatedUser);
}

/**
 * Delete SubAdmin account
 */
export async function removeSubAdmin(id) {
  const user = await authRepository.findUserById(id);
  if (!user || !user.isSubAdmin) {
    throw new NotFoundError('SubAdmin account not found.');
  }
  return authRepository.deleteSubAdminUser(id);
}

/**
 * Update SubAdmin permissions & profile (SuperAdmin Privilege only)
 */
export async function updateSubAdmin(id, { fullName, email, allowedTabs }) {
  const user = await authRepository.findUserById(id);
  if (!user || !user.isSubAdmin) {
    throw new NotFoundError('SubAdmin account not found.');
  }

  const updateData = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (email !== undefined) updateData.email = email.toLowerCase();
  if (allowedTabs !== undefined) updateData.allowedTabs = allowedTabs;

  const updatedSubAdmin = await authRepository.updateSubAdminUser(id, updateData);
  return sanitizeUser(updatedSubAdmin);
}

/**
 * Rotate Refresh Token & Issue new Access Token
 */
export async function refreshSession(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token.');
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await authRepository.findRefreshToken(tokenHash);

  if (!storedToken || storedToken.revoked || new Date() > storedToken.expiresAt) {
    if (storedToken?.revoked) {
      await authRepository.revokeAllUserTokens(decoded.userId);
    }
    throw new UnauthorizedError('Refresh token revoked or expired. Please log in again.');
  }

  await authRepository.revokeRefreshToken(tokenHash);

  const user = storedToken.user;
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
    isSubAdmin: user.isSubAdmin,
    allowedTabs: user.allowedTabs || [],
  };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = getRefreshTokenExpiryDate(false);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: newTokenHash,
    expiresAt,
  });

  return {
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Revoke session on logout
 */
export async function logoutUser(refreshToken) {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await authRepository.revokeRefreshToken(tokenHash).catch(() => { });
  }
}

/**
 * Fetch authenticated user profile
 */
export async function getUserProfile(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }
  return sanitizeUser(user);
}

/**
 * Request Password Reset link
 * Generates a 64-char crypto token, stores tokenHash in DB (1-hour expiry), and dispatches reset email job
 */
export async function requestPasswordReset({ email, clientUrl }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await authRepository.findUserByEmail(normalizedEmail);

  // Return generic success message to prevent user enumeration attacks
  if (!user) {
    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  // Option 1: Restrict Sub-Admin accounts from self-service email password reset
  if (user.role === 'SUB_ADMIN' || user.isSubAdmin) {
    throw new ForbiddenError('Sub-Admin accounts cannot reset passwords via email. Please contact your Super Admin to reset your password.');
  }

  // Generate 64-character random hex token via centralized token helper
  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);

  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await authRepository.createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  // 🛡️ Security: Enforce strict whitelist to prevent Password Reset Poisoning (CWE-640)
  const allowedClientUrls = [
    env.CLIENT_URL,
    env.CLIENT_URL_PROD,
    env.CLIENT_URL_DEV,
    'https://65-0-208-238.sslip.io',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ]
    .filter(Boolean)
    .map((u) => u.replace(/\/$/, ''));

  let baseUrl = env.CLIENT_URL ? env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
  if (clientUrl && typeof clientUrl === 'string') {
    const cleanClientUrl = clientUrl.replace(/\/$/, '');
    if (allowedClientUrls.includes(cleanClientUrl)) {
      baseUrl = cleanClientUrl;
    }
  }

  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  // Dispatch password reset email job to BullMQ queue
  await addPasswordResetEmailJob({
    email: user.email,
    fullName: user.fullName,
    resetUrl,
  });

  return { message: 'If an account exists with this email, a password reset link has been sent.' };
}

/**
 * Reset User Password using valid reset token
 */
export async function resetPassword({ token, newPassword }) {
  if (!token) {
    throw new BadRequestError('Reset token is required.');
  }

  const tokenHash = hashToken(token);
  const resetTokenRecord = await authRepository.findPasswordResetToken(tokenHash);

  if (!resetTokenRecord) {
    throw new BadRequestError('Invalid or expired password reset link.');
  }

  if (resetTokenRecord.used) {
    throw new BadRequestError('This password reset link has already been used.');
  }

  if (new Date() > new Date(resetTokenRecord.expiresAt)) {
    throw new BadRequestError('Password reset link has expired. Please request a new one.');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Atomically update user password, mark reset token as used, and revoke all active sessions
  await authRepository.completePasswordReset({
    userId: resetTokenRecord.userId,
    passwordHash,
    tokenId: resetTokenRecord.id,
  });

  return { message: 'Password reset successful! You can now log in with your new password.' };
}
