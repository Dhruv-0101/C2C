import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';

/**
 * 🚨 BREAK-GLASS DISASTER RECOVERY SCRIPT: Super Admin Password Reset CLI
 * 
 * Usage:
 *   npm run admin:reset-password -- --email=admin@brandflow.com --password=NewPassword123!
 *   OR
 *   node src/scripts/resetAdminPassword.js --email=admin@brandflow.com --password=NewPassword123!
 */
async function resetAdminPassword() {
  const args = process.argv.slice(2);
  let email = null;
  let password = null;

  args.forEach((arg) => {
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1]?.trim();
    } else if (arg.startsWith('--password=')) {
      password = arg.split('=')[1]?.trim();
    }
  });

  if (!email || !password) {
    console.error(`
❌ Usage Error: Missing required arguments.

Please run the script with both --email and --password parameters:
  npm run admin:reset-password -- --email=admin@brandflow.com --password=YourNewPassword123!

Example:
  node src/scripts/resetAdminPassword.js --email=admin@brandflow.com --password=SuperSecretPassword2026!
    `);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters long.');
    process.exit(1);
  }

  console.log(`🔍 Searching for account with email: "${email}"...`);
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    console.error(`❌ User with email "${email}" was not found in the database.`);
    process.exit(1);
  }

  console.log(`🔐 Hashing new password for user [ID: ${user.id}, Role: ${user.role}]...`);
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Revoke all existing refresh sessions for security
  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { revoked: true },
  });

  console.log(`
✅ SUCCESS! Password for user "${user.email}" [Role: ${user.role}] has been updated.
🔒 All existing refresh sessions have been revoked.
🔑 You can now log into the BrandFlow dashboard with your new password.
  `);

  await prisma.$disconnect();
  process.exit(0);
}

resetAdminPassword().catch(async (error) => {
  console.error('❌ Unexpected Error in password reset script:', error);
  await prisma.$disconnect();
  process.exit(1);
});
