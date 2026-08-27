/**
 * Seed Master Default Templates linked to Festivals & Categories
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedTemplates(prisma) {
  console.log('🎨 Seeding Master Default Templates linked to Festivals & Categories...');

  const festivals = await prisma.festival.findMany();
  const festivalMap = new Map(festivals.map((f) => [f.slug, f.id]));

  const templatesData = [
    {
      id: 'template-ganesh-chaturthi-2026',
      title: 'Ganesh Chaturthi Festive Greetings',
      description: 'Vibrant Lord Ganesha celebration template for festive greetings & offers.',
      category: 'FESTIVAL',
      festivalId: festivalMap.get('ganesh-chaturthi-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1631548674996-5e04cb2a7bc7?q=80&w=800&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },
    {
      id: 'template-navratri-2026',
      title: 'Navratri Special Garba Offer',
      description: 'Colorful Navratri Garba night special discount & pass template.',
      category: 'FESTIVAL',
      festivalId: festivalMap.get('navratri-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=800&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },
    {
      id: 'template-dussehra-2026',
      title: 'Dussehra Victory Sale 40% OFF',
      description: 'Vijayadashami festival promotional discount banner.',
      category: 'OFFER',
      festivalId: festivalMap.get('dussehra-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=800&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },
    {
      id: 'template-diwali-2026',
      title: 'Diwali Bumper Festival Offer',
      description: 'Bright festive background with golden lamps for Diwali sale & greetings.',
      category: 'OFFER',
      festivalId: festivalMap.get('diwali-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },
    {
      id: 'template-birthday-wishes',
      title: 'Happy Birthday & Celebration Wishes',
      description: 'Elegant confetti celebration background for client & employee birthday wishes.',
      category: 'BIRTHDAY',
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },
    {
      id: 'template-we-are-hiring',
      title: 'We Are Hiring Recruitment Banner',
      description: 'Modern corporate job vacancy & hiring announcement template.',
      category: 'HIRING',
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },
    {
      id: 'template-monday-motivation',
      title: 'Monday Motivation & Inspirational Quote',
      description: 'Sleek dark gradient background for daily motivational business quotes.',
      category: 'MOTIVATION',
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },
  ];

  for (const tpl of templatesData) {
    await prisma.template.upsert({
      where: { id: tpl.id },
      update: {
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        festivalId: tpl.festivalId,
        baseImageUrl: tpl.baseImageUrl,
        isCustomUpload: tpl.isCustomUpload,
        isActive: tpl.isActive,
      },
      create: tpl,
    });
  }

  console.log(`✅ Seeded ${templatesData.length} master default templates with categories.`);
}
