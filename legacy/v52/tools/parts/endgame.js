/* =====================================================================
   ЭНДГЕЙМ: вещи и редкость, железо и кузница, склепы, события,
   финал и Великое переселение
   ===================================================================== */

// ---------- общие помощники ----------
const ngMul = () => 1 + 0.25*((S.meta&&S.meta.ng)||0);
const rl = id => (S&&S.meta&&S.meta.relics&&S.meta.relics[id])||0;
const potMax = () => LOOT.potionMax + rl('flask');
const randOf = a => a[Math.floor(Math.random()*a.length)];

// ---------- ВЕЩИ ----------
const RAR = [
  {n:'Обычный',     col:'#c4c2b8', mods:1, sh:1},
  {n:'Редкий',      col:'#5aa0e6', mods:2, sh:3},
  {n:'Эпический',   col:'#b47ae6', mods:3, sh:8},
  {n:'Легендарный', col:'#f0a040', mods:3, sh:20},
];
const SLOTS = {weapon:'Оружие', armor:'Броня', amulet:'Амулет', ring:'Кольцо'};
const SLOT_BASE = {
  weapon:['Топорик','Секира','Колун','Бердыш'],
  armor: ['Кожух','Стёганка','Кольчуга','Латы'],
  amulet:['Оберег','Ладанка','Талисман','Амулет'],
  ring:  ['Перстень','Кольцо','Печатка','Обруч'],
};
const RAR_ADJ = [['простой','старый','походный'],['крепкий','добротный','меткий'],['древний','заговорённый','рунный'],['легендарный']];
const MODS = {
  dmg:   {n:'Урон',                    pct:1, slots:['weapon','ring'],   base:6},
  spd:   {n:'Скорость удара',          pct:1, slots:['weapon','ring'],   base:4},
  crit:  {n:'Шанс крита (×2)',         pct:1, slots:['weapon','ring'],   base:3},
  burn:  {n:'Шанс поджога',            pct:1, slots:['weapon'],          base:6},
  vamp:  {n:'Здоровья за убийство',    pct:0, slots:['weapon','amulet'], base:0.5},
  hp:    {n:'Здоровье',                pct:0, slots:['armor','amulet'],  base:4},
  armor: {n:'Защита',                  pct:1, slots:['armor'],           base:3},
  move:  {n:'Скорость бега',           pct:1, slots:['armor','ring'],    base:2},
  gather:{n:'Сила добычи',             pct:1, slots:['weapon','amulet'], base:6},
  dbl:   {n:'Двойная добыча',          pct:1, slots:['amulet','ring'],   base:3},
  loot:  {n:'Шанс добычи с мертвецов', pct:1, slots:['amulet'],          base:4},
};
const UNIQUES = {
  weapon:{id:'felling', name:'Секира Первого Лесоруба', desc:'Раз в 10 с удар валит дерево или раскалывает валун сразу'},
  armor: {id:'shadow',  name:'Плащ Тени',               desc:'Рывок перезаряжается вдвое быстрее'},
  amulet:{id:'heart',   name:'Сердце Мора',             desc:'На каждом рассвете +1 зелье лечения'},
  ring:  {id:'flame',   name:'Кольцо Пламени',          desc:'Каждый удар поджигает врага'},
};
const INV_MAX = 20;
function modVal(k,tier,rar){
  const m=MODS[k];let v=m.base*(1+0.45*(tier-1))*(1+0.25*rar)*(0.8+Math.random()*0.4);
  return m.pct||k==='hp'?Math.max(1,Math.round(v)):Math.round(v*10)/10;
}
function rollMods(slot,tier,rar){
  const pool=Object.keys(MODS).filter(k=>MODS[k].slots.includes(slot)),out=[];
  while(out.length<RAR[rar].mods&&pool.length){const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0];out.push([k,modVal(k,tier,rar)])}
  return out;
}
function rollRar(minRar=0){
  const luck=0.05*rl('seek');
  const r=Math.random();let rar=r<0.02+luck*0.4?3:r<0.12+luck*0.8?2:r<0.40+luck?1:0;
  return Math.max(minRar,rar);
}
function makeItem(tier,minRar=0,slot){
  slot=slot||randOf(Object.keys(SLOTS));tier=Math.max(1,Math.min(7,tier|0));
  const rar=rollRar(minRar);
  const it={id:S.itemSeq++,slot,rar,tier,mods:rollMods(slot,tier,rar),uq:null};
  it.name=itemName(it);
  if(rar===3){it.uq=UNIQUES[slot].id;it.name=UNIQUES[slot].name}
  return it;
}
function itemName(it){
  const base=SLOT_BASE[it.slot][Math.min(3,Math.floor((it.tier-1)/2))];
  const adj=randOf(RAR_ADJ[Math.min(2,it.rar)]);
  return adj[0].toUpperCase()+adj.slice(1)+' '+base.toLowerCase();
}
const uqInfo = id => Object.values(UNIQUES).find(u=>u.id===id);
function gear(k){let s=0;if(!S.eq)return 0;for(const sl in S.eq){const it=S.eq[sl];if(!it)continue;for(const [mk,v] of it.mods)if(mk===k)s+=v}return s}
function hasUq(id){if(!S.eq)return false;for(const sl in S.eq){const it=S.eq[sl];if(it&&it.uq===id)return true}return false}
function modText(it){
  const parts=it.mods.map(([k,v])=>`${MODS[k].n} +${v}${MODS[k].pct?'%':''}`);
  if(it.uq)parts.push('★ '+uqInfo(it.uq).desc);
  return parts.join(' · ');
}
function giveItem(it,x,y){
  if(x!=null){drops.push({x,y,kind:'item',it,t:180});return}
  if(S.inv.length>=INV_MAX){toast('Сумка вещей полна (20). Разберите лишнее во вкладке «Вещи».','bad','invfull');return false}
  S.inv.push(it);return true;
}
function pickItem(d){
  if(S.inv.length>=INV_MAX){toast('Сумка вещей полна (20). Разберите лишнее во вкладке «Вещи».','bad','invfull');return}
  S.inv.push(d.it);d.t=0;sfx.pickup();
  addFloat(d.x,d.y-24,d.it.name,RAR[d.it.rar].col);
  if(d.it.rar>=2)toast(`${RAR[d.it.rar].n} предмет: ${d.it.name}`,'good');
  save();
}
// урон героя с учётом вещей; возвращает [урон, крит]
function heroHit(base){
  let d=base*(1+gear('dmg')/100)*(1+0.10*rl('steel'));
  const crit=Math.random()<gear('crit')/100;if(crit)d*=2;
  return [d,crit];
}
function maybeBurn(z,d){
  if(hasUq('flame')||Math.random()<gear('burn')/100){z.burn=3;z.burnDps=Math.max(z.burnDps||0,d*0.35)}
}

// ---------- ЖЕЛЕЗО И КУЗНИЦА ----------
const FORGE = {
  build: C(300,120), base:3,
  up: lvl => ({i:[10,25,60][lvl], sh:[0,0,0][lvl]}),
  rar: r => [{sh:10,i:5},{sh:25,i:15},{sh:60,i:40}][r],
  reroll: r => ({sh:4*(r+1), i:2*(r+1)}),
  temper: l => ({i:[20,45,90][l]}),
};
const ironOf = r => 1+Math.floor(r.zone/2);

// ---------- СКЛЕПЫ ----------
let crypts=[], DG=null;
const CRYPT_CD = 3; // дней до повторного открытия
const DUN = {RW:560, RH:420, CW:190, CH:150, X:W_SIZE+900, Y:CY};
const inDun = () => !!DG;
function buildCrypts(spots,rng2){
  crypts=[];
  const free=(x,y,r)=>spots.every(s=>dist(s.x,s.y,x,y)>s.r+r+20)&&trees.every(t=>Math.abs(t.x-x)>r+20||dist(t.x,t.y,x,y)>r+20);
  for(const z of CFG.zones){
    for(let g=0;g<80;g++){
      const a=rng2()*6.283,outer=Math.min(z.r1,3000),r=z.r0+70+rng2()*Math.max(1,outer-z.r0-140);
      const x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;
      if(!inBounds(x,y,100)||!free(x,y,40))continue;
      crypts.push({id:'c'+z.id,zone:z.id,x,y});spots.push({x,y,r:40});break;
    }
  }
}
function enterCrypt(c){
  S.keys--;S.crypts[c.id]=S.day+CRYPT_CD;
  const n=3+(c.zone>=4?1:0)+(c.zone>=6?1:0);
  const rooms=[],cors=[];
  for(let i=0;i<n;i++){
    const x=DUN.X+i*(DUN.RW+DUN.CW),y=DUN.Y-DUN.RH/2;
    rooms.push({i,x,y,w:DUN.RW,h:DUN.RH,spawned:false,cleared:false,last:i===n-1});
    if(i<n-1)cors.push({i,x:x+DUN.RW,y:DUN.Y-DUN.CH/2,w:DUN.CW,h:DUN.CH});
  }
  const traps=[];
  for(const r of rooms){if(r.i===0)continue;const k=2+Math.floor(c.zone/2);for(let j=0;j<k;j++)traps.push({x:r.x+80+Math.random()*(r.w-160),y:r.y+70+Math.random()*(r.h-140),t:Math.random()*2.4,hit:false,room:r.i})}
  DG={crypt:c,zone:c.zone,rooms,cors,traps,chest:null,exit:null,ex:c.x,ey:c.y+46,entry:{x:rooms[0].x+60,y:DUN.Y}};
  P.x=rooms[0].x+110;P.y=DUN.Y;S.p.x=P.x;S.p.y=P.y;
  sfx.roar(0.25);toast(`Склеп ${zoneById(c.zone).name}: ${n} залов. Выход — у входа, где вы стоите.`,'');
}
function leaveCrypt(msg){
  if(!DG)return;
  for(let i=zombies.length-1;i>=0;i--)if(zombies[i].dun!=null)zombies.splice(i,1);
  P.x=DG.ex;P.y=DG.ey;S.p.x=P.x;S.p.y=P.y;DG=null;spits=[];
  if(msg)toast(msg,'good');save();
}
function dunRects(){
  const R=[];
  for(const r of DG.rooms){if(r.i===0||DG.rooms[r.i-1].cleared)R.push(r)}
  for(const c of DG.cors)if(DG.rooms[c.i].cleared)R.push(c);
  return R;
}
function clampIn(o,rad,rects){
  for(const r of rects)if(o.x>=r.x+rad&&o.x<=r.x+r.w-rad&&o.y>=r.y+rad&&o.y<=r.y+r.h-rad)return;
  let best=null,bd=1e9;
  for(const r of rects){const x=Math.max(r.x+rad,Math.min(r.x+r.w-rad,o.x)),y=Math.max(r.y+rad,Math.min(r.y+r.h-rad,o.y)),d=(x-o.x)**2+(y-o.y)**2;if(d<bd){bd=d;best={x,y}}}
  if(best){o.x=best.x;o.y=best.y}
}
function roomAt(x,y){return DG.rooms.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)}
function updateDungeon(dt){
  if(!DG)return;
  clampIn(P,14,dunRects());
  const room=roomAt(P.x,P.y);
  if(room&&!room.spawned&&P.x>room.x+40){
    room.spawned=true;const zn=zoneById(DG.zone);
    if(room.last){
      const g=makeGuardian(DG.zone,room.x+room.w-120,DUN.Y);g.dun=room.i;zombies.push(g);
      toast(`${g.name} пробудился!`,'bad');sfx.roar(0.5);
    }
    const n=Math.min(10,3+DG.zone)-(room.last?2:0);
    for(let k=0;k<n;k++){
      const kinds=DG.zone>=3?[undefined,'runner','ram','spitter']:[undefined,'runner'];
      const z=makeZombie(zn.ztier,room.x+room.w*0.45+Math.random()*room.w*0.5,room.y+50+Math.random()*(room.h-100),false,null,randOf(kinds));
      z.dun=room.i;zombies.push(z);
    }
  }
  for(const r of DG.rooms){
    if(!r.spawned||r.cleared)continue;
    if(!zombies.some(z=>z.dun===r.i)){
      r.cleared=true;
      if(r.last){DG.chest={x:r.x+r.w/2,y:DUN.Y,open:false};toast('Хранитель пал. Откройте сундук.','good')}
      else {toast('Зал очищен, проход открыт','good');sfx.dawn()}
    }
  }
  for(const z of zombies){if(z.dun==null)continue;const r=DG.rooms[z.dun];if(r)clampIn(z,z.r,[r])}
  for(const t of DG.traps){
    const r=DG.rooms[t.room];if(!r.spawned)continue;
    t.t=(t.t+dt)%2.4;const armed=t.t>1.8;
    if(!armed)t.hit=false;
    else if(!t.hit&&dist(t.x,t.y,P.x,P.y)<24){t.hit=true;damagePlayer(Math.max(3,maxHp(S.up.hp)*0.12));sfx.slam()}
  }
}
function makeGuardian(zid,x,y){
  const zn=zoneById(zid),c=CFG.zombies[zn.ztier],b=CFG.bosses[zid];
  const z=makeZombie(zn.ztier,x,y,false,null);
  z.guard=true;z.max=z.hp=c.hp*3*ngMul();z.r=c.r*1.6;z.dmg=Math.ceil(c.dmg*1.4*ngMul());z.speed=c.speed*0.8;
  z.ab=b.ability==='dragon'?'charge':b.ability;z.skin=b.skin;z.abT=2;z.name='Хранитель склепа';z.charge=0;z.slam=0;
  return z;
}
function openDunChest(){
  const c=DG.chest;if(!c||c.open)return;c.open=true;
  const zid=DG.zone,n=1+(zid>=5?1:0);
  for(let i=0;i<n;i++)drops.push({x:c.x-30+i*60,y:c.y+40,kind:'item',it:makeItem(zid,1),t:300});
  const iron=3+zid*2,sh=2+zid,w=40*zid,st=12*zid;
  S.iron+=iron;S.shards+=sh;S.wood+=w;S.stone+=st;S.stats.chests++;
  if(Math.random()<0.5)drops.push({x:c.x+50,y:c.y-30,kind:'potion',t:300});
  if(Math.random()<0.4)drops.push({x:c.x-50,y:c.y-30,kind:'potatk',t:300});
  sfx.chest();gainXp(20*zid);
  addFloat(c.x,c.y-40,`+${iron} железа, +${sh} осколков, +${w} древесины, +${st} камня`,'#f4c766');
  DG.exit={x:c.x+140,y:c.y};
  toast('Сокровища на складе. Портал к выходу открылся справа от сундука.','good');save();
}

// ---------- СОБЫТИЯ ----------
let refugees=[];
const SIDES=[['востока',0],['юга',Math.PI/2],['запада',Math.PI],['севера',-Math.PI/2]];
function merchantHere(){return S.merchant===S.day&&!phase().night}
const MERCH = [
  {id:'w2s',  t:'Обменять 50 древесины на 15 камня',   c:{w:50},          give:()=>{S.stone+=15}},
  {id:'s2w',  t:'Обменять 20 камня на 50 древесины',   c:{w:0,s:20},      give:()=>{S.wood+=50}},
  {id:'heal', t:'Зелье лечения',                       c:{w:40},          give:()=>{if(S.potions<potMax()){S.potions++;return true}toast('Зелий лечения уже максимум','bad');return false}},
  {id:'atk',  t:'Зелье силы',                          c:{w:70,s:10},     give:()=>{if(S.potAtk<potMax()){S.potAtk++;return true}toast('Зелий силы уже максимум','bad');return false}},
  {id:'key',  t:'Ключ от склепа',                      c:{w:150,s:50},    give:()=>{S.keys++}},
  {id:'iron', t:'Железо ×5',                           c:{w:120,s:40},    give:()=>{S.iron+=5}},
  {id:'item', t:'Случайная вещь (редкая или лучше), одна за визит', c:{w:350,s:100,i:10}, once:true, give:()=>giveItem(makeItem(Math.max(1,bestCleared()+1),1))},
];
function spawnCaravan(){
  const a=Math.random()*6.283,r=780+Math.random()*120,x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;
  refugees=[];for(let i=0;i<3;i++)refugees.push({x:x+i*16,y:y+(i%2)*14,hp:40,max:40,i});
  const zn=zoneById(2);
  for(let k=0;k<3+Math.floor(S.day/5);k++){const b=Math.random()*6.283,z=makeZombie(Math.min(5,1+Math.floor(S.day/5)),x+Math.cos(b)*260,y+Math.sin(b)*260,false,null);z.hunt=true;zombies.push(z)}
  const side=SIDES.reduce((best,s)=>Math.abs(Math.atan2(Math.sin(a-s[1]),Math.cos(a-s[1])))<Math.abs(Math.atan2(Math.sin(a-best[1]),Math.cos(a-best[1])))?s:best);
  toast(`Беженцы идут к лагерю с ${side[0]}! Проведите их, за ними гонятся мертвецы.`,'good');sfx.dawn();
}
function updateRefugees(dt){
  if(!refugees.length)return;
  for(let i=refugees.length-1;i>=0;i--){
    const r=refugees[i],d=dist(r.x,r.y,CX,CY);
    if(d<CFG.baseR){refugees.splice(i,1);S.extraRes=(S.extraRes||0)+1;S.jobs.wood++;fixJobs();S.wood+=30*S.day;gainXp(15);
      toast(`Беженец добрался до лагеря: +1 житель, +${30*S.day} древесины`,'good');sfx.chest();save();continue}
    const scared=zombies.some(z=>Math.abs(z.x-r.x)<60&&dist(z.x,z.y,r.x,r.y)<40);
    const sp=scared?62:44;r.x+=(CX-r.x)/d*sp*dt;r.y+=(CY-r.y)/d*sp*dt;
    for(const z of zombies){if(Math.abs(z.x-r.x)>30)continue;if(dist(z.x,z.y,r.x,r.y)<z.r+10&&z.atk<=0){z.atk=1;r.hp-=z.dmg;addFloat(r.x,r.y-16,'−'+z.dmg,'#cf4b3f')}}
    if(r.hp<=0){refugees.splice(i,1);toast('Мертвецы настигли беженца','bad')}
  }
}
function drawRefugee(r){
  const x=r.x,y=r.y,b=Math.sin(performance.now()/130+r.i)*1.2;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+1,y+6,6,3,0,0,7);ctx.fill();
  ctx.fillStyle='#5a6f8a';ctx.beginPath();ctx.arc(x,y+b,6,0,7);ctx.fill();
  ctx.fillStyle='#d9c7a6';ctx.beginPath();ctx.arc(x,y-3+b,3.5,0,7);ctx.fill();
  ctx.fillStyle='#6b4a2c';ctx.fillRect(x-8,y-1+b,5,6);
  ctx.fillStyle='#000';ctx.fillRect(x-10,y-14,20,3);ctx.fillStyle='#9fc3d6';ctx.fillRect(x-10,y-14,20*r.hp/r.max,3);
}
function drawMerchant(now){
  const x=CX+92,y=CY+56;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-24,y+4,52,12);
  ctx.fillStyle='#6b4a2c';ctx.fillRect(x-22,y-12,40,18);ctx.fillStyle='#b8442e';ctx.beginPath();ctx.moveTo(x-26,y-12);ctx.quadraticCurveTo(x-2,y-34,x+22,y-12);ctx.fill();
  ctx.fillStyle='#2b2219';for(const wx of [-14,10]){ctx.beginPath();ctx.arc(x+wx,y+8,5,0,7);ctx.fill()}
  ctx.fillStyle='#3a5a8a';ctx.beginPath();ctx.arc(x+32,y,7,0,7);ctx.fill();ctx.fillStyle='#d9c7a6';ctx.beginPath();ctx.arc(x+32,y-4,4,0,7);ctx.fill();
  ctx.fillStyle='#2b2219';ctx.beginPath();ctx.ellipse(x+32,y-8,7,2.5,0,0,7);ctx.fill();ctx.fillRect(x+29,y-13,6,5);
  ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#f4c766';ctx.fillText('Торговец',x+4,y-38+Math.sin(now/400)*2);
}

// ---------- ФИНАЛ И ПЕРЕСЕЛЕНИЕ ----------
const allCleared = () => CFG.zones.every(zoneCleared);
const portalPos = () => {const l=lairs.find(q=>q.zone===7);return l?{x:l.x,y:l.y}:null};
const RELICS = {
  gather:{name:'Наследие лесоруба', max:5, desc:'+15% к добыче: ваши удары, жители, хутора'},
  flask: {name:'Запасливость',      max:3, desc:'+1 к запасу каждого зелья, старт с 2 зельями лечения'},
  fort:  {name:'Старый частокол',   max:1, desc:'Старт с главным домом 2 уровня и забором'},
  vet:   {name:'Ветеран',           max:3, desc:'Старт на 2 уровня героя выше'},
  steel: {name:'Закалённая сталь',  max:5, desc:'+10% урона героя'},
  heart: {name:'Крепкое здоровье',  max:5, desc:'+15 к здоровью'},
  hoard: {name:'Клад предков',      max:5, desc:'Старт со 150 древесины и 40 камня'},
  seek:  {name:'Удача искателя',    max:5, desc:'Выше шанс редких вещей'},
  keyr:  {name:'Ключник',           max:3, desc:'Старт с 2 ключами от склепов'},
};
function summonFinal(){
  const p=portalPos();if(!p||zombies.some(z=>z.final))return;
  const c=CFG.zombies[7];
  const z=makeZombie(7,p.x,p.y+60,false,null);
  z.boss=8;z.final=true;z.max=z.hp=c.hp*6*3*ngMul();z.r=46;z.dmg=Math.ceil(c.dmg*1.8*ngMul());z.speed=70;
  z.ab='all';z.skin='lord';z.abT=2;z.name='Владыка Мора';z.charge=0;z.slam=0;z.hx=p.x;z.hy=p.y;z.phase2=false;
  zombies.push(z);sfx.blood();toast('Владыка Мора вышел из портала!','bad');
}
function newGame(keepMeta){
  const meta=keepMeta?S.meta:null;
  S=newState();if(meta)S.meta=meta;
  // стартовые бонусы реликвий
  S.potions=rl('flask')?2:0;
  if(rl('fort')){S.base=2;S.fence.lvl=1;S.fence.hp=fenceHp(1);S.hq=hqMax(2)}
  for(let i=0;i<rl('vet')*2;i++){S.lvl++;S.perkPend++}
  S.wood+=150*rl('hoard');S.stone+=40*rl('hoard');S.keys+=2*rl('keyr');
  S.p.hp=maxHp(S.up.hp);
  DG=null;refugees=[];
  buildWorld();applyState();fillQuests();
}
function showVictory(){
  const st=S.stats;
  $('winTxt').textContent=`Владыка Мора повержен на ${S.day}-й день. Лес очищен${S.meta.ng?` (переселение ${S.meta.ng})`:''}.`;
  const rows=[['Пережито ночей',S.day-1],['Убито нечисти',st.kills],['Боссов повержено',st.bosses],['Склепов пройдено',st.crypts||0],['Уровень героя',S.lvl]];
  const ul=$('winList');ul.textContent='';
  for(const [k,v] of rows){const li=document.createElement('li');const a=document.createElement('span');a.textContent=k;const b=document.createElement('b');b.textContent=v;li.append(a,b);ul.append(li)}
  $('win').hidden=false;keys.clear();actHeld=false;sfx.levelup();
}
let relicOffer=[];
function showRelics(){
  if(!S.meta||S.meta.relicPend<=0)return;
  const open=Object.keys(RELICS).filter(k=>rl(k)<RELICS[k].max);
  relicOffer=open.sort(()=>Math.random()-0.5).slice(0,3);
  if(!relicOffer.length){S.meta.relicPend=0;return}
  $('perkTitle').textContent=`Реликвия: выберите (осталось ${S.meta.relicPend})`;
  const box=$('perkList');box.textContent='';
  for(const k of relicOffer){const R=RELICS[k],b=document.createElement('button');b.type='button';b.className='perk';b.dataset.relic=k;b.style.setProperty('--bc','#f4c766');
    b.innerHTML=`<small>Реликвия</small><b>${R.name}</b><span>${R.desc}</span><em>ранг ${rl(k)} → ${rl(k)+1} из ${R.max}</em>`;box.append(b)}
  $('perks').hidden=false;keys.clear();actHeld=false;
}
