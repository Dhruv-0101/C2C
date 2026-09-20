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
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          totalPostsAllowed: true,
          postsUsed: true,
          bonusPostsAllowed: true,
          bonusPostsUsed: true,
          pricePaid: true,
          currency: true,
          paymentGateway: true,
          paymentId: true,
          orderId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      brandKit: {
        select: {
          businessName: true,
          phone: true,
          city: true,
          state: true,
          country: true,
        },
      },
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

export async function updateUserActiveStatus(userId, isActive) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      email: true,
      fullName: true,
      isActive: true,
    },
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

export async function updateSubAdminUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
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
      _count: {
        select: {
          templatesCreated: true,
          festivalsCreated: true,
          categoriesCreated: true,
          framesCreated: true,
        },
      },
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
    _count: {
      select: {
        templatesCreated: true,
        festivalsCreated: true,
        categoriesCreated: true,
        framesCreated: true,
      },
    },
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
    subscription: {
      select: {
        id: true,
        plan: true,
        status: true,
        totalPostsAllowed: true,
        postsUsed: true,
        bonusPostsAllowed: true,
        bonusPostsUsed: true,
        pricePaid: true,
        currency: true,
        paymentGateway: true,
        paymentId: true,
        orderId: true,
        updatedAt: true,
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

/**
 * Atomically update password, invalidate reset token, and revoke all active refresh sessions
 */
export async function completePasswordReset({ userId, passwordHash, tokenId }) {
  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { used: true },
    }),
    prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    }),
  ]);
}

/**
 * Audit and fetch creations made by SubAdmins across Templates, Frames, Festivals, and Categories
 *
 * @param {Object} params
 * @param {string} [params.subAdminId] - Optional specific SubAdmin user UUID
 * @param {string} [params.type='all'] - 'all' | 'template' | 'frame' | 'festival' | 'category'
 * @param {string} [params.search] - Search keyword matching title or name
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {string} [params.sortOrder='desc']
 * @returns {Promise<Object>} Formatted activity feed with summary stats and pagination
 */
export async function findSubAdminActivity({
  subAdminId,
  type = 'all',
  search,
  page = 1,
  limit = 20,
  sortOrder = 'desc',
}) {
  const skip = (page - 1) * limit;

  // 1. Fetch all SubAdmins to establish creator list and individual stats
  const subAdmins = await prisma.user.findMany({
    where: { isSubAdmin: true },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          templatesCreated: true,
          festivalsCreated: true,
          categoriesCreated: true,
          framesCreated: true,
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  const allSubAdminIds = subAdmins.map((s) => s.id);
  const targetCreatorIds = subAdminId ? [subAdminId] : allSubAdminIds;

  // If there are no SubAdmins registered yet and no explicit subAdminId, return early
  if (targetCreatorIds.length === 0) {
    return {
      items: [],
      totalCount: 0,
      summary: {
        totalCreations: 0,
        byType: { templates: 0, frames: 0, festivals: 0, categories: 0 },
        subAdmins: [],
      },
    };
  }

  // Common creator projection
  const creatorSelect = {
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  };

  // Base where filters
  const templateWhere = {
    createdBy: { in: targetCreatorIds },
    ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
  };
  const frameWhere = {
    createdBy: { in: targetCreatorIds },
    ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
  };
  const festivalWhere = {
    createdBy: { in: targetCreatorIds },
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };
  const categoryWhere = {
    createdBy: { in: targetCreatorIds },
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  // Compute counts
  const [templatesCount, framesCount, festivalsCount, categoriesCount] = await Promise.all([
    prisma.template.count({ where: templateWhere }),
    prisma.frame.count({ where: frameWhere }),
    prisma.festival.count({ where: festivalWhere }),
    prisma.category.count({ where: categoryWhere }),
  ]);

  let items = [];
  let totalCount = 0;

  if (type === 'template') {
    totalCount = templatesCount;
    const records = await prisma.template.findMany({
      where: templateWhere,
      include: { creator: creatorSelect, templateCategory: true },
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
    });
    items = records.map((item) => ({
      id: item.id,
      itemType: 'template',
      title: item.title,
      description: item.description,
      subtitle: item.templateCategory?.name || 'Graphic Template',
      previewUrl: item.baseImageUrl,
      eventDate: null,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      creator: item.creator,
    }));
  } else if (type === 'frame') {
    totalCount = framesCount;
    const records = await prisma.frame.findMany({
      where: frameWhere,
      include: { creator: creatorSelect },
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
    });
    items = records.map((item) => ({
      id: item.id,
      itemType: 'frame',
      title: item.title,
      description: item.description,
      subtitle: 'Brand Frame Overlay',
      previewUrl: item.previewUrl || item.overlayPngUrl,
      eventDate: null,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      creator: item.creator,
    }));
  } else if (type === 'festival') {
    totalCount = festivalsCount;
    const records = await prisma.festival.findMany({
      where: festivalWhere,
      include: { creator: creatorSelect },
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
    });
    items = records.map((item) => ({
      id: item.id,
      itemType: 'festival',
      title: item.name,
      description: item.description,
      subtitle: item.targetRegion || 'National Observance',
      previewUrl: item.bannerUrl,
      eventDate: item.date,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      creator: item.creator,
    }));
  } else if (type === 'category') {
    totalCount = categoriesCount;
    const records = await prisma.category.findMany({
      where: categoryWhere,
      include: { creator: creatorSelect },
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
    });
    items = records.map((item) => ({
      id: item.id,
      itemType: 'category',
      title: item.name,
      description: item.description,
      subtitle: `Slug: /${item.slug}`,
      previewUrl: null,
      eventDate: null,
      isActive: true,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      creator: item.creator,
    }));
  } else {
    // type === 'all'
    totalCount = templatesCount + framesCount + festivalsCount + categoriesCount;

    // Fetch up to (skip + limit) from each category to ensure accurate sorting across models
    const fetchLimit = skip + limit;
    const [templates, frames, festivals, categories] = await Promise.all([
      prisma.template.findMany({
        where: templateWhere,
        include: { creator: creatorSelect, templateCategory: true },
        take: fetchLimit,
        orderBy: { createdAt: sortOrder },
      }),
      prisma.frame.findMany({
        where: frameWhere,
        include: { creator: creatorSelect },
        take: fetchLimit,
        orderBy: { createdAt: sortOrder },
      }),
      prisma.festival.findMany({
        where: festivalWhere,
        include: { creator: creatorSelect },
        take: fetchLimit,
        orderBy: { createdAt: sortOrder },
      }),
      prisma.category.findMany({
        where: categoryWhere,
        include: { creator: creatorSelect },
        take: fetchLimit,
        orderBy: { createdAt: sortOrder },
      }),
    ]);

    const unifiedList = [
      ...templates.map((item) => ({
        id: item.id,
        itemType: 'template',
        title: item.title,
        description: item.description,
        subtitle: item.templateCategory?.name || 'Graphic Template',
        previewUrl: item.baseImageUrl,
        eventDate: null,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        creator: item.creator,
      })),
      ...frames.map((item) => ({
        id: item.id,
        itemType: 'frame',
        title: item.title,
        description: item.description,
        subtitle: 'Brand Frame Overlay',
        previewUrl: item.previewUrl || item.overlayPngUrl,
        eventDate: null,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        creator: item.creator,
      })),
      ...festivals.map((item) => ({
        id: item.id,
        itemType: 'festival',
        title: item.name,
        description: item.description,
        subtitle: item.targetRegion || 'National Observance',
        previewUrl: item.bannerUrl,
        eventDate: item.date,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        creator: item.creator,
      })),
      ...categories.map((item) => ({
        id: item.id,
        itemType: 'category',
        title: item.name,
        description: item.description,
        subtitle: `Slug: /${item.slug}`,
        previewUrl: null,
        eventDate: null,
        isActive: true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        creator: item.creator,
      })),
    ];

    // Sort unified items
    unifiedList.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    items = unifiedList.slice(skip, skip + limit);
  }

  return {
    items,
    totalCount,
    summary: {
      totalCreations: templatesCount + framesCount + festivalsCount + categoriesCount,
      byType: {
        templates: templatesCount,
        frames: framesCount,
        festivals: festivalsCount,
        categories: categoriesCount,
      },
      subAdmins: subAdmins.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        email: s.email,
        avatarUrl: s.avatarUrl,
        role: s.role,
        isActive: s.isActive,
        counts: {
          templates: s._count.templatesCreated,
          frames: s._count.framesCreated,
          festivals: s._count.festivalsCreated,
          categories: s._count.categoriesCreated,
          total:
            s._count.templatesCreated +
            s._count.framesCreated +
            s._count.festivalsCreated +
            s._count.categoriesCreated,
        },
      })),
    },
  };
}
