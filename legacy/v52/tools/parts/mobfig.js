// --- облики мертвецов и боссов (v42): человечки в стиле героев, боссы с эффектами
const MOB=(()=>{let c=null;const HO='#24180f';
function hp(fn,fill,lw=1.1){c.beginPath();fn();if(fill){c.fillStyle=fill;c.fill()}c.strokeStyle=HO;c.lineWidth=lw;c.stroke()}
const ZN=['','Гнилец','Бродяга','Вурдалак','Нечисть','Лихо','Упырь','Мор'];
const SKIN=['','#a3ad80','#93a38a','#a596a8','#8a9a72','#9a8a9c','#b08878','#86a496'];
const CLO =['','#6f7d5a','#5d6e63','#6a5a6e','#4a3f55','#3a2c3c','#5a3a34','#3c4a44'];
const KCLO={runner:'#8f946c',ram:'#6b5038',spitter:'#4f7a52'};
const MAT={wood:['#8a6a43','#5a4128','#a8875a'],iron:['#8e959b','#4c5257','#c9d0d4'],gold:['#d8b44a','#8a6a1a','#ffe59a'],leather:['#7a5a3a','#4a3424','#9a7a52'],bone:['#e6dcc4','#8a8070','#fff8e6']};
function gearOf(k,t){
  if(k==='runner')return {helm:t>=6?'gold':t>=4?'leather':t>=2?'band':null,spikes:false,aura:t>=7};
  if(k==='spitter')return {mask:t>=6?'gold':t>=4?'iron':t>=2?'bone':null,spikes:t>=5,aura:t>=7};
  if(k==='ram')return {helm:t>=6?'gold':t>=4?'iron':'wood',spikes:t>=4,aura:t>=7,horns:true};
  return {helm:t>=6?'gold':t>=4?'iron':t>=2?'wood':null,shield:t>=7?'gold':t>=5?'iron':t>=3?'wood':null,spikes:t>=5,aura:t>=7};
}
function limb(x1,y1,x2,y2,w,col){c.lineCap='round';c.strokeStyle=HO;c.lineWidth=w+2.2;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function zFig(k,t,biome,x,y,s,dir=1,ph=0){
  const G=gearOf(k,t),sk=SKIN[t],cl=k?KCLO[k]:CLO[t],dark='rgba(0,0,0,.25)';
  const ram=k==='ram',run=k==='runner',spit=k==='spitter';
  c.save();c.translate(x,y);c.scale(s*dir,s);c.lineJoin='round';c.lineCap='round';
  if(biome==='mist')c.globalAlpha=0.78;
  // аура
  if(G.aura){const g=c.createRadialGradient(0,-4,2,0,-4,26);g.addColorStop(0,'rgba(120,255,170,.35)');g.addColorStop(1,'rgba(120,255,170,0)');c.fillStyle=g;c.beginPath();c.arc(0,-4,26,0,7);c.fill()}
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(0,12.5,ram?13:10,3.6,0,0,7);c.fill();
  if(run)c.rotate(0.2);
  const W=ram?1.35:run?0.85:1,hx=ram?2:1.5,hy=ram?-10:spit?-11:-12,hr=ram?6:7;
  // дальняя рука тянется вперёд
  const aw=ram?4.6:3.2;
  if(ram){limb(-2,-4,7,4,aw,sk);hp(()=>c.arc(7.5,5,3,0,7),sk,0.9)}else{limb(-1,-4,10,run?-1:-5,aw,sk);hp(()=>c.arc(10.5,run?-1:-5,2,0,7),sk,0.9)}
  // ноги
  const pants=ram?'#3a2c1c':'#3a3428';
  if(run){limb(-1,4,-6,11,3.4,pants);limb(1,4,5,11.5,3.4,pants)}
  else{limb(-3*W,4,-3.5*W,11.5,ram?4.6:3.4,pants);limb(2*W,4,2.5*W,10.5,ram?4.6:3.4,pants)}
  for(const [fx,fy] of run?[[-6.5,12],[6,12]]:[[-3.5*W,12],[3*W,11.3]]){hp(()=>c.ellipse(fx+1,fy,2.6*(ram?1.3:1),1.5,0,0,7),'#2a221a',0.8)}
  if(biome==='marsh'){c.fillStyle='#5a4a2a';c.fillRect(-6*W,8,12*W,4)}
  // тело
  const tor=()=>{c.moveTo(-7*W,-5);c.quadraticCurveTo(0,-8,6*W,-5);c.lineTo(7*W,5);c.lineTo(4*W,7.5);c.lineTo(1.5*W,6);c.lineTo(-1*W,8);c.lineTo(-4*W,6.3);c.lineTo(-8*W,7);c.closePath()};
  hp(tor,cl);
  c.save();c.beginPath();tor();c.clip();
  c.fillStyle=sk;c.beginPath();c.moveTo(2*W,-2);c.lineTo(6*W,0);c.lineTo(4*W,5);c.lineTo(1.5*W,3);c.closePath();c.fill();// дыра в рубахе
  if(t>=3){c.strokeStyle='rgba(60,30,30,.6)';c.lineWidth=0.8;for(let i=0;i<3;i++){c.beginPath();c.moveTo(2.4*W,-0.5+i*1.6);c.lineTo(5*W,0.3+i*1.6);c.stroke()}}
  c.fillStyle=dark;c.fillRect(-8*W,-6,4*W,14);
  if(t>=2&&!spit){c.fillStyle='rgba(255,255,255,.12)';c.fillRect(-4*W,-1,3*W,3);c.strokeStyle='rgba(30,20,10,.6)';c.lineWidth=0.6;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-4*W+i*1.2,-1.6);c.lineTo(-4*W+i*1.2,2.6);c.stroke()}}
  c.restore();
  if(spit){hp(()=>c.ellipse(2.5,2,7.5,6.5,0,0,7),'#7ab060');c.fillStyle='#d8e070';for(const [px,py,pr] of [[0,0,1.5],[4,3,1.2],[5,-1.5,1],[1,4,0.9]]){c.beginPath();c.arc(px,py,pr,0,7);c.fill()}c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.ellipse(0,-1,2.5,1.4,-0.4,0,7);c.fill()}
  hp(()=>c.rect(-7.5*W,3.2,15*W,1.8),'#5a4128',0.7);
  // наплечник с шипами
  if(G.spikes){const m=MAT[G.helm==='gold'||G.mask==='gold'?'gold':'iron'];hp(()=>{c.arc(3*W,-4.5,4*(ram?1.3:1),Math.PI,0);c.closePath()},m[0],0.9);c.fillStyle=m[2];for(const sx of [-1.5,1.5]){c.beginPath();c.moveTo(3*W+sx-1.3,-6.5);c.lineTo(3*W+sx*1.6,-11.5);c.lineTo(3*W+sx+1.3,-6.5);c.fill();c.strokeStyle=HO;c.lineWidth=0.7;c.stroke()}}
  // голова
  hp(()=>c.arc(hx,hy,hr,0,7),sk);
  c.fillStyle='rgba(0,0,0,.15)';c.beginPath();c.arc(hx-2,hy+1,hr*0.8,1.2,4.2);c.fill();
  if(!G.helm&&!spit){c.strokeStyle='#3a3020';c.lineWidth=0.9;for(let i=0;i<4;i++){c.beginPath();c.moveTo(hx-4+i*2,hy-hr+0.8);c.quadraticCurveTo(hx-6+i*2,hy-hr-2,hx-8+i*1.5,hy-hr+1+(i%2)*2);c.stroke()}}
  // шрам-шов
  if(t===2||t===5){c.strokeStyle='#4a2a2a';c.lineWidth=0.7;c.beginPath();c.moveTo(hx-3,hy-3);c.lineTo(hx+1,hy-5);c.stroke();for(let i=0;i<3;i++){c.beginPath();c.moveTo(hx-2.5+i*1.3,hy-4.6+i*0.6);c.lineTo(hx-2+i*1.3,hy-2.8+i*0.6);c.stroke()}}
  // глаза: впалые, светятся
  const ec=t>=6?'#ffe066':t>=4?'#ff7a3a':'#ff5a44';
  for(const [ex,ey,er] of [[hx+1.3,hy-1.2,1.6],[hx+4.3,hy-1.6,1.9]]){c.fillStyle='#1a1010';c.beginPath();c.ellipse(ex,ey,er+0.6,er+0.3,0,0,7);c.fill();const g=c.createRadialGradient(ex,ey,0.2,ex,ey,er*2.2);g.addColorStop(0,ec);g.addColorStop(1,'rgba(255,90,60,0)');c.fillStyle=g;c.beginPath();c.arc(ex,ey,er*2.2,0,7);c.fill();c.fillStyle='#fff3c0';c.beginPath();c.arc(ex+0.3,ey-0.2,er*0.45,0,7);c.fill()}
  // рот
  if(spit){hp(()=>c.ellipse(hx+4,hy+3,2.4,2,0,0,7),'#2a1010',0.8);c.fillStyle='#9adf60';c.beginPath();c.moveTo(hx+3.5,hy+4.5);c.quadraticCurveTo(hx+5,hy+8,hx+4,hy+9);c.quadraticCurveTo(hx+3,hy+7,hx+3.5,hy+4.5);c.fill()}
  else{c.fillStyle='#2a1010';c.beginPath();c.moveTo(hx+0.5,hy+2.8);c.lineTo(hx+6,hy+2.2);c.lineTo(hx+5.5,hy+4);c.lineTo(hx+1,hy+4.3);c.closePath();c.fill();c.fillStyle='#efe6cc';for(let i=0;i<3;i++)c.fillRect(hx+1.4+i*1.5,hy+2.6,0.9,1)}
  // маска плевуна
  if(G.mask){const m=MAT[G.mask];hp(()=>{c.moveTo(hx-0.5,hy-4);c.quadraticCurveTo(hx+5,hy-5.5,hx+7.2,hy-2);c.lineTo(hx+7,hy+1.5);c.lineTo(hx+0.5,hy+1.5);c.closePath()},m[0],0.9);
    c.fillStyle='#1a1010';c.beginPath();c.ellipse(hx+2,hy-1.6,1.2,1,0,0,7);c.ellipse(hx+5,hy-1.8,1.3,1,0,0,7);c.fill();c.fillStyle=ec;c.beginPath();c.arc(hx+2,hy-1.6,0.6,0,7);c.arc(hx+5,hy-1.8,0.6,0,7);c.fill();
    if(G.mask==='iron'){c.strokeStyle=m[1];c.lineWidth=0.6;for(let i=0;i<3;i++){c.beginPath();c.moveTo(hx+1+i*2,hy-0.2);c.lineTo(hx+1+i*2,hy+1.4);c.stroke()}}
    if(G.mask==='gold'){c.fillStyle='#c43a2c';c.beginPath();c.arc(hx+3.5,hy-4.4,1,0,7);c.fill()}}
  // шлемы
  const hm=G.helm;
  if(hm==='band'){hp(()=>c.rect(hx-hr,hy-3.6,hr*2,2.2),'#a8322a',0.8);c.fillStyle='#a8322a';c.beginPath();c.moveTo(hx-hr,hy-3);c.quadraticCurveTo(hx-hr-5,hy-2,hx-hr-7,hy+1);c.lineTo(hx-hr-5,hy-1);c.quadraticCurveTo(hx-hr-3,hy-2.5,hx-hr,hy-1.6);c.fill()}
  if(hm==='leather'){const m=MAT.leather;hp(()=>{c.arc(hx,hy-1,hr+0.6,Math.PI,0);c.closePath()},m[0]);hp(()=>c.ellipse(hx-4,hy+1.5,2,3.5,0.2,0,7),m[0],0.8);c.strokeStyle=m[2];c.lineWidth=0.7;c.beginPath();c.arc(hx,hy-1,hr-1.5,Math.PI+0.3,-0.3);c.stroke()}
  if(hm==='wood'||hm==='iron'||hm==='gold'){const m=MAT[hm];
    hp(()=>{c.arc(hx,hy-1.5,hr+0.9,Math.PI,0);c.closePath()},m[0]);hp(()=>c.rect(hx-hr-1.5,hy-2.6,hr*2+3,2.4),m[1],0.8);
    if(hm==='wood'){c.strokeStyle=m[1];c.lineWidth=0.7;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(hx+i*2.5,hy-2.5);c.lineTo(hx+i*2,hy-hr-1.5);c.stroke()}}
    if(hm==='iron'){c.fillStyle=m[2];for(let i=-2;i<=2;i++){c.beginPath();c.arc(hx+i*2.6,hy-1.4,0.55,0,7);c.fill()}hp(()=>c.rect(hx+3.3,hy-2,1.6,4.2),m[1],0.6);c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.ellipse(hx-2,hy-5.5,2,1.2,-0.4,0,7);c.fill()}
    if(hm==='gold'){c.fillStyle='rgba(255,255,255,.45)';c.beginPath();c.ellipse(hx-2,hy-5.5,2,1.2,-0.4,0,7);c.fill();hp(()=>{c.moveTo(hx-1.5,hy-hr-1.5);c.quadraticCurveTo(hx-6,hy-hr-8,hx-11,hy-hr-4);c.quadraticCurveTo(hx-6,hy-hr-4,hx+1.5,hy-hr-0.5);c.closePath()},'#c43a2c',0.8);c.fillStyle='#c43a2c';c.beginPath();c.arc(hx+0.5,hy-1.4,1,0,7);c.fill()}}
  if(G.horns){const hc=G.helm==='gold'?'#fff2c8':'#e8dcc0';for(const sd of [-1,1]){hp(()=>{c.moveTo(hx+sd*4,hy-4.5);c.quadraticCurveTo(hx+sd*11,hy-6,hx+sd*10.5,hy-13);c.quadraticCurveTo(hx+sd*8,hy-8.5,hx+sd*3,hy-7.5);c.closePath()},hc,0.8)}}
  // щит в ближней руке
  if(G.shield){const m=MAT[G.shield];limb(1,-4,8,-1,3.2,sk);hp(()=>c.ellipse(10,0.5,4.6,7.6,0,0,7),m[0]);hp(()=>c.ellipse(10,0.5,3.2,5.8,0,0,7),null,0.6);hp(()=>c.arc(10.4,0.5,1.6,0,7),G.shield==='wood'?'#9aa3aa':m[2],0.7);
    if(G.shield==='wood'){c.strokeStyle=m[1];c.lineWidth=0.6;c.beginPath();c.moveTo(8,-6);c.lineTo(8,7);c.moveTo(12,-6);c.lineTo(12,7);c.stroke()}
    if(G.shield==='gold'){c.fillStyle='#c43a2c';c.beginPath();c.moveTo(10.4,-5);c.lineTo(11.6,-2.5);c.lineTo(9.2,-2.5);c.fill()}}
  else if(ram){limb(3,-4,11,3,aw,sk);hp(()=>c.arc(11.8,4.2,3.4,0,7),sk,0.9);c.strokeStyle=HO;c.lineWidth=0.6;c.beginPath();c.moveTo(10.5,2.5);c.lineTo(10.8,5.5);c.moveTo(12.3,2.4);c.lineTo(12.6,5.6);c.stroke();if(t>=4){hp(()=>c.rect(5.5,-1.6,3.6,2.4),MAT[G.helm][0],0.6)}}else{limb(1,-4,12,run?1:-3,aw,sk);hp(()=>c.arc(12.5,run?1:-3,2.1,0,7),sk,0.9);c.strokeStyle=HO;c.lineWidth=0.6;c.beginPath();c.moveTo(13,run?0:-4);c.lineTo(14.8,run?-0.5:-4.5);c.moveTo(13.2,run?1.4:-2.6);c.lineTo(15,run?1.6:-2.4);c.stroke()}
  // края
  if(biome==='snow'){c.fillStyle='rgba(240,250,255,.92)';c.beginPath();c.ellipse(hx,hy-hr+0.5,hr*0.9,2.2,0,0,7);c.fill();c.beginPath();c.ellipse(-3*W,-5.5,4,1.6,0,0,7);c.fill();c.fillStyle='#bfe6ff';for(const dx of [-3,0,3]){c.beginPath();c.moveTo(hx+dx-1,hy-hr+1.5);c.lineTo(hx+dx,hy-hr+4.5);c.lineTo(hx+dx+1,hy-hr+1.5);c.fill()}c.fillStyle='rgba(191,230,255,.25)';c.beginPath();c.arc(0,-2,16,0,7);c.fill()}
  if(biome==='marsh'){c.strokeStyle='#5d8a48';c.lineWidth=1.3;for(const [sx,sy,l] of [[hx-4,hy-5,8],[hx-1,hy-6,6],[-5*W,-5,9],[4*W,-5,7]]){c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx-1.5,sy+l*0.5,sx+0.5,sy+l);c.stroke()}c.fillStyle='#7aa65a';c.beginPath();c.arc(hx-4,hy-5.5,1.5,0,7);c.fill()}
  if(biome==='shroom'){hp(()=>c.rect(hx-1.2,hy-hr-3,2.4,3.5),'#e8dcc8',0.6);hp(()=>{c.arc(hx-0.5,hy-hr-2.5,5,Math.PI,0);c.closePath()},'#b05aa0',0.8);c.fillStyle='#fff';for(const [dx,dy] of [[-2.5,-4],[0.5,-5.5],[2.3,-3.5]]){c.beginPath();c.arc(hx-0.5+dx,hy-hr-2.5+dy+2,0.8,0,7);c.fill()}hp(()=>{c.arc(-4*W,-6,2.6,Math.PI,0);c.closePath()},'#c76fb0',0.6);c.fillStyle='rgba(230,180,255,.8)';for(let i=0;i<5;i++)c.fillRect(-8+i*4,-18+(i%2)*3,1.2,1.2)}
  if(biome==='waste'){hp(()=>{c.moveTo(-6*W,-5.5);c.quadraticCurveTo(0,-2,6*W,-5.5);c.lineTo(5*W,-2.5);c.quadraticCurveTo(0,0.5,-5*W,-2.5);c.closePath()},'#a8442a',0.8);c.fillStyle='#a8442a';c.beginPath();c.moveTo(-5*W,-3);c.lineTo(-10*W,2);c.lineTo(-6*W,0);c.fill();hp(()=>{c.arc(hx,hy-1,hr+0.4,Math.PI+0.3,-0.3);c.closePath()},'rgba(236,226,200,.9)',0.7)}
  if(biome==='high'){for(const [sx,sy,r] of [[-5*W,-6,3.2],[-1*W,-7.5,2.6],[4*W,-6.5,2.8]])hp(()=>{c.moveTo(sx-r,sy+1);c.lineTo(sx-r*0.4,sy-r);c.lineTo(sx+r*0.6,sy-r*0.7);c.lineTo(sx+r,sy+1);c.closePath()},'#8a867d',0.8)}
  if(biome==='mist'){c.globalAlpha=1;for(let i=0;i<3;i++){c.fillStyle='rgba(210,225,230,.35)';c.beginPath();c.ellipse(-2+i*3,10-i*2,10-i*2,3,0,0,7);c.fill()}const g=c.createRadialGradient(hx+3,hy-1.5,0.5,hx+3,hy-1.5,7);g.addColorStop(0,'rgba(180,255,220,.7)');g.addColorStop(1,'rgba(180,255,220,0)');c.fillStyle=g;c.beginPath();c.arc(hx+3,hy-1.5,7,0,7);c.fill()}
  c.restore();
}
// ===== боссы: стиль героев + эффекты =====
const glow=(x,y,r,col,a)=>{const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()};
const shadow=(w,y=22)=>{c.fillStyle='rgba(0,0,0,.32)';c.beginPath();c.ellipse(0,y,w,w*0.28,0,0,7);c.fill()};
const eye=(x,y,r,col,glowC)=>{c.fillStyle='#140a08';c.beginPath();c.ellipse(x,y,r+0.7,r+0.4,0,0,7);c.fill();if(glowC)glow(x,y,r*3,glowC,0.6);c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+r*0.3,y-r*0.35,r*0.35,0,7);c.fill()};
const BOSS={
slime(t){ // Королева слизи
  shadow(26);
  for(let i=0;i<5;i++){const q=((t*0.6+i*0.21)%1),x=-18+i*9;c.fillStyle=`rgba(120,220,90,${0.8*(1-q)})`;c.beginPath();c.ellipse(x,14+q*10,1.6,2.6,0,0,7);c.fill()}
  const blob=()=>{c.moveTo(-26,18);c.quadraticCurveTo(-30,-6,-12,-16);c.quadraticCurveTo(0,-22,12,-16);c.quadraticCurveTo(30,-6,26,18);c.quadraticCurveTo(20,22,14,18);c.quadraticCurveTo(8,24,2,19);c.quadraticCurveTo(-6,24,-12,19);c.quadraticCurveTo(-20,23,-26,18)};
  hp(blob,'rgba(110,200,80,.92)',1.4);
  c.save();c.beginPath();blob();c.clip();glow(-4,4,26,'40,120,30',0.5);c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-12,-9,7,3.5,-0.5,0,7);c.fill();
  c.strokeStyle='rgba(210,255,190,.6)';c.lineWidth=0.9;for(const [bx,by,br] of [[-14,8,2.5],[10,10,2],[16,-2,1.6],[-4,14,1.4]]){c.beginPath();c.arc(bx,by,br,0,7);c.stroke()}c.restore();
  eye(3,-3,3.2,'#1e3a10');eye(13,-3.5,3.6,'#1e3a10');c.strokeStyle=HO;c.lineWidth=1.2;c.beginPath();c.moveTo(4,5);c.quadraticCurveTo(9,9,15,4.5);c.stroke();c.fillStyle='rgba(230,90,90,.35)';c.beginPath();c.arc(18,1,2.2,0,7);c.fill();
  c.save();c.translate(-1,-19);c.rotate(-0.12);hp(()=>{c.moveTo(-9,4);c.lineTo(-10,-7);c.lineTo(-5,-2);c.lineTo(0,-10);c.lineTo(5,-2);c.lineTo(10,-7);c.lineTo(9,4);c.closePath()},'#f4c766',1);c.fillStyle='#c43a2c';c.beginPath();c.arc(0,0,1.8,0,7);c.fill();c.fillStyle='#7ec8ff';c.beginPath();c.arc(-6,1,1.2,0,7);c.arc(6,1,1.2,0,7);c.fill();c.restore();
  const sp=(t*1.3)%1;c.fillStyle=`rgba(255,250,200,${1-sp})`;c.save();c.translate(8,-28);c.rotate(sp*2);c.fillRect(-0.6,-3.5,1.2,7);c.fillRect(-3.5,-0.6,7,1.2);c.restore()},
treant(t){ // Древень
  shadow(24);
  for(let i=0;i<6;i++){const q=((t*0.25+i/6)%1),x=-26+((i*37)%52)+Math.sin(t*2+i)*6,y=-46+q*68;c.save();c.translate(x,y);c.rotate(t*2+i);c.globalAlpha=1-q*0.7;hp(()=>c.ellipse(0,0,3,1.6,0,0,7),['#7aa83a','#c9a23a','#9ac04a'][i%3],0.6);c.restore()}c.globalAlpha=1;
  for(const [x1,x2] of [[-6,-14],[6,14]])hp(()=>{c.moveTo(x1-4,6);c.quadraticCurveTo(x1*1.6,16,x2,21);c.lineTo(x2+(x2<0?5:-5),21);c.quadraticCurveTo(x1,14,x1+4,6);c.closePath()},'#5a3e26');
  hp(()=>{c.moveTo(-11,10);c.lineTo(-9,-18);c.quadraticCurveTo(0,-22,9,-18);c.lineTo(11,10);c.quadraticCurveTo(0,14,-11,10)},'#6b4a2c',1.3);
  c.strokeStyle='#4a3020';c.lineWidth=1;for(const x of [-6,-1,5]){c.beginPath();c.moveTo(x,-16);c.quadraticCurveTo(x+2,-4,x-1,9);c.stroke()}
  c.fillStyle='#5d8a3a';c.beginPath();c.ellipse(-8,4,4,2.5,0.4,0,7);c.fill();
  hp(()=>{c.moveTo(-9,-10);c.quadraticCurveTo(-20,-14,-24,-4);c.lineTo(-21,-3);c.quadraticCurveTo(-18,-9,-9,-6);c.closePath()},'#5a3e26');
  hp(()=>{c.moveTo(9,-10);c.quadraticCurveTo(22,-12,26,-2);c.lineTo(23,-1);c.quadraticCurveTo(19,-7,9,-6);c.closePath()},'#5a3e26');
  for(const [x,y,r,col] of [[-16,-28,11,'#3f6a2a'],[14,-30,12,'#3f6a2a'],[0,-38,14,'#4a7a32'],[-8,-24,10,'#5a8a3a'],[8,-24,10,'#5a8a3a'],[2,-30,9,'#6a9a42']])hp(()=>c.arc(x,y,r,0,7),col,1.1);
  c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.arc(-4,-42,6,0,7);c.fill();
  c.fillStyle='#24180f';c.beginPath();c.ellipse(1,-8,8,6,0,0,7);c.fill();eye(-2,-9,1.8,'#ffd34d','255,210,80');eye(4.5,-9,1.8,'#ffd34d','255,210,80');c.strokeStyle='#ffd34d';c.lineWidth=0.8;c.beginPath();c.moveTo(-2,-4.5);c.quadraticCurveTo(1,-3,4,-4.5);c.stroke()},
hydra(t){ // Двуглавая гидра
  c.strokeStyle='rgba(150,210,230,.6)';c.lineWidth=1.4;for(let k=0;k<2;k++){const q=(t*0.5+k*0.5)%1;c.globalAlpha=1-q;c.beginPath();c.ellipse(0,20,24+q*14,6+q*4,0,0,7);c.stroke()}c.globalAlpha=1;
  c.fillStyle='rgba(60,120,140,.55)';c.beginPath();c.ellipse(0,20,26,7,0,0,7);c.fill();
  hp(()=>{c.moveTo(-26,16);c.quadraticCurveTo(-30,4,-18,2);c.quadraticCurveTo(0,-2,18,4);c.quadraticCurveTo(28,10,22,18);c.quadraticCurveTo(0,24,-26,16)},'#2f7a6e',1.3);
  c.fillStyle='#8fd0b0';c.beginPath();c.ellipse(0,15,16,3,0,0,7);c.fill();
  const head=(bx,by,hx,hy,a)=>{c.lineCap='round';c.strokeStyle=HO;c.lineWidth=10;c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo((bx+hx)/2-6,(by+hy)/2,hx,hy);c.stroke();c.strokeStyle='#3a9a88';c.lineWidth=7.6;c.stroke();c.strokeStyle='#8fd0b0';c.lineWidth=2.2;c.beginPath();c.moveTo(bx+2,by);c.quadraticCurveTo((bx+hx)/2-3,(by+hy)/2,hx+2,hy+2);c.stroke();
    c.save();c.translate(hx,hy);c.rotate(a);hp(()=>{c.moveTo(-6,-5);c.quadraticCurveTo(4,-7,12,-2);c.lineTo(13,1);c.quadraticCurveTo(4,6,-6,5);c.closePath()},'#3a9a88');for(const s of [-1,0,1])hp(()=>{c.moveTo(-5,-4+s);c.lineTo(-11,-9+s*3);c.lineTo(-3,-1);c.closePath()},'#2a6a5e',0.7);
    c.fillStyle='#f0ead8';for(let i=0;i<3;i++){c.beginPath();c.moveTo(4+i*3,1.5);c.lineTo(5.5+i*3,4);c.lineTo(7+i*3,1.5);c.fill()}eye(3,-2.5,1.7,'#ffd34d','255,220,80');c.restore()};
  head(-8,2,-14,-26,-0.3);head(6,2,14,-22,0.15);
  for(let i=0;i<7;i++){const q=((t*0.9+i/7)%1),a=-1.4+i*0.4;c.fillStyle=`rgba(170,225,240,${0.9*(1-q)})`;c.beginPath();c.arc(Math.cos(a)*(20+q*16),10-q*20+q*q*24,1.5,0,7);c.fill()}},
croc(t){ // Болотный ящер
  c.fillStyle='rgba(70,80,40,.6)';c.beginPath();c.ellipse(0,18,32,7,0,0,7);c.fill();
  for(let i=0;i<4;i++){const q=((t*0.7+i/4)%1);c.strokeStyle=`rgba(190,210,120,${0.8*(1-q)})`;c.lineWidth=1;c.beginPath();c.arc(-22+i*14,16-q*6,1.5+q*2.5,0,7);c.stroke()}
  hp(()=>{c.moveTo(-14,4);c.quadraticCurveTo(-30,4,-40,12);c.quadraticCurveTo(-28,12,-14,12);c.closePath()},'#4a7a3a');
  for(const lx of [-10,-2,8,14])hp(()=>c.rect(lx,8,4.5,10),'#3e6a32',0.9);
  hp(()=>{c.moveTo(-16,2);c.quadraticCurveTo(-6,-10,10,-8);c.quadraticCurveTo(18,-7,20,-4);c.lineTo(36,-2);c.quadraticCurveTo(40,0,36,3);c.lineTo(20,5);c.quadraticCurveTo(12,13,-8,12);c.quadraticCurveTo(-18,10,-16,2)},'#5a8a42',1.3);
  c.fillStyle='#c9c07a';c.beginPath();c.ellipse(-2,10,12,2.4,0,0,7);c.fill();
  c.fillStyle='#3a5a2a';for(let i=0;i<6;i++){c.beginPath();c.moveTo(-12+i*5,-4+Math.abs(i-2)*0.6);c.lineTo(-10+i*5,-9+Math.abs(i-2)*0.8);c.lineTo(-8+i*5,-4+Math.abs(i-2)*0.6);c.fill()}
  c.fillStyle='#f0ead8';for(let i=0;i<6;i++){c.beginPath();c.moveTo(21+i*2.5,3);c.lineTo(22+i*2.5,5.6);c.lineTo(23+i*2.5,3);c.fill()}
  hp(()=>c.arc(17,-8,3.6,Math.PI,0),'#5a8a42',0.9);eye(17,-8.5,1.7,'#ffd34d','255,220,80');c.fillStyle='#24180f';c.fillRect(16.6,-10,0.8,3);c.fillStyle='#24180f';c.beginPath();c.arc(35,-2,0.9,0,7);c.fill();
  c.fillStyle='rgba(90,74,42,.8)';for(const [x,y] of [[-6,6],[4,8],[12,-2]]){c.beginPath();c.ellipse(x,y,2.4,1.4,0,0,7);c.fill()}},
dragon(t){ // Крылатый змей
  c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(0,26,30,7,0,0,7);c.fill();
  const fl=Math.sin(t*5)*4;
  for(const [s,col] of [[-1,'#8a2020'],[1,'#a82a24']]){c.save();hp(()=>{c.moveTo(-4,-6);c.lineTo(-14+s*2,-34-fl);c.lineTo(-22,-28-fl);c.lineTo(-30,-16-fl*0.5);c.quadraticCurveTo(-24,-12,-20,-6);c.quadraticCurveTo(-14,-8,-8,-2);c.closePath()},col,1.2);c.strokeStyle='rgba(40,0,0,.5)';c.lineWidth=0.8;c.beginPath();c.moveTo(-4,-6);c.lineTo(-22,-28-fl);c.moveTo(-6,-5);c.lineTo(-30,-16-fl*0.5);c.stroke();c.restore();c.translate(6,2)}c.translate(-12,-4);
  hp(()=>{c.moveTo(-14,2);c.quadraticCurveTo(-28,8,-36,0);c.quadraticCurveTo(-30,4,-26,0);c.quadraticCurveTo(-20,-2,-12,-4);c.closePath()},'#b83a2a');hp(()=>{c.moveTo(-38,1);c.lineTo(-33,-4);c.lineTo(-33,4);c.closePath()},'#f4c766',0.8);
  hp(()=>c.ellipse(-2,0,14,9,0,0,7),'#c0402e',1.3);c.fillStyle='#f0b070';c.beginPath();c.ellipse(-1,5,10,3,0,0,7);c.fill();
  for(const lx of [-8,4])hp(()=>{c.moveTo(lx,6);c.lineTo(lx-1,15);c.lineTo(lx+4,15);c.lineTo(lx+3,6);c.closePath()},'#a83424',0.9);
  c.lineCap='round';c.strokeStyle=HO;c.lineWidth=9;c.beginPath();c.moveTo(8,-3);c.quadraticCurveTo(14,-12,16,-18);c.stroke();c.strokeStyle='#c0402e';c.lineWidth=6.6;c.stroke();
  c.save();c.translate(17,-20);hp(()=>{c.moveTo(-5,-4);c.quadraticCurveTo(4,-6,13,-2);c.lineTo(13,2);c.quadraticCurveTo(4,5,-5,4);c.closePath()},'#c0402e');for(const s of [-1,1])hp(()=>{c.moveTo(-3,-3*s*0+(-3));c.quadraticCurveTo(-9,-9,-12,-11+s*2);c.quadraticCurveTo(-7,-6,-1,-2);c.closePath()},'#f4c766',0.7);
  eye(3,-1.5,1.6,'#ffd34d','255,200,60');c.fillStyle='#24180f';c.beginPath();c.arc(12,-0.5,0.7,0,7);c.fill();
  for(let i=0;i<7;i++){const q=((t*1.2+i/7)%1);c.fillStyle=`rgba(${i%2?'255,170,60':'120,110,100'},${0.8*(1-q)})`;c.beginPath();c.arc(14+q*14,1-q*10+Math.sin(i*3)*3,i%2?1.3:3+q*3,0,7);c.fill()}c.restore()},
golem(t){ // Пепельный голем
  shadow(26);const pu=0.5+0.5*Math.sin(t*3);
  for(const [x,w] of [[-12,9],[4,9]])hp(()=>c.rect(x,6,w,15),'#4a4642');
  hp(()=>{c.moveTo(-20,-16);c.lineTo(18,-18);c.lineTo(22,8);c.lineTo(-22,9);c.closePath()},'#56524c',1.4);
  hp(()=>c.rect(-8,-30,17,14),'#625e57',1.2);
  for(const [x,y,w,h] of [[-30,-16,11,22],[20,-18,11,22]])hp(()=>c.rect(x,y,w,h),'#4e4a45',1.2);
  for(const [x,y] of [[-29,7],[21,5]])hp(()=>c.rect(x,y,13,9),'#5c5852',1.1);
  glow(0,-6,30,'255,120,40',0.18+pu*0.15);
  c.strokeStyle=`rgba(255,${140+pu*60},50,1)`;c.lineWidth=2;c.lineCap='round';for(const pts of [[[-12,-12],[-4,-4],[-8,4]],[[-4,-4],[8,-8],[12,0]],[[14,-14],[10,-8]],[[-26,-10],[-23,-2]],[[24,-12],[26,-4]]]){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
  c.fillStyle='rgba(255,255,255,.08)';c.fillRect(-20,-15,18,4);
  for(const ex of [-3,4]){glow(ex,-24,6,'255,140,40',0.8);c.fillStyle='#ffd34d';c.fillRect(ex-1.6,-25,3.2,2)}
  for(let i=0;i<6;i++){const q=((t*0.8+i/6)%1);c.fillStyle=`rgba(255,${150+i*15},60,${1-q})`;c.fillRect(-14+i*6+Math.sin(t*3+i)*3,-8-q*34,1.6,1.6)}},
lich(t){ // Царь Мор
  shadow(20);
  for(let i=0;i<4;i++){const a=t*1.4+i*Math.PI/2,x=Math.cos(a)*28,y=-8+Math.sin(a)*10;glow(x,y,7,'120,255,170',0.6);c.fillStyle='rgba(200,255,220,.9)';c.beginPath();c.arc(x,y,1.8,0,7);c.fill();c.strokeStyle='rgba(120,255,170,.4)';c.lineWidth=1.4;c.beginPath();c.arc(0,-8,28,a-0.6,a);c.stroke()}
  hp(()=>{c.moveTo(-6,-14);c.quadraticCurveTo(-18,4,-20,20);c.quadraticCurveTo(-8,23,0,20);c.quadraticCurveTo(10,23,18,20);c.quadraticCurveTo(14,4,6,-14);c.closePath()},'#2a2438',1.3);
  c.strokeStyle='#5a4a78';c.lineWidth=1;c.beginPath();c.moveTo(0,-12);c.lineTo(-1,20);c.stroke();c.fillStyle='#7ae0a0';for(let i=0;i<3;i++){c.beginPath();c.arc(-1,-4+i*7,1,0,7);c.fill()}
  hp(()=>{c.moveTo(-8,-14);c.quadraticCurveTo(0,-18,8,-14);c.lineTo(10,-9);c.lineTo(-10,-9);c.closePath()},'#3a3050',1);
  c.strokeStyle='#7a5530';c.lineWidth=2.4;c.beginPath();c.moveTo(14,22);c.lineTo(16,-26);c.stroke();glow(16,-29,10,'120,255,170',0.8);hp(()=>c.arc(16,-29,3,0,7),'#7ae0a0',0.8);
  hp(()=>c.arc(11,-8,2.6,0,7),'#e6dcc4',0.8);
  hp(()=>{c.arc(1,-21,7.5,0,7)},'#e6dcc4');c.fillStyle='#140a08';c.beginPath();c.moveTo(-1,-15);c.lineTo(6,-15);c.lineTo(5,-13);c.lineTo(0,-13);c.closePath();c.fill();c.fillStyle='#efe6cc';for(let i=0;i<3;i++)c.fillRect(0.2+i*1.8,-15,1,1.5);
  for(const ex of [0.5,5])eye(ex,-21,1.5,'#7ae0a0','120,255,170');
  hp(()=>{c.moveTo(-7,-26);c.lineTo(-8,-35);c.lineTo(-3,-30);c.lineTo(1,-37);c.lineTo(5,-30);c.lineTo(9,-34);c.lineTo(8,-26);c.closePath()},'#f4c766',1);c.fillStyle='#7ae0a0';c.beginPath();c.arc(1,-29,1.2,0,7);c.fill()},
yeti(t){ // Ледяной великан
  for(let i=0;i<10;i++){const q=((t*0.2+i/10)%1),x=-34+((i*29)%68)+Math.sin(t+i)*4,y=-50+q*72;c.save();c.translate(x,y);c.rotate(t+i);c.strokeStyle=`rgba(255,255,255,${0.9*(1-q*0.6)})`;c.lineWidth=0.8;for(let k=0;k<3;k++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(-2.2,0);c.lineTo(2.2,0);c.stroke()}c.restore()}
  shadow(26);c.fillStyle='rgba(191,230,255,.35)';c.beginPath();c.ellipse(0,21,30,7,0,0,7);c.fill();
  for(const x of [-12,4])hp(()=>c.roundRect(x,6,9,15,3),'#e8eef4');
  const fur=()=>{c.moveTo(-20,10);for(let i=0;i<=10;i++){const a=Math.PI+i*Math.PI/10,r=22+(i%2)*3;c.lineTo(Math.cos(a)*r,-6+Math.sin(a)*r*1.05)}c.lineTo(20,10);c.quadraticCurveTo(0,16,-20,10)};
  hp(fur,'#f2f6fa',1.3);c.fillStyle='rgba(150,180,210,.35)';c.beginPath();c.ellipse(-8,0,8,12,0,0,7);c.fill();
  for(const [x,y] of [[-26,-8],[24,-10]]){hp(()=>c.ellipse(x,y+6,7,13,0,0,7),'#e8eef4');hp(()=>c.arc(x,y+18,6,0,7),'#8fb4d8')}
  for(const [x,h] of [[-16,10],[-11,14],[12,13],[17,9]])hp(()=>{c.moveTo(x-3,-18);c.lineTo(x,-18-h);c.lineTo(x+3,-18);c.closePath()},'#bfe6ff',0.9);
  hp(()=>c.ellipse(4,-12,9,7.5,0,0,7),'#7aa6d0');
  for(const ex of [1,8])eye(ex,-13.5,1.7,'#e8f8ff','160,220,255');
  c.fillStyle='#24180f';c.beginPath();c.ellipse(5,-7.5,4,2,0,0,7);c.fill();c.fillStyle='#fff';c.fillRect(2.5,-9,1.4,2);c.fillRect(6.5,-9,1.4,2);
  for(let i=0;i<4;i++){const q=((t*0.8+i/4)%1);c.fillStyle=`rgba(230,245,255,${0.6*(1-q)})`;c.beginPath();c.arc(12+q*14,-8-q*4,2.5+q*4,0,7);c.fill()}},
lord(t){ // Владыка Мора
  c.save();c.scale(1,0.38);c.translate(0,58);c.rotate(t*0.5);c.strokeStyle='rgba(255,60,40,.75)';c.lineWidth=2;c.beginPath();c.arc(0,0,40,0,7);c.stroke();c.lineWidth=1;c.beginPath();c.arc(0,0,33,0,7);c.stroke();
    c.fillStyle='rgba(255,90,60,.9)';for(let i=0;i<10;i++){c.save();c.rotate(i*Math.PI/5);c.translate(36.5,0);c.rotate(Math.PI/2);c.fillRect(-0.8,-3,1.6,6);c.fillRect(-2.5,-0.8,5,1.6);c.restore()}c.restore();
  glow(0,-6,48,'90,10,20',0.55);
  hp(()=>{c.moveTo(-10,-16);c.quadraticCurveTo(-30,0,-30,22);c.lineTo(-20,18);c.lineTo(-14,23);c.lineTo(-6,19);c.lineTo(2,23);c.lineTo(10,19);c.lineTo(18,23);c.lineTo(26,20);c.quadraticCurveTo(22,0,10,-16);c.closePath()},'#3a0e14',1.4);
  hp(()=>{c.moveTo(-8,-14);c.quadraticCurveTo(-18,4,-18,20);c.quadraticCurveTo(0,23,16,20);c.quadraticCurveTo(14,4,8,-14);c.closePath()},'#5a1420',1.2);
  c.strokeStyle='#c9a24a';c.lineWidth=1.2;c.beginPath();c.moveTo(-1,-12);c.lineTo(-1,20);c.stroke();c.fillStyle='#ff5a3a';glow(-1,-2,7,'255,80,50',0.7);c.beginPath();c.moveTo(-1,-6);c.lineTo(2,-2);c.lineTo(-1,2);c.lineTo(-4,-2);c.fill();
  for(const sx of [-1,1])hp(()=>{c.moveTo(sx*6,-15);c.lineTo(sx*15,-24);c.lineTo(sx*13,-14);c.closePath()},'#2a2a30',0.9);
  c.strokeStyle='#2a1a14';c.lineWidth=2.6;c.beginPath();c.moveTo(18,22);c.lineTo(22,-30);c.stroke();hp(()=>{c.moveTo(22,-30);c.quadraticCurveTo(36,-34,40,-22);c.quadraticCurveTo(32,-28,22,-25);c.closePath()},'#b8bcc0',0.9);glow(22,-31,9,'255,70,50',0.8);hp(()=>c.arc(22,-31,2.6,0,7),'#ff5a3a',0.8);
  hp(()=>c.arc(17,-6,2.8,0,7),'#e6dcc4',0.8);
  hp(()=>c.arc(1,-22,8,0,7),'#e6dcc4');for(const sd of [-1,1])hp(()=>{c.moveTo(sd*5,-27);c.quadraticCurveTo(sd*16,-30,sd*15,-42);c.quadraticCurveTo(sd*12,-33,sd*3,-30);c.closePath()},'#2a2024',0.9);
  c.fillStyle='#140a08';c.beginPath();c.moveTo(-1,-16);c.lineTo(6,-16);c.lineTo(5,-14);c.lineTo(0,-14);c.closePath();c.fill();for(const ex of [0,5.5])eye(ex,-22,1.6,'#ff4a3a','255,60,40');
  const fl=Math.sin(t*8);glow(1,-34,14,'255,120,40',0.6);for(let i=0;i<5;i++){const x=-6+i*3;c.fillStyle=i%2?'#ffb347':'#ff6a2a';c.beginPath();c.moveTo(x-2,-29);c.quadraticCurveTo(x,-37-(i%2?3:0)-fl*1.5,x+0.5,-40-(i===2?4:0)-fl);c.quadraticCurveTo(x+2,-34,x+2,-29);c.fill()}
  hp(()=>{c.moveTo(-7,-28);c.lineTo(9,-28);c.lineTo(8,-31);c.lineTo(-6,-31);c.closePath()},'#c9a24a',0.9);
  for(let i=0;i<8;i++){const q=((t*0.7+i/8)%1);c.fillStyle=`rgba(255,${80+i*12},40,${1-q})`;c.fillRect(-24+i*7+Math.sin(t*2+i)*3,10-q*50,1.6,1.6)}},
mimic(t){ shadow(14,12);const o=3+Math.sin(t*6)*2;
  hp(()=>c.roundRect(-13,-2,26,13,2),'#7a5534',1.2);c.fillStyle='#c9a24a';c.fillRect(-13,1,26,2);
  c.fillStyle='#3a0a0a';c.beginPath();c.moveTo(-12,-2);c.lineTo(12,-2);c.lineTo(12,-2-o);c.lineTo(-12,-2-o*1.6);c.fill();
  c.fillStyle='#f0ead8';for(let i=0;i<6;i++){c.beginPath();c.moveTo(-11+i*4,-2);c.lineTo(-9+i*4,-5);c.lineTo(-7+i*4,-2);c.fill()}
  c.save();c.translate(0,-2-o*1.3);c.rotate(-0.12);hp(()=>c.roundRect(-13,-9,26,8,3),'#8a6240',1.2);c.fillStyle='#c9a24a';c.fillRect(-13,-4,26,2);c.fillStyle='#f0ead8';for(let i=0;i<6;i++){c.beginPath();c.moveTo(-11+i*4,-1);c.lineTo(-9+i*4,2);c.lineTo(-7+i*4,-1);c.fill()}eye(-4,-6,1.4,'#ffd34d','255,200,60');eye(5,-6,1.4,'#ffd34d','255,200,60');c.restore();
  hp(()=>{c.moveTo(2,-2);c.quadraticCurveTo(14,2,12,10);c.quadraticCurveTo(9,4,0,0);c.closePath()},'#c4505a',0.8)},
slimelet(t){ shadow(8,8);hp(()=>{c.moveTo(-9,7);c.quadraticCurveTo(-10,-6,0,-7);c.quadraticCurveTo(10,-6,9,7);c.quadraticCurveTo(0,10,-9,7)},'rgba(120,210,90,.92)',1.1);c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.ellipse(-3.5,-3,2.5,1.4,-0.5,0,7);c.fill();eye(1,-0.5,1.5,'#1e3a10');eye(5,-0.5,1.6,'#1e3a10')}
};

return {fig(ctx,k,t,biome,x,y,s,dir){c=ctx;zFig(k||null,t,biome||null,x,y,s,dir)},boss(ctx,sk,t){c=ctx;BOSS[sk](t)},has:sk=>!!BOSS[sk]};
})();
// готовые картинки рядовых мертвецов (рисуются один раз на вид, ярус, край, сторону)
const ZSPR={};
function zSprite(z,dir,hit){const k=z.kind||'',s=z.r/12,key=k+'|'+z.tier+'|'+(z.biome||'')+'|'+dir+'|'+(hit?1:0)+'|'+Math.round(z.r*4);if(key in ZSPR)return ZSPR[key];
  const Q=2,cv=document.createElement('canvas');cv.width=Math.ceil(64*s*Q);cv.height=Math.ceil(60*s*Q);const c=cv.getContext&&cv.getContext('2d');
  if(!c||!c.quadraticCurveTo||!c.roundRect)return ZSPR[key]=null;
  c.scale(s*Q,s*Q);MOB.fig(c,k,z.tier,z.biome,32,34,1,dir);
  if(hit){c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='rgba(255,250,235,.7)';c.fillRect(0,0,cv.width,cv.height)}
  return ZSPR[key]=cv}
const BOSS_TOP={slime:30,treant:52,hydra:36,croc:16,dragon:40,golem:32,lich:40,yeti:40,lord:48,mimic:14,slimelet:9};
const bossScale=z=>z.skin==='mimic'?z.r/13:z.skin==='slimelet'?z.r/9:z.r/24;
