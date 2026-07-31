import bcrypt from 'bcryptjs';
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
import { addWelcomeEmailJob } from '../../queues/email.queue.js';
import * as authRepository from './auth.repository.js';

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
