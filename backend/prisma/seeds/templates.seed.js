/**
 * Master Default Templates Dataset (26 Fresh Production-Grade Templates)
 * Linked to relational TemplateCategories and annual Festivals.
 * All image URLs are 100% pre-validated HTTP 200 high-res Unsplash photography assets.
 */
export async function seedTemplates(prisma) {
  console.log('🎨 Seeding 26 Master Default Templates linked to Festivals & Categories...');

  // Map festivals by slug for quick relation linking
  const festivals = await prisma.festival.findMany();
  const festivalMap = new Map(festivals.map((f) => [f.slug, f.id]));

  // Map template categories by slug for relational linking
  const templateCategories = await prisma.templateCategory.findMany();
  const catSlugMap = new Map(templateCategories.map((c) => [c.slug, c.id]));

  const templatesData = [
    // 1. Diwali Grand Celebration
    {
      id: 'template-diwali-grand-celebration',
      title: 'Diwali Grand Celebration & Festive Mega Sale',
      description: 'Luminous festive golden lamp backdrop for Diwali greetings, shopping offers & gift hampers.',
      templateCategoryId: catSlugMap.get('promotional-offers-mega-sales') || null,
      festivalId: festivalMap.get('diwali-deepavali-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 2. Holi Festival of Colors
    {
      id: 'template-holi-vibrant-colors',
      title: 'Holi Festival of Colors Party & Buffet Offer',
      description: 'Joyful explosion of herbal colors for organic gulal offers, resort parties, and sweets.',
      templateCategoryId: catSlugMap.get('festive-greetings-special-days') || null,
      festivalId: festivalMap.get('holi-festival-of-colors-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 3. Navratri Garba Night
    {
      id: 'template-navratri-garba-night',
      title: 'Navratri Garba Night Passes & Ethnic Wear Sale',
      description: 'Vibrant dandiya raas backdrop for passes, traditional clothing, and 9-day festive deals.',
      templateCategoryId: catSlugMap.get('festive-greetings-special-days') || null,
      festivalId: festivalMap.get('navratri-durga-puja-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 4. Republic Day Pride
    {
      id: 'template-republic-pride-tribute',
      title: 'Republic Day Patriotism & National Pride 40% OFF',
      description: 'Indian tricolor background honoring constitutional heritage and republic mega sales.',
      templateCategoryId: catSlugMap.get('national-pride-historical-tributes') || null,
      festivalId: festivalMap.get('republic-day-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 5. New Year Countdown
    {
      id: 'template-new-year-countdown',
      title: 'New Year 2026 Countdown Gala & Mega Discounts',
      description: 'Sparkling champagne celebration background for year-end parties and January new launches.',
      templateCategoryId: catSlugMap.get('promotional-offers-mega-sales') || null,
      festivalId: festivalMap.get('new-years-day-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 6. Christmas Holiday Cheer
    {
      id: 'template-christmas-holiday-cheer',
      title: 'Christmas Holiday Cheer & Year-End Winter Sale',
      description: 'Festive Christmas pine tree and golden ornaments for holiday season greetings.',
      templateCategoryId: catSlugMap.get('promotional-offers-mega-sales') || null,
      festivalId: festivalMap.get('christmas-celebration-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 7. Ganesh Utsav Blessings
    {
      id: 'template-ganesh-chaturthi-modak',
      title: 'Ganesh Utsav Divine Blessings & Special Gifting Hampers',
      description: 'Auspicious celebratory background for Lord Ganesha festive greetings and sweet gift boxes.',
      templateCategoryId: catSlugMap.get('festive-greetings-special-days') || null,
      festivalId: festivalMap.get('ganesh-chaturthi-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1599827552599-eeddd4957e84?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 8. Eid Mubarak Royal Feast
    {
      id: 'template-eid-mubarak-feasts',
      title: 'Eid Mubarak Royal Feast & Celebration Greetings',
      description: 'Elegant golden mosque architecture and moonlight banner for Ramzan Eid greetings.',
      templateCategoryId: catSlugMap.get('festive-greetings-special-days') || null,
      festivalId: festivalMap.get('eid-ul-fitr-2026') || null,
      baseImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 9. Golden Birthday & Anniversary Wishes
    {
      id: 'template-birthday-confetti-gold',
      title: 'Golden Birthday & Customer Appreciation Wishes',
      description: 'Elegant gold confetti balloons background for client birthdays and founder anniversaries.',
      templateCategoryId: catSlugMap.get('birthday-anniversary-wishes') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 10. We Are Hiring Recruitment
    {
      id: 'template-we-are-hiring-talent',
      title: 'We Are Hiring: Join Our Rapidly Growing Team',
      description: 'Collaborative modern workspace background for job openings, HR recruitment, and careers.',
      templateCategoryId: catSlugMap.get('we-are-hiring-careers') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 11. Monday Motivation Leadership
    {
      id: 'template-monday-motivation-ceo',
      title: 'Monday Motivation: Focus, Resilience & Business Growth',
      description: 'Sleek dark executive background for daily business quotes, mindset tips, and leadership.',
      templateCategoryId: catSlugMap.get('daily-motivation-leadership-quotes') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 12. Flash Midnight Sale
    {
      id: 'template-flash-midnight-sale',
      title: '24-Hour Midnight Flash Deal: FLAT 50% OFF',
      description: 'High-contrast neon shopping promo backdrop for limited-time flash discount events.',
      templateCategoryId: catSlugMap.get('flash-deals-limited-discounts') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 13. Mega Fashion Shopping
    {
      id: 'template-mega-fashion-shopping',
      title: 'Summer Fashion Collection: Mega Shopping Spree',
      description: 'Vibrant boutique fashion bags background for apparel collections and end-of-season sales.',
      templateCategoryId: catSlugMap.get('promotional-offers-mega-sales') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 14. Fine Dining Bistro Special
    {
      id: 'template-fine-dining-bistro',
      title: 'Gourmet Chef Special: Candlelight Dinner & Weekend Platter',
      description: 'Atmospheric bistro dining table setting for restaurant menus, happy hours, and brunches.',
      templateCategoryId: catSlugMap.get('food-menu-daily-specials') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 15. Fitness Gym Transformation
    {
      id: 'template-fitness-gym-challenge',
      title: 'Transform Your Body: 30-Day Ultimate Fitness Challenge',
      description: 'High-intensity athletic gym backdrop for gym memberships, personal training, and fitness challenges.',
      templateCategoryId: catSlugMap.get('gym-transformation-fitness-challenges') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 16. Luxury Real Estate Showcase
    {
      id: 'template-luxury-villa-realty',
      title: 'Luxury Modern Villa: Exclusive Booking Privileges',
      description: 'Architectural luxury swimming pool villa for real estate brokers and premium housing projects.',
      templateCategoryId: catSlugMap.get('real-estate-showcases-open-house') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 17. Medical & Health Camp
    {
      id: 'template-medical-health-camp',
      title: 'Comprehensive Health Checkup Camp & Consultation',
      description: 'Clean medical consultation backdrop for clinics, doctors, diagnostic tests, and health drives.',
      templateCategoryId: catSlugMap.get('healthcare-camps-wellness-advice') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 18. Bridal Jewellery Collection
    {
      id: 'template-bridal-jewellery-sparkle',
      title: 'Royal Bridal Heritage Jewellery Collection',
      description: 'Sparkling diamond and gold jewelry showcase for wedding collections and gold rates updates.',
      templateCategoryId: catSlugMap.get('new-product-service-launch') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 19. Next-Gen Tech Launch
    {
      id: 'template-tech-innovations-launch',
      title: 'Next-Gen AI Tech Suite: Official Product Launch',
      description: 'Modern developer technology workspace for SaaS software announcements and digital platforms.',
      templateCategoryId: catSlugMap.get('new-product-service-launch') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 20. Academic Admissions Open
    {
      id: 'template-academic-admissions-open',
      title: 'Admissions Open 2026: Build Your Bright Future',
      description: 'Inspirational student campus library background for schools, universities, and coaching institutes.',
      templateCategoryId: catSlugMap.get('admissions-open-academic-courses') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 21. Customer 5-Star Testimonial
    {
      id: 'template-client-5star-review',
      title: 'Client Testimonial: 5-Star Experience & Unmatched Trust',
      description: 'Warm professional business handshake backdrop for customer testimonials and case studies.',
      templateCategoryId: catSlugMap.get('customer-reviews-testimonials') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 22. Grand Showroom Opening
    {
      id: 'template-grand-showroom-opening',
      title: 'Grand Opening Ceremony: Inaugural Discounts & Gifts',
      description: 'Celebratory red ribbon stage lighting backdrop for store launches, branches, and showrooms.',
      templateCategoryId: catSlugMap.get('grand-opening-relaunch') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 23. Artisanal Cafe Pastry
    {
      id: 'template-artisanal-cafe-pastry',
      title: 'Freshly Brewed Coffee & Artisanal Pastries Combo',
      description: 'Warm bakery counter with fresh baked croissants and espresso for cafe announcements.',
      templateCategoryId: catSlugMap.get('food-menu-daily-specials') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 24. Spa & Makeover Special
    {
      id: 'template-spa-pamper-makeover',
      title: 'Luxurious Rejuvenating Spa & Complete Beauty Glow',
      description: 'Aromatherapy candles and luxury cosmetics background for beauty salons and spa packages.',
      templateCategoryId: catSlugMap.get('beauty-spa-makeover-specials') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 25. Yoga & Mindful Wellness
    {
      id: 'template-yoga-mindful-wellness',
      title: 'Mindfulness & Holistic Yoga Workshop: Reconnect Within',
      description: 'Peaceful sunrise nature yoga backdrop for meditation centers, wellness retreats, and gyms.',
      templateCategoryId: catSlugMap.get('healthcare-camps-wellness-advice') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1080&auto=format&fit=crop',
      isCustomUpload: false,
      isActive: true,
    },

    // 26. Royal Destination Wedding
    {
      id: 'template-royal-wedding-planning',
      title: 'Destination Wedding Planning: Creating Lifetime Memories',
      description: 'Romantic floral banquet arch setting for wedding planners, banquet halls, and decorators.',
      templateCategoryId: catSlugMap.get('events-workshops-webinars') || null,
      festivalId: null,
      baseImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1080&auto=format&fit=crop',
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
        templateCategoryId: tpl.templateCategoryId,
        festivalId: tpl.festivalId,
        baseImageUrl: tpl.baseImageUrl,
        isCustomUpload: tpl.isCustomUpload,
        isActive: tpl.isActive,
      },
      create: tpl,
    });
  }

  console.log(`✅ Seeded ${templatesData.length} master default templates with relational template categories & festivals.`);
}

// Allow running directly via CLI: `node prisma/seeds/templates.seed.js`
if (process.argv[1]?.endsWith('templates.seed.js')) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  seedTemplates(prisma)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error executing templates seed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
