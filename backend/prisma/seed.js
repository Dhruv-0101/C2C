import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seeds/admin.seed.js';
import { seedCategories } from './seeds/categories.seed.js';
import { seedFestivals } from './seeds/festivals.seed.js';
import { seedDesignStyles } from './seeds/designStyles.seed.js';
import { seedFrames } from './seeds/frames.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding pipeline...');

  // 1. Seed SuperAdmin User
  await seedAdmin(prisma);

  // 2. Seed Master Business Categories
  await seedCategories(prisma);

  // 3. Seed Master Annual Festivals
  await seedFestivals(prisma);

  // 4. Seed Master Design Styles & Color Palettes
  await seedDesignStyles(prisma);

  // 5. Seed Master Preset Frames
  await seedFrames();

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
