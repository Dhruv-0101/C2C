import { prisma } from '../../config/database.js';

/**
 * Smart Rule-Based AI Caption Synthesizer (Zero-Config Fallback & High-Performance Generator)
 */
function synthesizeSmartCaption({
  businessName = 'Our Brand',
  tagline = '',
  city = '',
  phone = '',
  whatsapp = '',
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

  const contextTitle = festivalName || occasionName || topic || 'Special Offer';
  const callToAction = whatsapp
    ? `📲 WhatsApp us today at ${whatsapp} for orders & inquiries!`
    : phone
    ? `📞 Call us at ${phone} to learn more!`
    : `📩 Send us a direct message or visit us in ${city || 'store'}!`;

  let headline = '';
  let body = '';
  let closing = '';

  // Tone Variations
  if (tone === 'FESTIVE') {
    if (isHinglish) {
      headline = `✨ ${contextTitle} ki dher saari shubhkaamnayein from ${businessName}! 🪔🎉`;
      body = `Iss paavan avsar par hum laye hain aapke liye sabse khas aur premium offerings. ${
        offerText ? `🔥 Limited Offer: ${offerText}!` : 'Apne doston aur family ke sath iss tyohar ko aur khas banayein.'
      }`;
      closing = `📍 Visit us in ${city || 'our outlet'} today!`;
    } else if (isHindi) {
      headline = `✨ ${businessName} की तरफ से ${contextTitle} की हार्दिक शुभकामनाएं! 🪔🎉`;
      body = `इस पावन अवसर पर पाएं हमारे विशेष ऑफर्स। ${
        offerText ? `🔥 विशेष छूट: ${offerText}!` : 'अपने परिवार के साथ इस त्यौहार को और भी खास बनाएं।'
      }`;
      closing = `📍 आज ही संपर्क करें!`;
    } else {
      headline = `✨ Warm wishes on ${contextTitle} from ${businessName}! 🪔🎉`;
      body = `Celebrate this festive season with our exclusive collection & special deals crafted just for you. ${
        offerText ? `🎁 Special Offer: ${offerText}!` : 'Make this festival unforgettable with your loved ones.'
      }`;
      closing = `📍 Visit us in ${city || 'our store'} or connect with us today!`;
    }
  } else if (tone === 'URGENT') {
    if (isHinglish) {
      headline = `🚨 HURRY! Limited Time Offer from ${businessName}! ⏳💥`;
      body = `Yeh offer zyada din nahi tikega! ${
        offerText ? `⚡ ${offerText}` : 'Aaj hi claim karein apna special discount.'
      } ${customText ? `\n\n📌 Note: ${customText}` : ''}`;
      closing = `🔥 Stock khatam hone se pehle abhi order karein!`;
    } else {
      headline = `🚨 LIMITED TIME ONLY! Special Announcement from ${businessName}! ⏳💥`;
      body = `Don't miss out on this exclusive opportunity! ${
        offerText ? `⚡ ${offerText}` : 'Claim your deal before time runs out.'
      } ${customText ? `\n\n📌 Details: ${customText}` : ''}`;
      closing = `🔥 Hurry up! Grab your offer before it's gone!`;
    }
  } else if (tone === 'WITTY') {
    headline = `😎 Looking for the best ${contextTitle}? ${businessName} has got you covered! 🚀✨`;
    body = `Why settle for ordinary when you can get the ultimate quality? ${
      offerText ? `💡 Bonus deal: ${offerText}` : 'Treat yourself today because you deserve it!'
    }`;
    closing = `👉 Double tap if you agree and DM us to get started!`;
  } else if (tone === 'PROFESSIONAL') {
    headline = `💼 Delivering Excellence & Trust | ${businessName}`;
    body = `${tagline ? `${tagline}\n\n` : ''}At ${businessName}, we specialize in top-tier solutions tailored for your needs regarding ${contextTitle}. ${
      offerText ? `\n\n⭐ Current Executive Offer: ${offerText}` : ''
    }`;
    closing = `🤝 Connect with our expert team today.`;
  } else {
    // Default PROMOTIONAL / FRIENDLY
    if (isHinglish) {
      headline = `🌟 ${businessName} me aapka swagat hai! 🎉`;
      body = `Kya aap dhoondh rahe hain best ${contextTitle}? Hum laye hain aapke liye sabse behtareen quality. ${
        offerText ? `\n\n🎉 Special Deal: ${offerText}` : ''
      }`;
      closing = `👇 Comment below ya inbox karein mazeedaar offers ke liye!`;
    } else {
      headline = `🌟 Elevate Your Experience with ${businessName}! ✨`;
      body = `${tagline ? `${tagline}\n\n` : ''}Discover unmatched quality and premium offerings for ${contextTitle}. ${
        offerText ? `\n\n🎁 Exclusive Deal: ${offerText}` : ''
      } ${customText ? `\n${customText}` : ''}`;
      closing = `👉 Tap the link in bio or message us now to place your order!`;
    }
  }

  const captionText = `${headline}\n\n${body}\n\n${closing}\n\n${callToAction}`;

  // Generate Targeted Hashtags
  const baseTag = businessName.replace(/[^a-zA-Z0-9]/g, '');
  const contextTag = contextTitle.replace(/[^a-zA-Z0-9]/g, '');
  const cityTag = city ? city.replace(/[^a-zA-Z0-9]/g, '') : '';

  const defaultHashtags = [
    `#${baseTag}`,
    `#${contextTag}`,
    `#${contextTag}2026`,
    cityTag ? `#${cityTag}Business` : '#SmallBusinessSupport',
    '#LocalBusiness',
    '#TrendingNow',
    '#SpecialOffer',
    '#QualityFirst',
    '#BrandFlowAI',
  ];

  if (platform === 'INSTAGRAM') {
    defaultHashtags.push('#InstaDaily', '#PostOfTheDay', '#ExplorePage');
  } else if (platform === 'LINKEDIN') {
    defaultHashtags.push('#Innovation', '#BusinessGrowth', '#Entrepreneurship');
  } else if (platform === 'TWITTER') {
    defaultHashtags.splice(5); // Keep Twitter hashtags concise
  }

  return {
    captionText,
    hashtags: defaultHashtags,
  };
}

export const aiLogic = {
  /**
   * Generate AI Caption & Hashtags using BrandKit context + External LLM API / Built-in Smart Synthesizer
   */
  generateCaption: async (userId, params) => {
    // 1. Fetch User Brand Kit for Context
    const brandKit = await prisma.brandKit.findUnique({
      where: { userId },
      select: {
        businessName: true,
        tagline: true,
        city: true,
        phone: true,
        whatsapp: true,
        instagramHandle: true,
      },
    });

    const context = {
      businessName: brandKit?.businessName || 'Our Business',
      tagline: brandKit?.tagline || '',
      city: brandKit?.city || '',
      phone: brandKit?.phone || '',
      whatsapp: brandKit?.whatsapp || '',
      ...params,
    };

    // 2. Check for OpenAI or Gemini API Key in Environment
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const promptText = `You are an expert social media copywriter. Write a high-converting ${params.platform} caption in ${params.language} with tone '${
      params.tone
    }' for business '${context.businessName}' located in '${context.city || 'India'}'. Tagline: '${context.tagline || ''}'. Topic/Event: '${
      params.topic || params.festivalName || params.occasionName
    }'. Offer: '${params.offerText || 'None'}'. Contact Phone/WhatsApp: '${context.whatsapp || context.phone}'. Include relevant emojis and 8 trending hashtags at the end.`;

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
                  'You are an expert social media copywriter creating high-converting captions with emojis, call-to-actions, and targeted hashtags.',
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

    // Generate 2 additional variants for user selection
    const variant2 = synthesizeSmartCaption({ ...context, tone: 'FRIENDLY' });
    const variant3 = synthesizeSmartCaption({ ...context, tone: 'FESTIVE' });

    return {
      source: 'SMART_SYNTHESIZER',
      captionText: result.captionText,
      hashtags: result.hashtags,
      variants: [result.captionText, variant2.captionText, variant3.captionText],
    };
  },

  /**
   * Suggest trending hashtags for a specific topic & platform
   */
  suggestHashtags: async (params) => {
    const topicTag = params.topic.replace(/[^a-zA-Z0-9]/g, '');
    const categoryTag = params.category ? params.category.replace(/[^a-zA-Z0-9]/g, '') : '';

    const hashtags = [
      `#${topicTag}`,
      `#${topicTag}2026`,
      categoryTag ? `#${categoryTag}` : '#BusinessMarketing',
      '#ViralPosts',
      '#SocialMediaGrowth',
      '#BrandFlowAI',
      '#TrendingTopic',
      '#InstaDaily',
    ];

    return {
      hashtags,
    };
  },
};
