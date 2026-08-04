import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../common/errors/custom-errors.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generate2FAToken,
  verify2FAToken,
  hashToken,
  verifyRefreshToken,
} from '../../common/helpers/token.helper.js';
import {
  generateTwoFactorSetup,
  verifyTwoFactorToken,
  generateBackupCodes,
  verifyBackupCode,
} from '../../common/helpers/two-factor.helper.js';
import { addWelcomeEmailJob, addPasswordResetEmailJob } from '../../queues/email.queue.js';
import * as authRepository from './auth.repository.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Authenticate or Sign Up via Google OAuth 2.0 ID Token
 */
export async function loginWithGoogle({ idToken }) {
  let payload;
  try {
    const clientId = env.GOOGLE_CLIENT_ID || '723882466133-dktl5rijt0uld6rcsbsui5oovted7jpo.apps.googleusercontent.com';
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error('❌ Google verifyIdToken error:', error?.message || error);
    throw new UnauthorizedError(`Google auth error: ${error?.message || 'Invalid token'}`);
  }

  if (!payload || !payload.email) {
    throw new UnauthorizedError('Unable to retrieve valid profile data from Google account.');
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
    addWelcomeEmailJob({ email: user.email, fullName: user.fullName }).catch(() => {});
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
      await authRepository.updateUserProfile(user.id, updates).catch(() => {});
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
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const { passwordHash: _, twoFactorSecret: __, backupCodes: ___, ...safeUser } = user;

  return {
    require2FA: false,
    user: safeUser,
    accessToken,
    refreshToken,
  };
}

/**
 * Register a new regular user (by default END_USER, non-admin)
 */
export async function signupUser({ email, password, fullName }) {
  const existingUser = await authRepository.findUserByEmail(email.toLowerCase());
  if (existingUser) {
    throw new ConflictError('A user with this email address already exists.');
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await authRepository.createUser({
    email: email.toLowerCase(),
    passwordHash,
    fullName,
    role: 'END_USER',
  });

  // Dispatch Welcome Email Job to BullMQ Queue (Non-blocking Producer)
  addWelcomeEmailJob({ email: newUser.email, fullName: newUser.fullName }).catch((err) => {
    console.error('Failed to dispatch welcome email BullMQ job:', err.message);
  });

  const tokenPayload = {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    isAdmin: newUser.isAdmin,
    isSuperAdmin: newUser.isSuperAdmin,
    isSubAdmin: newUser.isSubAdmin,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await authRepository.createRefreshToken({
    userId: newUser.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: newUser,
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticate existing user and check 2FA status
 */
export async function loginUser({ email, password }) {
  const user = await authRepository.findUserByEmail(email.toLowerCase());
  if (!user) {
    throw new UnauthorizedError('Invalid email address or password.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
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
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const { passwordHash: _, twoFactorSecret: __, backupCodes: ___, ...safeUser } = user;

  return {
    require2FA: false,
    user: safeUser,
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
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const { passwordHash: _, twoFactorSecret: __, backupCodes: ___, ...safeUser } = user;

  return {
    user: safeUser,
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
 * Disable 2FA
 */
export async function disable2FA(userId) {
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

  return subAdminUser;
}

/**
 * List all SubAdmin accounts
 */
export async function getSubAdmins() {
  return authRepository.findAllSubAdmins();
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
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
    isSubAdmin: user.isSubAdmin,
  };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: newTokenHash,
    expiresAt,
  });

  const { passwordHash: _, twoFactorSecret: __, backupCodes: ___, ...safeUser } = user;

  return {
    user: safeUser,
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
    await authRepository.revokeRefreshToken(tokenHash).catch(() => {});
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
  const { passwordHash: _, twoFactorSecret: __, backupCodes: ___, ...safeUser } = user;
  return safeUser;
}

/**
 * Request Password Reset link
 * Generates a 64-char crypto token, stores tokenHash in DB (1-hour expiry), and dispatches reset email job
 */
export async function requestPasswordReset({ email }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await authRepository.findUserByEmail(normalizedEmail);

  // Return generic success message to prevent user enumeration attacks
  if (!user) {
    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  // Generate 64-character random hex token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await authRepository.createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

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

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
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

  // Update user password & mark reset token as used
  await authRepository.updateUserPassword(resetTokenRecord.userId, passwordHash);
  await authRepository.markResetTokenUsed(resetTokenRecord.id);

  // Revoke all existing refresh sessions for security
  await authRepository.revokeAllUserTokens(resetTokenRecord.userId).catch(() => {});

  return { message: 'Password reset successful! You can now log in with your new password.' };
}
