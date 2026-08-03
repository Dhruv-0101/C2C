export const DEFAULT_CATEGORIES = [
  { name: 'Restaurant', slug: 'restaurant' },
  { name: 'Gym & Fitness', slug: 'gym-fitness' },
  { name: 'Salon & Spa', slug: 'salon-spa' },
  { name: 'Medical & Clinic', slug: 'medical-clinic' },
  { name: 'Jewellery', slug: 'jewellery' },
  { name: 'Clothing & Fashion', slug: 'clothing-fashion' },
  { name: 'Real Estate', slug: 'real-estate' },
  { name: 'School & Education', slug: 'school-education' },
  { name: 'Travel & Tourism', slug: 'travel-tourism' },
  { name: 'Electronics', slug: 'electronics' },
];

/**
 * Seed Master Business Categories
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedCategories(prisma) {
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug: cat.slug,
        isSystem: true,
      },
    });
  }
  console.log(`🏷️ Default Master Business Categories seeded (${DEFAULT_CATEGORIES.length} categories).`);
}
