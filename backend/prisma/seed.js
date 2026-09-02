import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seeds/admin.seed.js';
import { seedCategories } from './seeds/categories.seed.js';
import { seedFestivals } from './seeds/festivals.seed.js';
import { seedDesignStyles } from './seeds/designStyles.seed.js';
import { seedFrames } from './seeds/frames.seed.js';
import { seedTemplates } from './seeds/templates.seed.js';
import { seedTemplateCategories } from './seeds/templateCategories.seed.js';

const prisma = new PrismaClient();

async function main() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🌱 Starting database seeding pipeline [Environment: ${env}]...`);

  // 1. Seed SuperAdmin User (Reads from env or safe default)
  await seedAdmin(prisma);

  // 2. Seed Master Business Categories
  await seedCategories(prisma);

  // 3. Seed Master Annual Festivals
  await seedFestivals(prisma);

  // 4. Seed Master Design Styles & Color Palettes
  await seedDesignStyles(prisma);

  // 5. Seed Master Template Categories
  await seedTemplateCategories(prisma);

  // 6. Seed Master Preset Frames
  await seedFrames(prisma);

  // 7. Seed Master Default Templates
  await seedTemplates(prisma);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

