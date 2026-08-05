import { prisma } from '../../config/database.js';

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isAdmin: true,
      isSuperAdmin: true,
      isSubAdmin: true,
      allowedTabs: true,
      isTwoFactorEnabled: true,
      twoFactorSecret: true,
      backupCodes: true,
      isGoogleRegistered: true,
      googleId: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function saveTwoFactorSecret(userId, secret) {
  return prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });
}

export async function enableTwoFactor(userId, backupCodes) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isTwoFactorEnabled: true,
      backupCodes,
    },
  });
}

export async function disableTwoFactor(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isTwoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
    },
  });
}

export async function updateBackupCodes(userId, backupCodes) {
  return prisma.user.update({
    where: { id: userId },
    data: { backupCodes },
  });
}

export async function createUser({
  email,
  passwordHash = null,
  fullName,
  avatarUrl = null,
  googleId = null,
  isGoogleRegistered = false,
  role = 'END_USER',
}) {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      avatarUrl,
      googleId,
      isGoogleRegistered,
      role,
      isAdmin: false,
      isSuperAdmin: false,
      isSubAdmin: false,
      allowedTabs: [],
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      googleId: true,
      isGoogleRegistered: true,
      role: true,
      isAdmin: true,
      isSuperAdmin: true,
      isSubAdmin: true,
      allowedTabs: true,
      createdAt: true,
    },
  });
}

export async function updateUserProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function createSubAdminUser({ email, passwordHash, fullName, allowedTabs = [] }) {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: 'SUB_ADMIN',
      isAdmin: true,
      isSuperAdmin: false,
      isSubAdmin: true,
      allowedTabs,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isAdmin: true,
      isSuperAdmin: false,
      isSubAdmin: true,
      allowedTabs: true,
      createdAt: true,
    },
  });
}

export async function findAllSubAdmins() {
  return prisma.user.findMany({
    where: { isSubAdmin: true },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isAdmin: true,
      isSuperAdmin: true,
      isSubAdmin: true,
      allowedTabs: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findPaginatedSubAdmins({ skip, take, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
  const where = { isSubAdmin: true };

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const allowedSortFields = ['createdAt', 'fullName', 'email'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const select = {
    id: true,
    email: true,
    fullName: true,
    role: true,
    isAdmin: true,
    isSuperAdmin: true,
    isSubAdmin: true,
    allowedTabs: true,
    isActive: true,
    createdAt: true,
  };

  const [subAdmins, totalCount] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      select,
      orderBy: { [validSortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return { subAdmins, totalCount };
}

export async function findPaginatedUsers({ skip, take, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
  const where = { role: 'END_USER' };

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const allowedSortFields = ['createdAt', 'fullName', 'email'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const select = {
    id: true,
    email: true,
    fullName: true,
    role: true,
    avatarUrl: true,
    isActive: true,
    createdAt: true,
    brandKit: {
      select: {
        businessName: true,
        phone: true,
        city: true,
        country: true,
      },
    },
  };

  const [users, totalCount] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      select,
      orderBy: { [validSortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, totalCount };
}

export async function deleteSubAdminUser(id) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function createRefreshToken({ userId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

export async function findRefreshToken(tokenHash) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

export async function revokeRefreshToken(tokenHash) {
  return prisma.refreshToken.update({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function revokeAllUserTokens(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

export async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  return prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

export async function findPasswordResetToken(tokenHash) {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

export async function markResetTokenUsed(id) {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { used: true },
  });
}

export async function updateUserPassword(userId, passwordHash) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
