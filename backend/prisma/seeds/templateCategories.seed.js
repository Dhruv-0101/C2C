/**
 * Master Template Categories Dataset (25 Fresh Production-Grade Categories)
 * Categorizes master and custom templates across all marketing and visual use cases.
 */
export const DEFAULT_TEMPLATE_CATEGORIES = [
  {
    name: 'Festive Greetings & Special Days',
    slug: 'festive-greetings-special-days',
    description: 'Festivals, national days, spiritual occasions, and cultural celebrations.',
    isSystem: true,
  },
  {
    name: 'Promotional Offers & Mega Sales',
    slug: 'promotional-offers-mega-sales',
    description: 'Festive discounts, mega sales, coupons, and seasonal clearance events.',
    isSystem: true,
  },
  {
    name: 'Flash Deals & Limited Discounts',
    slug: 'flash-deals-limited-discounts',
    description: 'Urgency-driven 24-hour flash sales, limited-time coupon codes, and deal countdowns.',
    isSystem: true,
  },
  {
    name: 'New Product & Service Launch',
    slug: 'new-product-service-launch',
    description: 'Product teasers, new menu items, store arrivals, and feature unveilings.',
    isSystem: true,
  },
  {
    name: 'Customer Reviews & Testimonials',
    slug: 'customer-reviews-testimonials',
    description: '5-star client reviews, video testimonials, trust badges, and social proof.',
    isSystem: true,
  },
  {
    name: 'We Are Hiring & Careers',
    slug: 'we-are-hiring-careers',
    description: 'Job vacancies, urgent recruitment notices, internship openings, and career posters.',
    isSystem: true,
  },
  {
    name: 'Daily Motivation & Leadership Quotes',
    slug: 'daily-motivation-leadership-quotes',
    description: 'Morning motivation, entrepreneur wisdom, thought-leadership quotes, and productivity tips.',
    isSystem: true,
  },
  {
    name: 'Birthday & Anniversary Wishes',
    slug: 'birthday-anniversary-wishes',
    description: 'Personalized customer birthdays, work anniversaries, and partnership greetings.',
    isSystem: true,
  },
  {
    name: 'Grand Opening & Re-launch',
    slug: 'grand-opening-relaunch',
    description: 'New branch inaugurations, ribbon cuttings, showroom expansions, and re-openings.',
    isSystem: true,
  },
  {
    name: 'Business Milestones & Achievements',
    slug: 'business-milestones-achievements',
    description: '10K orders reached, award wins, ISO certifications, and corporate anniversaries.',
    isSystem: true,
  },
  {
    name: 'Educational Tips & Industry Insights',
    slug: 'educational-tips-industry-insights',
    description: 'How-to guides, infographics, tax saving tips, and expert industry advice.',
    isSystem: true,
  },
  {
    name: 'Healthcare Camps & Wellness Advice',
    slug: 'healthcare-camps-wellness-advice',
    description: 'Free health checkup camps, yoga wellness days, nutrition tips, and blood drives.',
    isSystem: true,
  },
  {
    name: 'Admissions Open & Academic Courses',
    slug: 'admissions-open-academic-courses',
    description: 'New batch enrollment, entrance test registration, and scholarship programs.',
    isSystem: true,
  },
  {
    name: 'Food Menu & Daily Specials',
    slug: 'food-menu-daily-specials',
    description: 'Chef recommendation of the day, seasonal beverages, combos, and happy hours.',
    isSystem: true,
  },
  {
    name: 'Real Estate Showcases & Open House',
    slug: 'real-estate-showcases-open-house',
    description: 'Luxury villa listings, 2BHK/3BHK floorplans, open house invites, and booking offers.',
    isSystem: true,
  },
  {
    name: 'Gym Transformation & Fitness Challenges',
    slug: 'gym-transformation-fitness-challenges',
    description: '30-day fat loss challenges, member transformation stories, and workout motivation.',
    isSystem: true,
  },
  {
    name: 'Beauty & Spa Makeover Specials',
    slug: 'beauty-spa-makeover-specials',
    description: 'Bridal makeover packages, keratin treatments, relaxing spa combos, and manicure deals.',
    isSystem: true,
  },
  {
    name: 'National Pride & Historical Tributes',
    slug: 'national-pride-historical-tributes',
    description: 'Patriotic tributes, military honors, freedom fighters, and civic awareness messages.',
    isSystem: true,
  },
  {
    name: 'Events, Workshops & Webinars',
    slug: 'events-workshops-webinars',
    description: 'Live masterclasses, online webinars, physical workshops, and musical concerts.',
    isSystem: true,
  },
  {
    name: 'Holiday Notice & Store Timings',
    slug: 'holiday-notice-store-timings',
    description: 'Festival closing dates, emergency maintenance hours, and modified store timings.',
    isSystem: true,
  },
  {
    name: 'Brand Story & Behind The Scenes',
    slug: 'brand-story-behind-the-scenes',
    description: 'Artisan craft, product making videos, warehouse tours, and founding philosophy.',
    isSystem: true,
  },
  {
    name: 'VIP Loyalty & Reward Programs',
    slug: 'vip-loyalty-reward-programs',
    description: 'Member cashback, scratch card bonuses, referral rewards, and VIP club points.',
    isSystem: true,
  },
  {
    name: 'Before & After Portfolio',
    slug: 'before-after-portfolio',
    description: 'Interior renovation before/after, dental smile design, and skin transformation results.',
    isSystem: true,
  },
  {
    name: 'Team Spotlight & Employee Appreciation',
    slug: 'team-spotlight-employee-appreciation',
    description: 'Employee of the month, team welcomes, leadership highlights, and office celebrations.',
    isSystem: true,
  },
  {
    name: 'Weekend Specials & Sunday Brunches',
    slug: 'weekend-specials-sunday-brunches',
    description: 'Sunday buffet offers, weekend getaway deals, live music nights, and family platters.',
    isSystem: true,
  },
];

/**
 * Seed Default Master Template Categories
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedTemplateCategories(prisma) {
  console.log(`🏷️ Seeding ${DEFAULT_TEMPLATE_CATEGORIES.length} Master Template Categories...`);

  for (const cat of DEFAULT_TEMPLATE_CATEGORIES) {
    await prisma.templateCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        isSystem: cat.isSystem,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isSystem: cat.isSystem,
      },
    });
  }

  console.log(`✅ Master Template Categories seeded successfully (${DEFAULT_TEMPLATE_CATEGORIES.length} categories).`);
}
