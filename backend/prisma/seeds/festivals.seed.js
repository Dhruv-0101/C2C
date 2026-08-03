export const DEFAULT_FESTIVALS = [
  {
    name: "New Year's Day",
    slug: 'new-years-day-2026',
    date: '2026-01-01',
    description: 'Kickstart new year promotions and resolutions.',
  },
  {
    name: 'Republic Day',
    slug: 'republic-day-2026',
    date: '2026-01-26',
    description: 'National pride offers and patriotic campaigns.',
  },
  {
    name: 'Holi - Festival of Colors',
    slug: 'holi-2026',
    date: '2026-03-04',
    description: 'Vibrant color graphics and festive discounts.',
  },
  {
    name: "International Women's Day",
    slug: 'womens-day-2026',
    date: '2026-03-08',
    description: 'Celebrate women empowerment & exclusive offers.',
  },
  {
    name: "National Doctor's Day",
    slug: 'doctors-day-2026',
    date: '2026-07-01',
    description: 'Tribute to healthcare professionals & wellness offers.',
  },
  {
    name: 'Independence Day',
    slug: 'independence-day-2026',
    date: '2026-08-15',
    description: 'Freedom sale campaigns & patriotic greetings.',
  },
  {
    name: 'Gandhi Jayanti',
    slug: 'gandhi-jayanti-2026',
    date: '2026-10-02',
    description: 'Tribute to Mahatma Gandhi & peace messages.',
  },
  {
    name: 'Dussehra / Vijayadashami',
    slug: 'dussehra-2026',
    date: '2026-10-20',
    description: 'Victory of good over evil promotional offers.',
  },
  {
    name: 'Diwali - Festival of Lights',
    slug: 'diwali-2026',
    date: '2026-11-08',
    description: 'Bumper festival sales, gifting & festive wishes.',
  },
  {
    name: 'Christmas Day',
    slug: 'christmas-2026',
    date: '2026-12-25',
    description: 'Year-end holiday deals & Christmas greetings.',
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
      },
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
}
