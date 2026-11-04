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

// Allow running directly via CLI: `node prisma/seeds/admin.seed.js`
if (process.argv[1]?.endsWith('admin.seed.js')) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  seedAdmin(prisma)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error executing admin seed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
