export const DEFAULT_FESTIVALS = [
  {
    name: 'Ganesh Chaturthi',
    slug: 'ganesh-chaturthi-2026',
    date: '2026-09-14',
    description: 'Lord Ganesha festive greetings and special promotional offers.',
    bannerUrl: 'https://images.unsplash.com/photo-1631548674996-5e04cb2a7bc7?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Gandhi Jayanti',
    slug: 'gandhi-jayanti-2026',
    date: '2026-10-02',
    description: 'Tribute to Mahatma Gandhi, peace messages & khadi offers.',
    bannerUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Navratri & Durga Puja',
    slug: 'navratri-2026',
    date: '2026-10-11',
    description: 'Vibrant Garba night specials & 9-day festive deals.',
    bannerUrl: 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Dussehra / Vijayadashami',
    slug: 'dussehra-2026',
    date: '2026-10-20',
    description: 'Victory of good over evil promotional sales and discounts.',
    bannerUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Diwali - Festival of Lights',
    slug: 'diwali-2026',
    date: '2026-11-08',
    description: 'Bumper festival sales, gifting offers & Diwali greetings.',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: "Children's Day & Bhai Dooj",
    slug: 'bhai-dooj-2026',
    date: '2026-11-14',
    description: 'Family festive greetings & special gift box promotions.',
    bannerUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Christmas Celebration',
    slug: 'christmas-2026',
    date: '2026-12-25',
    description: 'Year-end holiday mega deals & Christmas greetings.',
    bannerUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: "New Year's Day 2027",
    slug: 'new-years-day-2027',
    date: '2027-01-01',
    description: 'Kickstart 2027 with early bird offers and new launches.',
    bannerUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=800&auto=format&fit=crop',
  },
];

/**
 * Seed Master Annual Festivals & Special Days
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedFestivals(prisma) {
  for (const fest of DEFAULT_FESTIVALS) {
    await prisma.festival.upsert({
      where: { slug: fest.slug },
      update: {
        name: fest.name,
        date: new Date(fest.date),
        description: fest.description,
        bannerUrl: fest.bannerUrl,
      },
      create: {
        name: fest.name,
        slug: fest.slug,
        date: new Date(fest.date),
        description: fest.description,
        bannerUrl: fest.bannerUrl,
        targetRegion: 'India',
        isActive: true,
      },
    });
  }
  console.log(`🎉 Default Master Festivals & Special Days seeded (${DEFAULT_FESTIVALS.length} upcoming festivals).`);
}
