import bcrypt from 'bcryptjs';

export const ADMIN_CONFIG = {
  email: 'admin1@gmail.com',
  password: 'admin1',
  fullName: 'admin1',
};

/**
 * Seed Default System SuperAdmin Account
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedAdmin(prisma) {
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_CONFIG.email },
  });

  const passwordHash = await bcrypt.hash(ADMIN_CONFIG.password, 12);

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_CONFIG.email },
      data: {
        role: 'ADMIN',
        isAdmin: true,
        isSuperAdmin: true,
        isSubAdmin: false,
      },
    });
    console.log(`✅ Existing user updated to SuperAdmin: ${ADMIN_CONFIG.email}`);
  } else {
    await prisma.user.create({
      data: {
        email: ADMIN_CONFIG.email,
        passwordHash,
        fullName: ADMIN_CONFIG.fullName,
        role: 'ADMIN',
        isAdmin: true,
        isSuperAdmin: true,
        isSubAdmin: false,
        allowedTabs: ['all'],
      },
    });
    console.log(`🚀 Created SuperAdmin account: ${ADMIN_CONFIG.email} / ${ADMIN_CONFIG.password}`);
  }
}
