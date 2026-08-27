/**
 * Seed Default Master Template Categories into TemplateCategory table
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedTemplateCategories(prisma) {
  console.log('🏷️ Seeding Master Default Template Categories...');

  const categories = [
    { name: 'Festival & Special Days', icon: '🎭', isSystem: true, description: 'Festivals, national days, and seasonal celebrations.' },
    { name: 'Promotional & Offers', icon: '🏷️', isSystem: true, description: 'Discounts, sales, vouchers, and mega deals.' },
    { name: 'Birthday & Anniversary', icon: '🎂', isSystem: true, description: 'Client & employee birthday and work anniversary greetings.' },
    { name: 'Personal Milestones', icon: '🎉', isSystem: true, description: 'Awards, achievements, and milestone wishes.' },
    { name: 'Business Operations', icon: '🏢', isSystem: true, description: 'Opening hours, holiday notices, and business updates.' },
    { name: 'We Are Hiring', icon: '💼', isSystem: true, description: 'Job openings, hiring banners, and recruitment posts.' },
    { name: 'Customer Reviews', icon: '⭐', isSystem: true, description: 'Client testimonials, ratings, and social proof.' },
    { name: 'Product Launches', icon: '🚀', isSystem: true, description: 'New arrivals, product teasers, and releases.' },
    { name: 'National Days', icon: '🇮🇳', isSystem: true, description: 'Independence Day, Republic Day, and national leader tributes.' },
    { name: 'Motivation & Tips', icon: '💡', isSystem: true, description: 'Daily motivation, business quotes, and pro tips.' },
    { name: 'Healthcare & Wellness', icon: '🏥', isSystem: true, description: 'Medical camps, health tips, and wellness drives.' },
    { name: 'Education & Coaching', icon: '🎓', isSystem: true, description: 'Admissions open, exam wishes, and academy banners.' },
    { name: 'General Business', icon: '🎨', isSystem: true, description: 'Versatile background templates for all business types.' },
  ];

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    await prisma.templateCategory.upsert({
      where: { slug },
      update: cat,
      create: {
        ...cat,
        slug,
      },
    });
  }

  console.log(`✅ Seeded ${categories.length} master default template categories.`);
}
