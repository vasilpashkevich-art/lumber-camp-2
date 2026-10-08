/* ================= РЕЛИКВИИ С УМЕНИЯМИ ================= */
// новые реликвии: ранги 1–2; act — активная (клавиша), иначе действует сама
const RELIC2 = {
  hammer: {name:'Молот Громовержца', max:2, key:'Digit1', kl:'1', act:true, cd:r=>r>1?8:11,  desc:r=>`Бросок молота вперёд: крутится, пробивает всех на пути и возвращается в руку. Урон ×${r>1?4:2.5} от удара`},
  frost:  {name:'Ледяной оберег',    max:2, key:'Digit2', kl:'2', act:true, cd:r=>r>1?16:22, desc:r=>`Морозная волна: враги в радиусе ${r>1?300:220} замерзают на 3 с (боссы на 1,2 с)`},
  totem:  {name:'Тотем предков',     max:2, key:'Digit3', kl:'3', act:true, cd:r=>r>1?30:40, desc:r=>`Ставит тотем, который ${r>1?40:25} с сам стреляет по нечисти рядом`},
  mirror: {name:'Зеркало возврата',  max:2, key:'Digit4', kl:'4', act:true, cd:r=>r>1?50:90, desc:r=>`Мгновенно переносит в лагерь (не из склепа). Перезарядка ${r>1?50:90} с`},
  storm:  {name:'Венец бури',        max:2, desc:r=>`Каждые ${r>1?3.5:5} с молния бьёт до ${r>1?5:3} ближайших врагов цепью`},
  twin:   {name:'Двойная тетива',    max:2, desc:r=>`Лук выпускает две стрелы сразу: вторая летит в соседнего врага, урон ${r>1?100:60}%`},
  boots:  {name:'Сапоги-скороходы',  max:2, desc:r=>`+${r>1?25:15}% к скорости, болото не замедляет, два рывка подряд`},
  phoenix:{name:'Перо феникса',      max:2, desc:r=>`Раз в день спасает от гибели: воскрешение с ${r>1?100:50}% здоровья и огненный взрыв вокруг`},
  wolf:   {name:'Дух волка',         max:2, desc:r=>`Призрачный волк бегает рядом и рвёт нечисть. Урон ×${r>1?1.8:1} от удара в секунду`},
  sack:   {name:'Котомка-самоходка', max:2, desc:r=>`Добыча сама летит к вам. Полная сумка сама улетает на склад раз в ${r>1?30:60} с`},
};
const RELIC_ACT=['hammer','frost','totem','mirror'];
const RELIC_ICO = {
  gather:'<path d="M9 25 21 9" stroke="#8d6540" stroke-width="3" stroke-linecap="round"/><path d="M19 6c5 0 8 3 8 7-3 0-6-1-8-4z" fill="#c9ccc4"/><path d="M7 14c2-5 7-6 9-4-2 3-6 5-9 4z" fill="#6d9a4a"/>',
  flask:'<path d="M13 5h6v6l5 9a4 4 0 0 1-4 6h-8a4 4 0 0 1-4-6l5-9z" fill="#3a2c3c" stroke="#ece6d3" stroke-width="1.5"/><path d="M10 19h12l1 2a3 3 0 0 1-3 4h-8a3 3 0 0 1-3-4z" fill="#cf4b3f"/>',
  fort:'<path d="M5 27V12l3-3 3 3v15M12 27V10l3-3 3 3v17M19 27V12l3-3 3 3v15" fill="#8d6540" stroke="#3b2a1c" stroke-width="1.2"/><path d="M4 18h24" stroke="#3b2a1c" stroke-width="2"/>',
  vet:'<path d="M16 4 26 8v8c0 6-4 10-10 12C10 26 6 22 6 16V8z" fill="#4a5a6a" stroke="#c9a24a" stroke-width="1.5"/><path d="M11 13l5 3 5-3M11 18l5 3 5-3" stroke="#f4c766" stroke-width="2" fill="none"/>',
  steel:'<path d="M23 5 9 19l4 4L27 9V5z" fill="#cfd8de" stroke="#6d7a8a"/><path d="M7 21l4 4M5 27l4-4" stroke="#8d6540" stroke-width="3" stroke-linecap="round"/>',
  heart:'<path d="M16 27C6 20 4 15 4 11a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 4-2 9-12 16z" fill="#cf4b3f" stroke="#7a1f1f" stroke-width="1.2"/><path d="M9 10a3 3 0 0 1 4-2" stroke="#f2b8b0" stroke-width="1.5" fill="none"/>',
  hoard:'<rect x="5" y="12" width="22" height="14" rx="2" fill="#8d6540" stroke="#3b2a1c"/><path d="M5 12c0-5 22-5 22 0" fill="#a87a4c" stroke="#3b2a1c"/><rect x="14" y="14" width="4" height="5" fill="#f4c766"/><path d="M5 18h22" stroke="#c9a24a"/>',
  seek:'<circle cx="14" cy="14" r="8" fill="none" stroke="#c9a24a" stroke-width="2.5"/><path d="M20 20l7 7" stroke="#8d6540" stroke-width="3.5" stroke-linecap="round"/><path d="M14 10l1.2 2.6 2.8.3-2 2 .6 2.8-2.6-1.4-2.6 1.4.6-2.8-2-2 2.8-.3z" fill="#f4c766"/>',
  keyr:'<circle cx="10" cy="11" r="5" fill="none" stroke="#f4c766" stroke-width="3"/><path d="M14 15l12 12M21 22l3-3M24 25l2-2" stroke="#f4c766" stroke-width="3" stroke-linecap="round"/>',
  hammer:'<path d="M15 14h3v14h-3z" fill="#8d6540"/><rect x="6" y="5" width="20" height="10" rx="1.5" fill="#9ea5aa" stroke="#4c5257"/><path d="M8 10h16" stroke="#cfd8de"/><path d="M20 4l-3 4h3l-3 4" stroke="#7ec8ff" stroke-width="1.5" fill="none"/>',
  frost:'<g stroke="#bfe6ff" stroke-width="2.2" stroke-linecap="round"><path d="M16 3v26M4.7 9.5l22.6 13M4.7 22.5l22.6-13"/><path d="M13 6l3 3 3-3M13 26l3-3 3 3"/></g><circle cx="16" cy="16" r="3" fill="#7ec8ff"/>',
  totem:'<rect x="11" y="4" width="10" height="24" rx="2" fill="#8d6540" stroke="#3b2a1c"/><path d="M8 10h16" stroke="#c9a24a" stroke-width="2"/><circle cx="14" cy="15" r="1.4" fill="#f4c766"/><circle cx="18" cy="15" r="1.4" fill="#f4c766"/><path d="M13 20h6M13 24l3-2 3 2" stroke="#3b2a1c" stroke-width="1.5" fill="none"/>',
  mirror:'<ellipse cx="16" cy="13" rx="8" ry="10" fill="#9fc3d6" stroke="#c9a24a" stroke-width="2.5"/><path d="M12 9c1-2 3-3 5-3" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M16 23v6M12 29h8" stroke="#c9a24a" stroke-width="2.5"/>',
  storm:'<path d="M18 3 8 18h7l-3 11 12-16h-7z" fill="#f4e27a" stroke="#c9a24a" stroke-width="1.2"/><path d="M5 8l3 2M27 22l-3-1" stroke="#7ec8ff" stroke-width="1.5"/>',
  twin:'<g stroke="#c9b48a" stroke-width="2"><path d="M4 12h20M4 21h20"/></g><path d="M28 12l-5-3v6zM28 21l-5-3v6z" fill="#cfd8de"/><path d="M4 12l3-3M4 12l3 3M4 21l3-3M4 21l3 3" stroke="#cf4b3f" stroke-width="1.5"/>',
  boots:'<path d="M9 5h7v13l8 3c2 1 2 5 0 6H9z" fill="#8d6540" stroke="#3b2a1c"/><path d="M9 24h16" stroke="#3b2a1c" stroke-width="2"/><path d="M8 10C4 9 2 6 2 4c3 1 5 2 7 4M8 15c-4 0-6-2-7-4 3 0 5 1 7 2" fill="#ece6d3"/>',
  phoenix:'<path d="M16 29c-6-4-8-10-5-16 1 3 3 4 4 4-1-5 1-10 5-13-1 4 0 7 3 10 3 4 2 11-7 15z" fill="#e98b3d"/><path d="M16 26c-3-2-4-6-2-9 1 2 2 3 3 3 0-3 1-5 3-6 0 3 2 5 2 7 0 2-2 4-6 5z" fill="#f4e27a"/>',
  wolf:'<path d="M6 8l5 4 5-2 5 2 5-4-1 9-3 5-6 6-6-6-3-5z" fill="#9fb4c8" stroke="#4c6178"/><circle cx="12.5" cy="15" r="1.4" fill="#7ec8ff"/><circle cx="19.5" cy="15" r="1.4" fill="#7ec8ff"/><path d="M14 21l2 2 2-2" stroke="#2b3a48" stroke-width="1.5" fill="none"/>',
  sack:'<path d="M10 9c-4 5-6 10-4 15 1 3 4 4 10 4s9-1 10-4c2-5 0-10-4-15z" fill="#a87a4c" stroke="#3b2a1c"/><path d="M10 9h12M12 9l-2-4h12l-2 4" stroke="#3b2a1c" stroke-width="1.5" fill="#8d6540"/><path d="M4 16h-2M30 16h-2M5 11 3 9M27 11l2-2" stroke="#f4c766" stroke-width="1.5"/>',
};
const relicSvg=(k,sz=32)=>`<svg viewBox="0 0 32 32" width="${sz}" height="${sz}" aria-hidden="true">${RELIC_ICO[k]||''}</svg>`;
const relicName=k=>(RELIC2[k]||RELICS[k]).name;
const relicDesc=(k,r)=>{const R=RELIC2[k];return R?R.desc(Math.max(1,r)):RELICS[k].desc};
const ownedRelics=()=>Object.keys(S.meta.relics).filter(k=>rl(k)>0);
// --- состояние умений
const RX={cd:{},hammers:[],totems:[],bolts:[],rings:[],wolf:null,stormT:2,sackT:0};
const relDmg=m=>heroHit(Math.max(axeDmg(S.up.axe),S.bow?bowDmg(S.bow):0)*(1+0.12*pr('str'))*atkMul()*m)[0];
function useRelic(k){
  const R=RELIC2[k],r=rl(k);if(!R||!R.act||!r||S.over)return;
  if((RX.cd[k]||0)>0){toast(`${R.name}: ещё ${Math.ceil(RX.cd[k])} с`,'', 'rcd'+k);return}
  if(k==='mirror'){if(DG){toast('Зеркало не работает в склепе','', 'rcdm');return}
    burst(P.x,P.y,30,['#9fc3d6','#ffffff'],200,0.6,3);P.x=CX;P.y=CY+40;S.p.x=P.x;S.p.y=P.y;burst(P.x,P.y,30,['#9fc3d6','#ffffff'],200,0.6,3);sfx.levelup();toast('Зеркало перенесло вас в лагерь','good')}
  if(k==='hammer'){const a=P.face;RX.hammers.push({x:P.x,y:P.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,t:0.7,back:false,hit:new Set(),rot:0,d:relDmg(r>1?4:2.5)});sfx.dash()}
  if(k==='frost'){const R2=r>1?300:220;RX.rings.push({x:P.x,y:P.y,r:10,max:R2,t:0.45,col:'#bfe6ff'});
    for(const z of zombies.slice()){if(dist(z.x,z.y,P.x,P.y)>R2+z.r)continue;z.frozen=z.boss?1.2:3;const d=relDmg(1);dmgNum(z.x,z.y-z.r-4,d,false);hitZombie(z,d,P.x,P.y,'ranged')}
    burst(P.x,P.y,40,['#bfe6ff','#ffffff','#7ec8ff'],260,0.7,3);sfx.crumble()}
  if(k==='totem'){RX.totems.push({x:P.x+Math.cos(P.face)*30,y:P.y+Math.sin(P.face)*30,t:r>1?40:25,cd:0.5,ang:0,shot:0});sfx.buy()}
  RX.cd[k]=R.cd(r);
}
function updRelics(dt){
  for(const k in RX.cd)RX.cd[k]=Math.max(0,RX.cd[k]-dt);
  // молот
  for(const h of RX.hammers){h.rot+=dt*22;
    if(!h.back){h.t-=dt;h.x+=h.vx*dt;h.y+=h.vy*dt;if(h.t<=0){h.back=true;h.hit.clear()}}
    else{const d=dist(h.x,h.y,P.x,P.y)||1,sp=Math.max(620,d*3);h.x+=(P.x-h.x)/d*sp*dt;h.y+=(P.y-h.y)/d*sp*dt;if(d<20)h.done=true}
    for(const z of zombies.slice()){if(h.hit.has(z)||dist(z.x,z.y,h.x,h.y)>z.r+16||!canHit(z,'ranged'))continue;h.hit.add(z);dmgNum(z.x,z.y-z.r-4,h.d,false);burst(z.x,z.y,6,['#7ec8ff','#ffffff'],160,0.3,2);shake(1.5,0.06);hitZombie(z,h.d,h.x,h.y,'ranged')}}
  RX.hammers=RX.hammers.filter(h=>!h.done);
  // тотемы
  for(const t of RX.totems){t.t-=dt;t.cd-=dt;t.shot=Math.max(0,t.shot-dt);if(t.cd>0)continue;
    let best=null,bd=270;for(const z of zombies){const d=dist(z.x,z.y,t.x,t.y);if(d<bd&&canHit(z,'ranged')){bd=d;best=z}}
    if(best){t.cd=0.6;t.ang=Math.atan2(best.y-t.y,best.x-t.x);t.shot=0.2;tracers.push({x1:t.x,y1:t.y-26,x2:best.x,y2:best.y,t:0.12,lvl:5});const d=relDmg(0.8);hitZombie(best,d,t.x,t.y,'ranged')}}
  RX.totems=RX.totems.filter(t=>t.t>0);
  // буря
  const rs=rl('storm');if(rs){RX.stormT-=dt;if(RX.stormT<=0){RX.stormT=rs>1?3.5:5;
    const n=rs>1?5:3,used=new Set();let from={x:P.x,y:P.y},pts=[[P.x,P.y-10]];
    for(let i=0;i<n;i++){let best=null,bd=i?200:290;for(const z of zombies){if(used.has(z)||!canHit(z,'ranged'))continue;const d=dist(z.x,z.y,from.x,from.y);if(d<bd){bd=d;best=z}}
      if(!best)break;used.add(best);pts.push([best.x,best.y]);from=best}
    if(used.size){RX.bolts.push({pts,t:0.22});sfx.shoot();shake(1.5,0.08);for(const z of used){const d=relDmg(1.5);dmgNum(z.x,z.y-z.r-4,d,false);burst(z.x,z.y,6,['#f4e27a','#ffffff'],170,0.3,2);hitZombie(z,d,P.x,P.y,'ranged')}}
    else RX.stormT=0.5}}
  for(const b of RX.bolts)b.t-=dt;RX.bolts=RX.bolts.filter(b=>b.t>0);
  for(const g of RX.rings){g.t-=dt;g.r+=(g.max-g.r)*Math.min(1,dt*10)}RX.rings=RX.rings.filter(g=>g.t>0);
  // волк
  const rw=rl('wolf');
  if(rw){if(!RX.wolf)RX.wolf={x:P.x-30,y:P.y,cd:0,face:0,run:0};const W=RX.wolf;W.cd-=dt;
    if(dist(W.x,W.y,P.x,P.y)>700){W.x=P.x-30;W.y=P.y}
    let foe=null,fd=300;for(const z of zombies){const d=dist(z.x,z.y,P.x,P.y);if(d<fd&&canHit(z,'melee')){fd=d;foe=z}}
    const tx=foe?foe.x:P.x-Math.cos(P.face)*34,ty=foe?foe.y:P.y-Math.sin(P.face)*34,d=dist(W.x,W.y,tx,ty);
    W.run=0;if(d>(foe?foe.r+12:10)){const sp=foe?300:Math.min(420,d*4);W.x+=(tx-W.x)/d*sp*dt;W.y+=(ty-W.y)/d*sp*dt;W.face=Math.atan2(ty-W.y,tx-W.x);W.run=1}
    else if(foe&&W.cd<=0){W.cd=0.7;const dm=relDmg((rw>1?1.8:1)*0.7);dmgNum(foe.x,foe.y-foe.r-4,dm,false);burst(foe.x,foe.y,4,['#9fb4c8','#ffffff'],120,0.3,2);hitZombie(foe,dm,W.x,W.y,'melee')}}
  else RX.wolf=null;
  // котомка
  const rk=rl('sack');if(rk){RX.sackT=Math.max(0,RX.sackT-dt);
    for(const d of drops){const dd=dist(d.x,d.y,P.x,P.y);if(dd<240&&dd>4){d.x+=(P.x-d.x)/dd*420*dt;d.y+=(P.y-d.y)/dd*420*dt}}
    if(RX.sackT<=0&&!inCamp()&&bagTotal()>=bagCap(S.up.bag)){RX.sackT=rk>1?30:60;S.wood+=S.bag;S.stone+=S.bagStone;S.iron+=S.bagIron||0;
      toast(`Котомка улетела на склад: +${S.bag} древесины${S.bagStone?', +'+S.bagStone+' камня':''}${S.bagIron?', +'+S.bagIron+' железа':''}`,'good');burst(P.x,P.y,20,['#c9a06a','#f4c766'],220,0.6,3);S.bag=0;S.bagStone=0;S.bagIron=0;save()}}
}
// второй выстрел двойной тетивы
function twinShot(t,d,cr){const r=rl('twin');if(!r||t.k!=='z')return;
  let o=null,bd=bowRange(S.bow);for(const z of zombies){if(z===t.o)continue;const dd=dist(z.x,z.y,P.x,P.y);if(dd<bd&&canHit(z,'ranged')){bd=dd;o=z}}
  const tg=o||t.o;tracers.push({x1:P.x,y1:P.y,x2:tg.x,y2:tg.y,t:0.12,lvl:Math.min(6,1+Math.floor(S.bow/2))});
  if(zombies.includes(tg))hitEnemy({k:'z',o:tg},d*(r>1?1:0.6),'ranged',cr)}
// феникс: возвращает true, если спас
function phoenixSave(){
  const r=rl('phoenix');if(!r||S.phoenixDay===S.day)return false;
  S.phoenixDay=S.day;S.p.hp=maxHp(S.up.hp)*(r>1?1:0.5);P.inv=2;
  RX.rings.push({x:P.x,y:P.y,r:10,max:240,t:0.6,col:'#f4a03c'});burst(P.x,P.y,60,['#f4e27a','#e98b3d','#cf4b3f'],320,0.9,4);shake(8,0.5);sfx.roar(0.5);
  for(const z of zombies.slice()){if(dist(z.x,z.y,P.x,P.y)>240+z.r)continue;const d=relDmg(5);z.burn=4;z.burnDps=Math.max(z.burnDps||0,d*0.2);dmgNum(z.x,z.y-z.r-4,d,true);hitZombie(z,d,P.x,P.y,'ranged')}
  toast('Перо феникса: вы восстали из пепла! Следующее спасение — завтра','good');return true;
}
function drawRelicFx(now){
  for(const g of RX.rings){ctx.globalAlpha=Math.min(1,g.t*3);ctx.strokeStyle=g.col;ctx.lineWidth=4;ctx.beginPath();ctx.arc(g.x,g.y,g.r,0,7);ctx.stroke()}ctx.globalAlpha=1;
  for(const t of RX.totems){const a=Math.min(1,t.t);ctx.globalAlpha=a;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(t.x+2,t.y+4,9,4,0,0,7);ctx.fill();
    ctx.fillStyle='#8d6540';ctx.fillRect(t.x-6,t.y-30,12,32);ctx.fillStyle='#c9a24a';ctx.fillRect(t.x-9,t.y-24,18,3);
    ctx.fillStyle=t.shot>0?'#ffffff':'#f4c766';ctx.fillRect(t.x-4,t.y-18,3,3);ctx.fillRect(t.x+1,t.y-18,3,3);ctx.strokeStyle='#3b2a1c';ctx.lineWidth=1.5;ctx.strokeRect(t.x-6,t.y-30,12,32);
    const g=0.2+0.1*Math.sin(now/150);ctx.fillStyle=`rgba(244,199,102,${g})`;ctx.beginPath();ctx.arc(t.x,t.y-32,6,0,7);ctx.fill();ctx.globalAlpha=1}
  for(const h of RX.hammers){ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.rot);ctx.fillStyle='rgba(126,200,255,.25)';ctx.beginPath();ctx.arc(0,0,18,0,7);ctx.fill();
    ctx.fillStyle='#8d6540';ctx.fillRect(-2,-2,4,16);ctx.fillStyle='#9ea5aa';ctx.fillRect(-10,-9,20,10);ctx.strokeStyle='#4c5257';ctx.lineWidth=1.5;ctx.strokeRect(-10,-9,20,10);ctx.restore()}
  for(const b of RX.bolts){ctx.globalAlpha=Math.min(1,b.t*6);for(const [col,w] of [['rgba(126,200,255,.5)',6],['#fff7c0',2]]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();
    for(let i=0;i<b.pts.length-1;i++){const [x1,y1]=b.pts[i],[x2,y2]=b.pts[i+1];if(i===0)ctx.moveTo(x1,y1);for(let s=1;s<=5;s++){const k=s/5,j=s<5?(Math.random()-0.5)*16:0;ctx.lineTo(x1+(x2-x1)*k-(y2-y1)/(dist(x1,y1,x2,y2)||1)*j,y1+(y2-y1)*k+(x2-x1)/(dist(x1,y1,x2,y2)||1)*j)}}
    ctx.stroke()}}ctx.globalAlpha=1;
  const W=RX.wolf;if(W){const bob=W.run?Math.sin(now/60)*2:0,a=W.face;ctx.save();ctx.translate(W.x,W.y+bob);
    ctx.fillStyle='rgba(126,200,255,.18)';ctx.beginPath();ctx.arc(0,0,20,0,7);ctx.fill();ctx.rotate(a);ctx.globalAlpha=0.85;
    ctx.fillStyle='#9fb4c8';ctx.beginPath();ctx.ellipse(-3,0,13,7,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(11,0,6,5,0,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(10,-4);ctx.lineTo(13,-9);ctx.lineTo(14,-3);ctx.moveTo(10,4);ctx.lineTo(13,9);ctx.lineTo(14,3);ctx.fill();
    ctx.strokeStyle='#9fb4c8';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-15,0);ctx.quadraticCurveTo(-21,Math.sin(now/120)*5,-24,0);ctx.stroke();
    ctx.fillStyle='#7ec8ff';ctx.fillRect(13,-2.5,2,2);ctx.fillRect(13,1,2,2);ctx.restore();ctx.globalAlpha=1}
  for(const z of zombies)if(z.frozen>0){ctx.fillStyle='rgba(191,230,255,.45)';ctx.beginPath();ctx.arc(z.x,z.y,z.r+3,0,7);ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.stroke()}
}
// панель реликвий на экране
let relicBarSig='';
function updRelicBar(){
  const el=document.getElementById('relicBar');if(!el)return;const own=ownedRelics();
  const sig=own.map(k=>k+rl(k)).join(',');
  if(sig!==relicBarSig){relicBarSig=sig;el.hidden=!own.length;
    const ord=own.sort((a,b)=>(RELIC2[b]&&RELIC2[b].act?2:RELIC2[b]?1:0)-(RELIC2[a]&&RELIC2[a].act?2:RELIC2[a]?1:0));
    el.innerHTML=ord.map(k=>{const A=RELIC2[k]&&RELIC2[k].act;return `<button type="button" class="rlc${A?' act':''}${RELIC2[k]?'':' old'}" data-relic-use="${k}" title="${relicName(k)} (ранг ${rl(k)}): ${relicDesc(k,rl(k))}">${relicSvg(k,A?28:22)}${A?`<b>${RELIC2[k].kl}</b><i data-cd="${k}"></i>`:''}${rl(k)>1?`<em>${rl(k)}</em>`:''}</button>`}).join('')}
  for(const k of RELIC_ACT){const i=el.querySelector(`[data-cd="${k}"]`);if(!i)continue;const c=RX.cd[k]||0,m=RELIC2[k].cd(rl(k));i.style.height=(c>0?100*c/m:0)+'%';i.textContent=c>0?Math.ceil(c):''}
}
