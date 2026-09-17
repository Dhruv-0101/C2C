import { prisma } from '../../config/database.js';

/**
 * Smart Rule-Based AI Caption Synthesizer (Zero-Config Fallback & High-Performance Generator)
 */
function synthesizeSmartCaption({
  businessName = 'Our Brand',
  tagline = '',
  categoryName = '',
  city = '',
  state = '',
  country = 'India',
  address = '',
  phone = '',
  whatsapp = '',
  email = '',
  instagramHandle = '',
  facebookHandle = '',
  linkedinHandle = '',
  twitterHandle = '',
  youtubeHandle = '',
  targetAudience = '',
  businessUsps = '',
  workingHours = '',
  websiteUrl = '',
  gmbReviewUrl = '',
  upiVpa = '',
  topic = '',
  festivalName = '',
  occasionName = '',
  customText = '',
  offerText = '',
  tone = 'PROMOTIONAL',
  language = 'ENGLISH',
  platform = 'INSTAGRAM',
}) {
  const isHinglish = language === 'HINGLISH';
  const isHindi = language === 'HINDI';

  const contextTitle = festivalName || occasionName || topic || 'Special Announcement';

  // Format location line
  const locationParts = [address, city, state, country && country !== 'India' ? country : ''].filter(Boolean);
  const locationStr = locationParts.join(', ');

  // Construct Contact & CTA Details
  let ctaParts = [];
  if (whatsapp) ctaParts.push(`📲 WhatsApp: ${whatsapp}`);
  if (phone && phone !== whatsapp) ctaParts.push(`📞 Call: ${phone}`);
  if (email) ctaParts.push(`✉️ Email: ${email}`);
  if (websiteUrl) ctaParts.push(`🌐 Visit: ${websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}`);
  if (locationStr) ctaParts.push(`📍 Location: ${locationStr}`);
  if (workingHours) ctaParts.push(`⏰ Hours: ${workingHours}`);
  if (gmbReviewUrl) ctaParts.push(`⭐ Google Review: ${gmbReviewUrl}`);
  if (upiVpa) ctaParts.push(`💳 UPI Pay: ${upiVpa}`);

  // Social handles mention
  const handles = [
    instagramHandle ? `@${instagramHandle.replace('@', '')}` : '',
    facebookHandle ? `@${facebookHandle.replace('@', '')}` : '',
    twitterHandle ? `@${twitterHandle.replace('@', '')}` : '',
    linkedinHandle ? `@${linkedinHandle.replace('@', '')}` : '',
  ].filter(Boolean);

  if (handles.length > 0) {
    ctaParts.push(`🔗 Follow Us: ${handles.join(' | ')}`);
  }

  const callToAction =
    ctaParts.length > 0
      ? ctaParts.join('\n')
      : `📩 DM us or connect with ${businessName} for more details!`;

  let headline = '';
  let body = '';
  let closing = '';

  // Integrate Category & USPs
  const categoryContext = categoryName ? ` (${categoryName})` : '';
  const uspSection = businessUsps
    ? isHinglish
      ? `\n\n✨ Kyon chunein hume:\n${businessUsps}`
      : isHindi
      ? `\n\n✨ हमारी खासियत:\n${businessUsps}`
      : `\n\n✨ Why Choose Us:\n${businessUsps}`
    : '';

  // Tone Variations
  if (tone === 'FESTIVE') {
    if (isHinglish) {
      headline = `✨ ${contextTitle} ki dher saari shubhkaamnayein from ${businessName}${categoryContext}! 🪔🎉`;
      body = `${tagline ? `"${tagline}"\n\n` : ''}Iss paavan avsar par ${businessName} laye hain aapke liye sabse khas aur premium offerings.${uspSection}\n\n${
        offerText ? `🔥 Special Offer: ${offerText}!` : 'Apne doston aur family ke sath iss tyohar ko aur khas banayein.'
      }${customText ? `\n📌 ${customText}` : ''}`;
      closing = `🎉 Warmest festival greetings to our valued customers & community!`;
    } else if (isHindi) {
      headline = `✨ ${businessName}${categoryContext} की तरफ से ${contextTitle} की हार्दिक शुभकामनाएं! 🪔🎉`;
      body = `${tagline ? `"${tagline}"\n\n` : ''}इस पावन अवसर पर पाएं हमारे विशेष ऑफर्स।${uspSection}\n\n${
        offerText ? `🔥 विशेष छूट: ${offerText}!` : 'अपने परिवार के साथ इस त्यौहार को और भी खास बनाएं।'
      }${customText ? `\n📌 ${customText}` : ''}`;
      closing = `🎉 आप सभी को त्यौहार की बहुत-बहुत शुभकामनाएं!`;
    } else {
      headline = `✨ Warm wishes on ${contextTitle} from ${businessName}${categoryContext}! 🪔🎉`;
      body = `${tagline ? `"${tagline}"\n\n` : ''}Celebrate this festival season with our exclusive collection & special deals crafted just for you.${uspSection}\n\n${
        offerText ? `🎁 Special Offer: ${offerText}!` : 'Make this occasion unforgettable with your loved ones.'
      }${customText ? `\n📌 ${customText}` : ''}`;
      closing = `🎉 Best festival wishes to all our wonderful patrons!`;
    }
  } else if (tone === 'URGENT') {
    if (isHinglish) {
      headline = `🚨 HURRY! Limited Time Offer from ${businessName}${categoryContext}! ⏳💥`;
      body = `${tagline ? `"${tagline}"\n\n` : ''}Yeh offer zyada din nahi tikega! ${
        offerText ? `⚡ ${offerText}` : 'Aaj hi claim karein apna special discount.'
      }${uspSection}${customText ? `\n\n📌 Note: ${customText}` : ''}`;
      closing = `🔥 Stock/slots khatam hone se pehle abhi contact karein!`;
    } else {
      headline = `🚨 LIMITED TIME ONLY! Special Announcement from ${businessName}${categoryContext}! ⏳💥`;
      body = `${tagline ? `"${tagline}"\n\n` : ''}Don't miss out on this exclusive opportunity! ${
        offerText ? `⚡ ${offerText}` : 'Claim your deal before time runs out.'
      }${uspSection}${customText ? `\n\n📌 Details: ${customText}` : ''}`;
      closing = `🔥 Hurry up! Contact us today before this deal expires!`;
    }
  } else if (tone === 'WITTY') {
    headline = `😎 Looking for the best ${contextTitle}? ${businessName}${categoryContext} has got you covered! 🚀✨`;
    body = `${tagline ? `"${tagline}"\n\n` : ''}Why settle for ordinary when you can get top-notch quality with us?${uspSection}\n\n${
      offerText ? `💡 Bonus Deal: ${offerText}` : 'Treat yourself today because you deserve the best!'
    }${customText ? `\n📌 ${customText}` : ''}`;
    closing = `👉 Double tap if you agree and message us to get started!`;
  } else if (tone === 'PROFESSIONAL') {
    headline = `💼 Delivering Excellence & Trust | ${businessName}${categoryContext}`;
    body = `${tagline ? `"${tagline}"\n\n` : ''}At ${businessName}, we specialize in top-tier solutions for ${contextTitle}. Designed specifically for ${
      targetAudience || 'our valued clients'
    }.${uspSection}${
      offerText ? `\n\n⭐ Featured Offer: ${offerText}` : ''
    }${customText ? `\n\n📌 Details: ${customText}` : ''}`;
    closing = `🤝 Connect with our professional team today for personalized assistance.`;
  } else {
    // Default PROMOTIONAL / FRIENDLY
    if (isHinglish) {
      headline = `🌟 ${businessName}${categoryContext} me aapka swagat hai! 🎉`;
      body = `${tagline ? `"${tagline}"\n\n` : ''}Kya aap dhoondh rahe hain best ${contextTitle}? Hum laye hain aapke liye sabse behtareen quality.${uspSection}\n\n${
        offerText ? `🎉 Special Deal: ${offerText}` : ''
      }${customText ? `\n📌 ${customText}` : ''}`;
      closing = `👇 Comment below ya contact karein mazeedaar offers ke liye!`;
    } else {
      headline = `🌟 Elevate Your Experience with ${businessName}${categoryContext}! ✨`;
      body = `${tagline ? `"${tagline}"\n\n` : ''}Discover unmatched quality and premium offerings for ${contextTitle}.${uspSection}\n\n${
        offerText ? `🎁 Exclusive Deal: ${offerText}` : ''
      }${customText ? `\n📌 ${customText}` : ''}`;
      closing = `👉 Get in touch or visit us now to make the most of this offer!`;
    }
  }

  const captionText = `${headline}\n\n${body}\n\n${closing}\n\n${callToAction}`;

  // Generate Comprehensive Targeted Hashtags using ALL BrandKit context
  const baseTag = businessName.replace(/[^a-zA-Z0-9]/g, '');
  const categoryTag = categoryName ? categoryName.replace(/[^a-zA-Z0-9]/g, '') : '';
  const contextTag = contextTitle.replace(/[^a-zA-Z0-9]/g, '');
  const cityTag = city ? city.replace(/[^a-zA-Z0-9]/g, '') : '';
  const stateTag = state ? state.replace(/[^a-zA-Z0-9]/g, '') : '';

  const hashtagsSet = new Set([
    `#${baseTag}`,
    categoryTag ? `#${categoryTag}` : '#SmallBusiness',
    `#${contextTag}`,
    `#${contextTag}2026`,
    cityTag ? `#${cityTag}` : '',
    cityTag ? `#${cityTag}Business` : '',
    stateTag ? `#${stateTag}` : '',
    '#LocalBusiness',
    '#TrendingNow',
    '#SpecialOffer',
    '#QualityFirst',
    '#BrandFlowAI',
  ]);

  if (platform === 'INSTAGRAM') {
    hashtagsSet.add('#InstaDaily');
    hashtagsSet.add('#PostOfTheDay');
    hashtagsSet.add('#ExplorePage');
    hashtagsSet.add('#InstaGood');
  } else if (platform === 'LINKEDIN') {
    hashtagsSet.add('#Innovation');
    hashtagsSet.add('#BusinessGrowth');
    hashtagsSet.add('#Entrepreneurship');
    hashtagsSet.add('#Leadership');
  } else if (platform === 'FACEBOOK') {
    hashtagsSet.add('#FacebookPosts');
    hashtagsSet.add('#LocalServices');
  } else if (platform === 'TWITTER') {
    // Twitter hashtags kept concise
  }

  const hashtags = Array.from(hashtagsSet).filter(Boolean);

  return {
    captionText,
    hashtags,
  };
}

export const aiLogic = {
  /**
   * Generate AI Caption & Hashtags using BrandKit context + External LLM API / Built-in Smart Synthesizer
   */
  generateCaption: async (userId, params) => {
    // 1. Fetch User Brand Kit for Full Context (All configured fields)
    const brandKit = await prisma.brandKit.findUnique({
      where: { userId },
      select: {
        businessName: true,
        tagline: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        address: true,
        city: true,
        state: true,
        country: true,
        phone: true,
        whatsapp: true,
        email: true,
        instagramHandle: true,
        facebookHandle: true,
        linkedinHandle: true,
        twitterHandle: true,
        youtubeHandle: true,
        targetAudience: true,
        captionLanguage: true,
        businessUsps: true,
        workingHours: true,
        websiteUrl: true,
        gmbReviewUrl: true,
        upiVpa: true,
      },
    });

    const context = {
      businessName: brandKit?.businessName || 'Our Business',
      tagline: brandKit?.tagline || '',
      categoryName: brandKit?.category?.name || '',
      address: brandKit?.address || '',
      city: brandKit?.city || '',
      state: brandKit?.state || '',
      country: brandKit?.country || 'India',
      phone: brandKit?.phone || '',
      whatsapp: brandKit?.whatsapp || '',
      email: brandKit?.email || '',
      instagramHandle: brandKit?.instagramHandle || '',
      facebookHandle: brandKit?.facebookHandle || '',
      linkedinHandle: brandKit?.linkedinHandle || '',
      twitterHandle: brandKit?.twitterHandle || '',
      youtubeHandle: brandKit?.youtubeHandle || '',
      targetAudience: brandKit?.targetAudience || 'General Audience',
      captionLanguage: params.language || brandKit?.captionLanguage || 'English',
      businessUsps: brandKit?.businessUsps || '',
      workingHours: brandKit?.workingHours || '',
      websiteUrl: brandKit?.websiteUrl || '',
      gmbReviewUrl: brandKit?.gmbReviewUrl || '',
      upiVpa: brandKit?.upiVpa || '',
      ...params,
    };

    // 2. Check for OpenAI or Gemini API Key in Environment
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const fullLocation = [context.address, context.city, context.state, context.country].filter(Boolean).join(', ');

    const promptText = `You are an expert social media copywriter. Write a high-converting ${params.platform || 'INSTAGRAM'} caption in ${context.captionLanguage} with tone '${params.tone}'.

Business Context (from BrandKit):
- Business Name: '${context.businessName}'
- Business Category: '${context.categoryName}'
- Tagline: '${context.tagline}'
- Key USPs / Value Propositions: '${context.businessUsps}'
- Target Audience: '${context.targetAudience}'
- Location: '${fullLocation}'
- Working Hours: '${context.workingHours}'
- Contact: Phone '${context.phone}', WhatsApp '${context.whatsapp}', Email '${context.email}', Website '${context.websiteUrl}'
- Social Handles / Reviews: Instagram '${context.instagramHandle}', Facebook '${context.facebookHandle}', Google Review Link '${context.gmbReviewUrl}'

Post Content Parameters:
- Topic / Event / Occasion: '${params.topic || params.festivalName || params.occasionName || 'Business Update'}'
- Offer / Discount: '${params.offerText || 'None'}'
- Custom Details: '${params.customText || ''}'

Format Requirements:
1. Catchy headline with relevant emojis.
2. Body text weaving in tagline, USPs, and offer details.
3. Clean Call-To-Action (CTA) with phone, WhatsApp, email, address, working hours, and website as provided.
4. End with 8 to 12 targeted trending hashtags based on business name, category, city, state, topic, and platform.`;

    if (geminiKey && !geminiKey.includes('dummy')) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        const geminiData = await geminiRes.json();

        if (!geminiRes.ok) {
          console.warn('⚠️ Gemini API HTTP Error:', geminiRes.status, JSON.stringify(geminiData));
        } else {
          const rawContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (rawContent) {
            const hashtagMatches = rawContent.match(/#[a-zA-Z0-9_]+/g) || [];
            const cleanCaption = rawContent.replace(/#[a-zA-Z0-9_]+/g, '').trim();

            return {
              source: 'GEMINI_AI',
              captionText: cleanCaption || rawContent,
              hashtags: hashtagMatches.length > 0 ? hashtagMatches : ['#BrandFlow', '#SocialMedia'],
              variants: [rawContent],
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call exception, falling back to Smart AI Engine:', err.message);
      }
    }

    if (openAiKey && !openAiKey.includes('dummy')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert social media copywriter creating high-converting captions with emojis, call-to-actions, and targeted hashtags based on brand identity.',
              },
              {
                role: 'user',
                content: promptText,
              },
            ],
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          const rawContent = data.choices[0].message.content;
          const hashtagMatches = rawContent.match(/#[a-zA-Z0-9_]+/g) || [];
          return {
            source: 'OPENAI',
            captionText: rawContent,
            hashtags: hashtagMatches.length > 0 ? hashtagMatches : ['#BrandFlow', '#SocialMedia'],
            variants: [rawContent],
          };
        }
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to Smart AI Engine:', err.message);
      }
    }

    // 3. Built-in Smart AI Engine (Zero-Config Enterprise Fallback)
    const result = synthesizeSmartCaption(context);

    return {
      source: 'SMART_SYNTHESIZER',
      captionText: result.captionText,
      hashtags: result.hashtags,
    };
  },

  /**
   * Suggest trending hashtags for a specific topic & platform
   */
  suggestHashtags: async (params) => {
    const topicTag = params.topic ? params.topic.replace(/[^a-zA-Z0-9]/g, '') : 'Trending';
    const categoryTag = params.category ? params.category.replace(/[^a-zA-Z0-9]/g, '') : '';

    const hashtagsSet = new Set([
      `#${topicTag}`,
      `#${topicTag}2026`,
      categoryTag ? `#${categoryTag}` : '#BusinessMarketing',
      '#ViralPosts',
      '#SocialMediaGrowth',
      '#BrandFlowAI',
      '#TrendingTopic',
      '#InstaDaily',
    ]);

    if (params.platform === 'LINKEDIN') {
      hashtagsSet.add('#BusinessStrategy');
      hashtagsSet.add('#Networking');
    } else if (params.platform === 'FACEBOOK') {
      hashtagsSet.add('#FacebookCommunity');
    }

    return {
      hashtags: Array.from(hashtagsSet).filter(Boolean),
    };
  },
};

