import bcrypt from 'bcryptjs';

/**
 * Seed Default System SuperAdmin Account from Environment Variables
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedAdmin(prisma) {
  const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin1@gmail.com').toLowerCase().trim();
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin1';
  const fullName = process.env.INITIAL_ADMIN_NAME || 'Super Admin';

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      isAdmin: true,
      isSuperAdmin: true,
      isSubAdmin: false,
    },
    create: {
      email,
      passwordHash,
      fullName,
      role: 'ADMIN',
      isAdmin: true,
      isSuperAdmin: true,
      isSubAdmin: false,
      allowedTabs: ['all'],
    },
  });

  console.log(`🚀 SuperAdmin account verified/created from .env: ${adminUser.email}`);
}

