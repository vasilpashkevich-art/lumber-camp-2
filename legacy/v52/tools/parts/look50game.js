// v50: новая рисовка в игре — готовые картинки деревьев, валунов, залежей и площади (рисуются один раз, потом только копируются)
const SPR50={tree:{},rock:{},plaza:{}};
function sprite50(w,h,ox,oy,q,draw){
  const cv=document.createElement('canvas');cv.width=Math.ceil(w*q);cv.height=Math.ceil(h*q);const g=cv.getContext&&cv.getContext('2d');
  if(!g||!g.setTransform||!g.quadraticCurveTo)return null;g.setTransform(q,0,0,q,0,0);g.translate(ox,oy);g.lineJoin='round';g.lineCap='round';
  LOOK.use(g);try{draw()}catch(e){}LOOK.use(ctx);return {cv,w,h,ox,oy}}
function drawSpr(s,x,y,a){if(!s)return false;if(a<1)ctx.globalAlpha=a;ctx.drawImage(s.cv,x-s.ox,y-s.oy,s.w,s.h);if(a<1)ctx.globalAlpha=1;return true}
// крона становится прозрачной, если за деревом стоит герой или мертвец
function treeFade(x,y,sz){const w=24*sz,top=y-72*sz,bot=y-4;
  const behind=o=>Math.abs(o.x-x)<w&&o.y<bot&&o.y>top;
  if(behind(P))return 0.42;for(const z of zombies)if(Math.abs(z.x-x)<w&&behind(z))return 0.55;return 1}
function drawTree(t){
  const sh=t.shake>0?Math.sin(t.shake*80)*2:0,sc=0.85+t.seed*0.3,x=t.x+sh,y=t.y,kind=t.skin||t.tier,vb=Math.floor(t.seed*4)%4,k=kind+'|'+vb;
  let s=SPR50.tree[k];if(s===undefined)s=SPR50.tree[k]=sprite50(90,116,45,94,2,()=>LOOK.tree(kind,0,0,1,(vb+0.5)/4,1.2));
  const sz=sc*(t.r/CFG.trees[t.tier].r),a=treeFade(x,y,sz);
  if(s){ctx.save();ctx.translate(x,y);ctx.scale(sz,sz);drawSpr(s,0,0,a);ctx.restore()}
  if(kind===6){const tm=performance.now()/1000;for(let i=0;i<3;i++){const e=((tm*0.6+i*0.33+t.seed)%1);ctx.fillStyle=`rgba(244,150,60,${0.9*(1-e)*a})`;ctx.fillRect(x+Math.sin(i*2.3+t.seed*9)*12*sz,y-50*sz-e*20,2.2,2.2)}}
  const mx0=CFG.trees[t.tier].hp;
  if(t.hp<mx0){ctx.fillStyle='#000';ctx.fillRect(x-14,y+10,28,4);ctx.fillStyle='#e9c46a';ctx.fillRect(x-14,y+10,28*t.hp/mx0,4)}
}
// валун: цвет по зоне, снег/кристаллы/угли по краю
const rockCap=r=>{const sd=sideAt(r.x,r.y);if(sd&&sd.id==='snow')return 'snow';if(r.zone===4)return 'crystal';if(r.zone===6)return 'ember';return null};
function drawRock(r){
  const sh=r.shake>0?Math.sin(r.shake*80)*1.5:0,x=r.x+sh,y=r.y,s=r.r,cap=r.cap===undefined?(r.cap=rockCap(r)):r.cap,sd=sideAt(r.x,r.y),bio=sd&&LOOK.STONE_COL[sd.id]?sd.id:null;
  const vb=Math.floor(r.seed*4)%4,sb=s<13?0:s<15?1:2,k=[r.zone,bio,r.iron?1:0,cap,vb,sb].join('|');
  let sp=SPR50.rock[k];if(sp===undefined){const rr=[12,14,16][sb]*1.15,col=LOOK.STONE_COL[bio]||LOOK.STONE_COL[r.zone]||LOOK.STONE_COL[1];sp=SPR50.rock[k]=sprite50(64,58,32,40,2,()=>LOOK.boulder(0,0,rr,col,(vb+0.5)/4,!!r.iron,cap))}
  if(!drawSpr(sp,x,y,1)){ctx.fillStyle='#77746c';ctx.beginPath();ctx.arc(x,y-4,s,0,7);ctx.fill()}
  const mx=rockMax(r);
  if(r.hp<mx){ctx.fillStyle='#000';ctx.fillRect(x-14,y+s*0.6+4,28,4);ctx.fillStyle='#c9c7bd';ctx.fillRect(x-14,y+s*0.6+4,28*r.hp/mx,4)}
}
// залежь: картинка на каждую, рисуется один раз
function drawDeposit(p){
  if(p._spr===undefined){const sd=sideAt(p.x,p.y),bio=sd&&LOOK.STONE_COL[sd.id]?sd.id:null,iron=rocks.some(r=>r.iron&&Math.abs(r.x-p.x)<p.r&&dist(r.x,r.y,p.x,p.y)<p.r),R=p.r;
    p._spr=sprite50(R*2.5,R*2.1,R*1.25,R*1.05,1.5,()=>LOOK.deposit(0,0,R,p.zone||1,p.seed||0.5,iron,bio))}
  return drawSpr(p._spr,p.x,p.y,1)}
// площадь у ратуши растёт с уровнем
const PLAZA_R=[0,70,95,120,150,150,150];
function drawPlaza(){const lv=Math.max(1,Math.min(6,S.base)),R=PLAZA_R[lv];
  let s=SPR50.plaza[lv];if(s===undefined)s=SPR50.plaza[lv]=sprite50(R*2+60,R*2+60,R+30,R+30,1.5,()=>LOOK.plaza(0,0,R,lv,lv*5+1));
  drawSpr(s,CX,CY,1)}
// пень с обводкой и годовыми кольцами
function drawStump(t){const x=t.x,y=t.y,r=t.r*0.42;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+2,y+3,r+2,r*0.6,0,0,7);ctx.fill();
  ctx.fillStyle='#24180f';ctx.beginPath();ctx.ellipse(x,y+1,r+1.2,r*0.72+1.2,0,0,7);ctx.fill();ctx.fillStyle='#5a4128';ctx.beginPath();ctx.ellipse(x,y+1,r,r*0.72,0,0,7);ctx.fill();
  ctx.fillStyle='#c9a06a';ctx.beginPath();ctx.ellipse(x,y-1,r*0.85,r*0.55,0,0,7);ctx.fill();ctx.strokeStyle='#8a6a43';ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(x,y-1,r*0.5,r*0.32,0,0,7);ctx.stroke()}
// земля кусками 512×512: цвет земли и мелкие детали сведены в одну картинку (быстрее, чем два слоя на весь экран)
const CHUNK=512;
function terrainChunk(i,j){const key=i+','+j;let cv=WG.chunks.get(key);if(cv){WG.chunks.delete(key);WG.chunks.set(key,cv);return cv}
  cv=document.createElement('canvas');cv.width=CHUNK;cv.height=CHUNK;const g=cv.getContext&&cv.getContext('2d');
  if(g&&g.fillRect){g.fillStyle='#14324a';g.fillRect(0,0,CHUNK,CHUNK);const K=WG.texK;g.imageSmoothingEnabled=true;try{g.drawImage(WG.tex,i*CHUNK/K,j*CHUNK/K,CHUNK/K,CHUNK/K,0,0,CHUNK,CHUNK)}catch(e){}
    if(g.createPattern){const tl=LOOK.detailTile('neutral'),pt=tl&&tl.width?g.createPattern(tl,'repeat'):null;if(pt){g.fillStyle=pt;g.fillRect(0,0,CHUNK,CHUNK)}}}
  WG.chunks.set(key,cv);if(WG.chunks.size>30)WG.chunks.delete(WG.chunks.keys().next().value);return cv}
// трава, цветы, камушки — готовыми картинками
const TUFT={};
function drawTuft(x,y,s,kind,v){const vb=Math.floor(v*10)%10,sb=s<0.95?0:s<1.25?1:2,k=kind+'|'+vb+'|'+sb;
  let sp=TUFT[k];if(sp===undefined)sp=TUFT[k]=sprite50(28,20,14,14,2,()=>LOOK.tuft(0,0,[0.8,1.1,1.4][sb],kind,(vb+0.5)/10));
  if(!drawSpr(sp,x,y,1))LOOK.tuft(x,y,s,kind,v)}
// кусок ограды — готовой картинкой (своя на каждое место кольца)
const FSEG={};
function drawFenceSeg(sk,i,n){const k=sk+'|'+n+'|'+i;let sp=FSEG[k];
  if(sp===undefined){const a0=i/n*6.283,a1=(i+1)/n*6.283,am=(a0+a1)/2,R=CFG.fenceR,px=Math.cos(am)*R,py=Math.sin(am)*R;
    sp=FSEG[k]=sprite50(64,72,32,50,2,()=>LOOK.fenceSeg(-px,-py,R,sk,a0,a1,i));if(sp){sp.px=px;sp.py=py}}
  if(sp)drawSpr(sp,CX+sp.px,CY+sp.py,1);else LOOK.fenceSeg(CX,CY,CFG.fenceR,sk,i/n*6.283,(i+1)/n*6.283,i)}
// ратуша 4–6: готовая картинка + живые факелы и дым
const HQSPR={};
function drawHQ50(b,t,night){if(b<4){LOOK.HQ[b](t,night);return}const k=b+'|'+(night?1:0);
  let sp=HQSPR[k];if(sp===undefined){LOOK.setNoFx(true);sp=HQSPR[k]=sprite50(240,250,120,225,2,()=>LOOK.HQ[b](0,night));LOOK.setNoFx(false)}
  if(!drawSpr(sp,0,0,1))LOOK.HQ[b](t,night);else LOOK.hqFx(b,t)}
