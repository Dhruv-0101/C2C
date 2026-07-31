import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
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

const DEFAULT_FESTIVALS = [
  { name: "New Year's Day", slug: 'new-years-day-2026', date: '2026-01-01', description: 'Kickstart new year promotions and resolutions.' },
  { name: 'Republic Day', slug: 'republic-day-2026', date: '2026-01-26', description: 'National pride offers and patriotic campaigns.' },
  { name: 'Holi - Festival of Colors', slug: 'holi-2026', date: '2026-03-04', description: 'Vibrant color graphics and festive discounts.' },
  { name: "International Women's Day", slug: 'womens-day-2026', date: '2026-03-08', description: 'Celebrate women empowerment & exclusive offers.' },
  { name: "National Doctor's Day", slug: 'doctors-day-2026', date: '2026-07-01', description: 'Tribute to healthcare professionals & wellness offers.' },
  { name: 'Independence Day', slug: 'independence-day-2026', date: '2026-08-15', description: 'Freedom sale campaigns & patriotic greetings.' },
  { name: 'Gandhi Jayanti', slug: 'gandhi-jayanti-2026', date: '2026-10-02', description: 'Tribute to Mahatma Gandhi & peace messages.' },
  { name: 'Dussehra / Vijayadashami', slug: 'dussehra-2026', date: '2026-10-20', description: 'Victory of good over evil promotional offers.' },
  { name: 'Diwali - Festival of Lights', slug: 'diwali-2026', date: '2026-11-08', description: 'Bumper festival sales, gifting & festive wishes.' },
  { name: 'Christmas Day', slug: 'christmas-2026', date: '2026-12-25', description: 'Year-end holiday deals & Christmas greetings.' },
];

const DEFAULT_DESIGN_STYLES = [
  {
    name: 'Royal Festive Gold',
    slug: 'royal-festive-gold',
    description: 'Luxurious marigold gold and teal gradient blend for celebrations and high-end offers.',
    primaryColor: '#F59E0B',
    secondaryColor: '#0D9488',
    accentColor: '#EC4899',
    backgroundColor: '#0B0F17',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)',
    fontHeader: 'Space Grotesk',
    fontBody: 'Plus Jakarta Sans',
    colors: ['#F59E0B', '#0D9488', '#EC4899', '#8B5CF6'],
  },
  {
    name: 'Neon Cyberpunk',
    slug: 'neon-cyberpunk',
    description: 'Vibrant neon blue and magenta contrast palette for modern tech & nightlife graphics.',
    primaryColor: '#00F0FF',
    secondaryColor: '#FF007A',
    accentColor: '#7000FF',
    backgroundColor: '#05050A',
    gradient: 'linear-gradient(135deg, #00F0FF 0%, #FF007A 100%)',
    fontHeader: 'Outfit',
    fontBody: 'Inter',
    colors: ['#00F0FF', '#FF007A', '#7000FF'],
  },
  {
    name: 'Corporate Sleek',
    slug: 'corporate-sleek',
    description: 'Professional royal blue and slate styling for B2B, real estate, and financial promotions.',
    primaryColor: '#2563EB',
    secondaryColor: '#1E293B',
    accentColor: '#3B82F6',
    backgroundColor: '#0F172A',
    gradient: 'linear-gradient(135deg, #1E293B 0%, #2563EB 100%)',
    fontHeader: 'Roboto',
    fontBody: 'Inter',
    colors: ['#2563EB', '#1E293B', '#3B82F6'],
  },
  {
    name: 'Minimalist Pastel',
    slug: 'minimalist-pastel',
    description: 'Soft pastel pink and sky blue tones for wellness, salons, and lifestyle branding.',
    primaryColor: '#F472B6',
    secondaryColor: '#38BDF8',
    accentColor: '#A78BFA',
    backgroundColor: '#18181B',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #38BDF8 100%)',
    fontHeader: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
    colors: ['#F472B6', '#38BDF8', '#A78BFA'],
  },
];

async function main() {
  const superAdminEmail = 'superadmin@brandflow.com';
  const superAdminPassword = 'SuperAdmin123!';
  const fullName = 'System SuperAdmin';

  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  if (existing) {
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        role: 'ADMIN',
        isAdmin: true,
        isSuperAdmin: true,
        isSubAdmin: false,
      },
    });
    console.log(`✅ Existing user updated to SuperAdmin: ${superAdminEmail}`);
  } else {
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        fullName,
        role: 'ADMIN',
        isAdmin: true,
        isSuperAdmin: true,
        isSubAdmin: false,
        allowedTabs: ['all'],
      },
    });
    console.log(`🚀 Created SuperAdmin account: ${superAdminEmail} / ${superAdminPassword}`);
  }

  // Seed Default Master Categories
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

  // Seed Default Annual Festivals
  for (const fest of DEFAULT_FESTIVALS) {
    await prisma.festival.upsert({
      where: { slug: fest.slug },
      update: { name: fest.name, date: new Date(fest.date), description: fest.description },
      create: {
        name: fest.name,
        slug: fest.slug,
        date: new Date(fest.date),
        description: fest.description,
        targetRegion: 'India',
        isActive: true,
      },
    });
  }
  console.log(`🎉 Default Master Festivals & Special Days seeded (${DEFAULT_FESTIVALS.length} festivals).`);

  // Seed Default Master Design Styles
  for (const style of DEFAULT_DESIGN_STYLES) {
    await prisma.designStyle.upsert({
      where: { slug: style.slug },
      update: {
        name: style.name,
        description: style.description,
        primaryColor: style.primaryColor,
        secondaryColor: style.secondaryColor,
        accentColor: style.accentColor,
        backgroundColor: style.backgroundColor,
        gradient: style.gradient,
        fontHeader: style.fontHeader,
        fontBody: style.fontBody,
        colors: style.colors,
      },
      create: {
        name: style.name,
        slug: style.slug,
        description: style.description,
        primaryColor: style.primaryColor,
        secondaryColor: style.secondaryColor,
        accentColor: style.accentColor,
        backgroundColor: style.backgroundColor,
        gradient: style.gradient,
        fontHeader: style.fontHeader,
        fontBody: style.fontBody,
        colors: style.colors,
        isSystem: true,
      },
    });
  }
  console.log(`🎨 Default Master Design Styles & Color Palettes seeded (${DEFAULT_DESIGN_STYLES.length} styles).`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
