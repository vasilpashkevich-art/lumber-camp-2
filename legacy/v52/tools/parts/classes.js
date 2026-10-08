/* ================= КЛАССЫ ГЕРОЯ ================= */
const CLASSES={
  warrior:{name:'Воин',  br:'Варвар',  col:'#d9784a',body:'#a8452a',weap:'Молот', abil:'Вихрь',        cd:8,  abilD:'крутится с оружием и бьёт всех вокруг',weapD:'тяжёлый удар по площади перед собой',set:'Доспех Варвара'},
  mage:   {name:'Маг',   br:'Чародей', col:'#8a7aff',body:'#5a3a8a',weap:'Посох', abil:'Огненный залп',cd:10, abilD:'3 огненных шара веером, поджигают',weapD:'стреляет маленьким огненным шаром, может поджечь',set:'Облачение Чародея'},
  archer: {name:'Лучник',br:'Следопыт',col:'#5fc98a',body:'#3e6a3a',weap:'Лук',   abil:'Град стрел',   cd:14, abilD:'10 с каждый выстрел — 3 стрелы',weapD:'дальний выстрел',set:'Снаряжение Следопыта'},
};
const cls=()=>S&&S.cls&&CLASSES[S.cls]?S.cls:null;
const secName=()=>cls()?CLASSES[cls()].weap:'Лук';
const brLabel=br=>br==='Воин'&&cls()?CLASSES[cls()].br:br;
Object.assign(BR_COL,{'Варвар':'#d9784a','Чародей':'#8a7aff','Следопыт':'#5fc98a'});
// умения ветки класса: общие получают своё имя, плюс уникальные
Object.assign(PERKS,{
  smash: {br:'Воин',cls:'warrior',name:'Раскол',       max:3,desc:'+20% к площади удара молотом'},
  mshield:{br:'Воин',cls:'mage',  name:'Мана-щит',     max:4,desc:'−6% получаемого урона'},
  flame: {br:'Воин',cls:'mage',   name:'Пламя',        max:4,desc:'+12% шанс поджога посохом'},
  eagle: {br:'Воин',cls:'archer', name:'Орлиный глаз', max:4,desc:'+6% шанс крита'},
  pierce:{br:'Воин',cls:'archer', name:'Пробивание',   max:2,desc:'Стрела задевает ещё одного врага рядом с целью'},
});
const PERK_NAMES={str:{warrior:'Ярость',mage:'Сила чар',archer:'Тугой лук'},vit:{warrior:'Крепкая шкура',mage:'Стойкость',archer:'Выносливость'},vamp:{warrior:'Кровожадность',mage:'Похищение жизни',archer:'Охотничий трофей'},aim:{warrior:'Размах',mage:'Сосредоточение',archer:'Меткость'}};
const PERK_DESC={aim:{warrior:'+10% к скорости удара молотом',mage:'+10% к дальности и скорости посоха'}};
const perkName=k=>(PERK_NAMES[k]&&PERK_NAMES[k][cls()])||PERKS[k].name;
const perkDesc=k=>(PERK_DESC[k]&&PERK_DESC[k][cls()])||PERKS[k].desc;
const perkAvail=k=>!PERKS[k].cls||PERKS[k].cls===cls();
// --- облики молота и посоха (уровни как у лука)
const HAM_SKINS=[{from:1,name:'Колотушка',h:'#8d6540',m:'#a07a4c',e:'#c9a06a'},{from:3,name:'Кузнечный молот',h:'#6e4a2c',m:'#8e959b',e:'#cfd8de'},{from:6,name:'Боевой молот',h:'#4a3322',m:'#9ea5aa',e:'#ffffff',sp:1},{from:9,name:'Рунный молот',h:'#3a2618',m:'#6a7a8a',e:'#7ec8ff',rune:1},{from:12,name:'Громовой молот',h:'#1e1410',m:'#c9a24a',e:'#fff7c0',bolt:1,glow:'rgba(126,200,255,'}];
const STF_SKINS=[{from:1,name:'Ясеневый посох',w:'#8d6540',o:'#86c05a',leaf:1},{from:3,name:'Посох с кристаллом',w:'#6e4a2c',o:'#9fc3d6'},{from:6,name:'Посох огня',w:'#4a3322',o:'#ff7a2a',glow:'rgba(255,140,40,'},{from:9,name:'Посох бури',w:'#2a2a3a',o:'#7ec8ff',glow:'rgba(126,200,255,',ring:1},{from:12,name:'Посох Феникса',w:'#5a1e12',o:'#ffd34d',glow:'rgba(255,180,60,',wing:1}];
const secSkins=()=>cls()==='warrior'?HAM_SKINS:cls()==='mage'?STF_SKINS:BOW_SKINS;
const secKind=()=>cls()==='warrior'?'ham':cls()==='mage'?'stf':'bow';
function drawHammerSkin(c,K,x,y,a,L,t){c.save();c.translate(x,y);c.rotate(a);if(K.glow){const p=0.4+0.2*Math.sin(t/160),g=c.createRadialGradient(L,0,2,L,0,20);g.addColorStop(0,K.glow+p+')');g.addColorStop(1,K.glow+'0)');c.fillStyle=g;c.beginPath();c.arc(L,0,20,0,7);c.fill()}
  c.strokeStyle=K.h;c.lineWidth=3.2;c.lineCap='round';c.beginPath();c.moveTo(3,0);c.lineTo(L+2,0);c.stroke();c.translate(L,0);
  c.fillStyle=K.m;c.fillRect(-6,-10,12,20);c.strokeStyle=K.e;c.lineWidth=1.3;c.strokeRect(-6,-10,12,20);
  if(K.sp){c.fillStyle=K.e;c.beginPath();c.moveTo(6,-4);c.lineTo(11,0);c.lineTo(6,4);c.fill()}
  if(K.rune){c.strokeStyle=K.e;c.lineWidth=1.2;c.beginPath();c.moveTo(-3,-6);c.lineTo(2,-2);c.lineTo(-2,2);c.lineTo(3,6);c.stroke()}
  if(K.bolt){c.strokeStyle='#7ec8ff';c.lineWidth=1.5;c.beginPath();c.moveTo(2,-12);c.lineTo(-2,-4);c.lineTo(2,-4);c.lineTo(-2,4);c.stroke()}
  c.restore()}
function drawStaffSkin(c,K,x,y,a,L,t){c.save();c.translate(x,y);c.rotate(a);c.strokeStyle=K.w;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(-4,0);c.lineTo(L,0);c.stroke();c.translate(L+4,0);
  if(K.glow){const p=0.5+0.2*Math.sin(t/180),g=c.createRadialGradient(0,0,1,0,0,16);g.addColorStop(0,K.glow+p+')');g.addColorStop(1,K.glow+'0)');c.fillStyle=g;c.beginPath();c.arc(0,0,16,0,7);c.fill()}
  if(K.ring){c.strokeStyle='#cfd8de';c.lineWidth=1.5;c.beginPath();c.arc(0,0,8,0,7);c.stroke()}
  if(K.wing){c.fillStyle='#e98b3d';for(const sd of [-1,1]){c.beginPath();c.moveTo(-3,0);c.quadraticCurveTo(-6,sd*12,4,sd*9);c.lineTo(0,sd*2);c.fill()}}
  if(K.leaf){c.fillStyle='#5a8a3a';c.beginPath();c.ellipse(-4,-5,5,2.5,0.6,0,7);c.fill();c.beginPath();c.ellipse(-4,5,5,2.5,-0.6,0,7);c.fill()}
  c.fillStyle=K.o;c.beginPath();c.arc(0,0,5,0,7);c.fill();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(-1.5,-1.5,1.6,0,7);c.fill();c.restore()}
// --- тело героя по классу
function drawHeroBody(c,x,y,cl,hurt,face){
  if(cl==='archer'){c.save();c.translate(x,y);c.rotate(face+Math.PI);c.fillStyle='#6b4a2c';c.fillRect(4,-4,12,8);c.fillStyle='#c9b48a';for(let i=0;i<3;i++)c.fillRect(14,-3+i*3,5,1.2);c.restore()}
  if(cl==='mage'){c.fillStyle='#3a2560';c.beginPath();c.arc(x,y+2,14,0,7);c.fill()}
  c.fillStyle=hurt?'#f0e6d0':cl?CLASSES[cl].body:'#c4672a';c.beginPath();c.arc(x,y,12,0,7);c.fill();
  if(cl==='warrior'){c.fillStyle='#d8cfb8';c.beginPath();c.arc(x,y+4,12,0.2,Math.PI-0.2);c.fill();c.fillStyle='#8e959b';c.beginPath();c.arc(x,y-3,8,0,7);c.fill();c.fillStyle='#4c5257';c.fillRect(x-1,y-3,2,7);c.fillStyle='#e8e0cc';for(const sd of [-1,1]){c.beginPath();c.moveTo(x+sd*6,y-7);c.quadraticCurveTo(x+sd*15,y-10,x+sd*14,y-2);c.lineTo(x+sd*9,y-4);c.fill()}}
  else if(cl==='mage'){c.fillStyle='#2a1a48';c.beginPath();c.arc(x,y-3,10,0,7);c.fill();c.fillStyle='#4a2f78';c.beginPath();c.moveTo(x-6,y-6);c.lineTo(x,y-20);c.lineTo(x+6,y-6);c.fill();c.fillStyle='#f4c766';c.beginPath();c.arc(x,y-19,1.8,0,7);c.fill();c.fillStyle='rgba(126,200,255,.9)';c.fillRect(x-4,y-4,2,2);c.fillRect(x+2,y-4,2,2)}
  else if(cl==='archer'){c.fillStyle='#2f4f2a';c.beginPath();c.arc(x,y-3,9,0,7);c.fill();c.fillStyle='#24401f';c.beginPath();c.moveTo(x-8,y-4);c.lineTo(x,y-15);c.lineTo(x+8,y-4);c.fill();c.fillStyle='#1a2a16';c.beginPath();c.arc(x,y-1,4.5,0,7);c.fill()}
  else{c.fillStyle='#2b2219';c.beginPath();c.arc(x,y-3,7,0,7);c.fill()}
}
// --- второе оружие: атака
function secAttack(t){
  const c=cls()||'archer',base=bowDmg(S.bow)*(1+0.12*pr('str'))*atkMul()*(1+0.2*S.forgeUp.bow);
  const crit4=(d,cr)=>{if(mast('cleave')&&(P.arrowN=(P.arrowN||0)+1)%4===0&&!cr){d*=2;cr=true}return [d,cr]};
  if(c==='warrior'){
    P.cd=bowCd(S.bow)*1.35/(1+gear('spd')/100)/(1+0.1*pr('aim'));P.swing=0.3;sfx.hit();
    let [d,cr]=crit4(...heroHit(base*1.5));hitEnemy(t,d,'melee',cr);
    const R=60*(1+0.2*pr('smash'));RX.rings.push({x:t.o.x,y:t.o.y,r:10,max:R,t:0.25,col:'#e8e0cc'});shake(2,0.08);
    if(t.k==='z')for(const o of zombies.slice()){if(o===t.o||dist(o.x,o.y,t.o.x,t.o.y)>R+o.r||!canHit(o,'melee'))continue;dmgNum(o.x,o.y-o.r-4,d*0.6,false);hitZombie(o,d*0.6,P.x,P.y,'melee')}
    twinShot(t,d,cr);return}
  P.cd=bowCd(S.bow)/(1+gear('spd')/100);P.shot=0.2;sfx.shoot();
  const lv=Math.min(6,1+Math.floor(S.bow/2));
  if(c==='mage'){tracers.push({x1:P.x,y1:P.y,x2:t.o.x,y2:t.o.y,t:0.18,mx:0.18,fire:true,lvl:lv});let [d,cr]=crit4(...heroHit(base*0.95));hitEnemy(t,d,'ranged',cr);
    if(t.k==='z'&&zombies.includes(t.o)&&Math.random()<0.15+0.12*pr('flame')){t.o.burn=3;t.o.burnDps=Math.max(t.o.burnDps||0,d*0.35)}twinShot(t,d,cr);return}
  // лучник
  tracers.push({x1:P.x,y1:P.y,x2:t.o.x,y2:t.o.y,t:0.12,lvl:lv});let [d,cr]=crit4(...heroHit(base));hitEnemy(t,d,'ranged',cr);twinShot(t,d,cr);
  const extra=(n,mul,near)=>{let k=0;for(const o of zombies.slice()){if(k>=n)break;if(o===t.o||!canHit(o,'ranged'))continue;if(near?dist(o.x,o.y,t.o.x,t.o.y)>70:dist(o.x,o.y,P.x,P.y)>bowRange(S.bow))continue;k++;tracers.push({x1:P.x,y1:P.y,x2:o.x,y2:o.y,t:0.12,lvl:lv});hitEnemy({k:'z',o},d*mul,'ranged',false)}};
  if(t.k==='z'&&pr('pierce'))extra(pr('pierce'),0.6,true);
  if(RX.volley>0&&t.k==='z')extra(2,0.7,false);
}
// --- способности класса (клавиша C)
const abilBase=()=>heroHit(Math.max(axeDmg(S.up.axe),S.bow?bowDmg(S.bow):0)*(1+0.12*pr('str'))*atkMul())[0];
function useAbility(){
  const c=cls();if(!c||S.over)return;
  if((P.abCd||0)>0){toast(`${CLASSES[c].abil}: ещё ${Math.ceil(P.abCd)} с`,'', 'abcd');return}
  if(c==='warrior'){RX.whirl=1.2;RX.whirlT=0;sfx.dash()}
  if(c==='mage'){let a=P.face,best=null,bd=460;for(const z of zombies){const d=dist(z.x,z.y,P.x,P.y);if(d<bd&&canHit(z,'ranged')){bd=d;best=z}}if(best)a=Math.atan2(best.y-P.y,best.x-P.x);
    const n=3+Math.floor(pr('mshield')>=4?0:0);for(let i=0;i<n;i++){const aa=a+(i-(n-1)/2)*0.32;RX.fb.push({x:P.x,y:P.y,vx:Math.cos(aa)*430,vy:Math.sin(aa)*430,t:1.1,d:abilBase()*2.5,a:aa})}sfx.shoot()}
  if(c==='archer'){RX.volley=10;toast('Град стрел: 10 секунд по 3 стрелы','good','abv')}
  P.abCd=CLASSES[c].cd;
}
function updAbility(dt){
  P.abCd=Math.max(0,(P.abCd||0)-dt);RX.volley=Math.max(0,(RX.volley||0)-dt);
  if(RX.whirl>0){RX.whirl-=dt;RX.whirlT-=dt;P.face+=dt*14;if(RX.whirlT<=0){RX.whirlT=0.3;const d=abilBase()*0.6;
    for(const z of zombies.slice()){if(dist(z.x,z.y,P.x,P.y)>85+z.r||!canHit(z,'melee'))continue;dmgNum(z.x,z.y-z.r-4,d,false);burst(z.x,z.y,4,['#ffd34d','#fff'],140,0.3,2);hitZombie(z,d,P.x,P.y,'melee')}shake(1.5,0.08)}}
  for(const f of RX.fb){f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(Math.random()<0.6)burst(f.x,f.y,1,['#ffb347','#ff6a2a'],40,0.3,3);
    for(const z of zombies){if(dist(z.x,z.y,f.x,f.y)>z.r+10||!canHit(z,'ranged'))continue;f.t=0;dmgNum(z.x,z.y-z.r-4,f.d,true);z.burn=3;z.burnDps=Math.max(z.burnDps||0,f.d*0.3);burst(f.x,f.y,16,['#ffd34d','#ff7a2a','#cf4b3f'],200,0.5,3);shake(2,0.1);hitZombie(z,f.d,f.x,f.y,'ranged');break}}
  RX.fb=RX.fb.filter(f=>f.t>0);
}
function drawAbilityFx(now){
  if(RX.whirl>0){const K=cls()==='warrior'&&S.bow?HAM_SKINS[skinTier(HAM_SKINS,S.bow)]:null;for(let r=0;r<3;r++){ctx.strokeStyle=`rgba(255,240,200,${0.45-r*0.12})`;ctx.lineWidth=9-r*3;const a0=now/90+r*0.8;ctx.beginPath();ctx.arc(P.x,P.y,62+r*7,a0,a0+3.2);ctx.stroke()}}
  for(const f of RX.fb){const g=ctx.createRadialGradient(f.x,f.y,1,f.x,f.y,18);g.addColorStop(0,'rgba(255,240,160,1)');g.addColorStop(0.4,'rgba(255,140,40,.9)');g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,18,0,7);ctx.fill()}
  if(RX.volley>0){ctx.strokeStyle=`rgba(95,201,138,${0.35+0.15*Math.sin(now/150)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y,20,0,7);ctx.stroke()}
}
const ABIL_ICO={warrior:'<path d="M16 4a12 12 0 1 1-11 7" stroke="#ffd34d" stroke-width="3" fill="none"/><path d="M3 6l2 6 6-2" stroke="#ffd34d" stroke-width="2.5" fill="none"/><rect x="13" y="10" width="7" height="11" fill="#9ea5aa" stroke="#4c5257"/>',
  mage:'<circle cx="11" cy="20" r="6" fill="#ff7a2a"/><circle cx="20" cy="12" r="5" fill="#ffb347"/><circle cx="25" cy="23" r="4" fill="#ffd34d"/><circle cx="11" cy="20" r="2.5" fill="#fff5c0"/>',
  archer:'<g stroke="#c9b48a" stroke-width="2"><path d="M4 8l20 6M4 16h22M4 24l20-6"/></g><path d="M28 16l-5-3v6z" fill="#cfd8de"/><path d="M26 14l-4-3v4zM26 18l-4 3v-4z" fill="#cfd8de"/>'};
// --- экран выбора класса
function clsPortrait(k){const cv=document.createElement('canvas');cv.width=cv.height=120;const c2=cv.getContext&&cv.getContext('2d');if(!c2||!cv.toDataURL)return '';c2.fillStyle='#4f6e3a';c2.fillRect(0,0,120,120);c2.translate(60,64);c2.scale(3,3);
  c2.fillStyle='rgba(0,0,0,.35)';c2.beginPath();c2.ellipse(2,11,13,5,0,0,7);c2.fill();drawHeroBody(c2,0,0,k,false,-0.4);
  if(k==='warrior')drawHammerSkin(c2,HAM_SKINS[2],0,0,-0.5,18,0);if(k==='mage')drawStaffSkin(c2,STF_SKINS[2],0,0,-0.6,16,0);if(k==='archer')drawBowSkin(c2,BOW_SKINS[2],13,0,-0.4,0,0,true);return cv.toDataURL()}
function showClassPick(){
  const el=document.getElementById('clsPick');if(!el)return;const box=document.getElementById('clsList');box.textContent='';
  for(const k in CLASSES){const C=CLASSES[k],b=document.createElement('button');b.type='button';b.className='cls-card';b.dataset.cls=k;b.style.setProperty('--cc',C.col);
    b.innerHTML=`<img src="${clsPortrait(k)}" alt="" width="120" height="120"><b>${C.name}</b><small>${C.br}</small><span><em>Оружие</em>Топор + ${C.weap.toLowerCase()}: ${C.weapD}</span><span><em>Способность (C)</em>${C.abil}: ${C.abilD}, перезарядка ${C.cd} с</span><span><em>Ветка умений</em>${C.br}</span><span><em>Комплект в склепе</em>${C.set}</span><i>Выбрать</i>`;box.append(b)}
  el.hidden=false;keys.clear();actHeld=false;
}
const clsOpen=()=>{const el=document.getElementById('clsPick');return !!el&&!el.hidden};
