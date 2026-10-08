// ---------- СКЛЕП: один на мир, залы разных форм, босс с фазами ----------
function buildCrypts(spots,rng2){
  crypts=[];
  const free=(x,y,r)=>spots.every(s=>dist(s.x,s.y,x,y)>s.r+r+20)&&trees.every(t=>Math.abs(t.x-x)>r+20||dist(t.x,t.y,x,y)>r+20);
  for(const zid of [3,2,4])for(let g=0;g<120&&!crypts.length;g++){const p=randInZone(zid,rng2,110,{noSide:true});if(!p)break;if(!free(p.x,p.y,50))continue;
    crypts.push({id:'c',zone:zid,x:p.x,y:p.y});spots.push({x:p.x,y:p.y,r:50});trees=trees.filter(t=>dist(t.x,t.y,p.x,p.y)>70)}
}
const cryptDiff=()=>S.lvl+2*(S.cryptRuns||0);
const cryptTier=()=>Math.max(1,Math.min(7,1+Math.floor(cryptDiff()/5)));
const cryptMul=()=>1+0.05*Math.max(0,cryptDiff()-35);
// фазы боссов склепа: minions — слуги держат щит, hazard — опасные места на полу, rage — ярость
const CRYPT_PH={
  slime: [{k:'minions',n:'Слуги',h:'Щит держится, пока живы слизни — бейте их',kind:'slimelet',cnt:5},{k:'hazard',n:'Слизистые лужи',h:'Лужи слизи жгут и замедляют — не стойте в них',hz:'pool',col:'110,190,80'},{k:'rage',n:'Деление',h:'Королева делится и ускоряется — добивайте',split:true}],
  treant:[{k:'hazard',n:'Корни',h:'Красные круги — сюда ударят корни. Уходите и бейте в паузах',hz:'burst',col:'207,75,63'},{k:'minions',n:'Пни-стрелки',h:'Щит держится, пока стреляют пни — сломайте их',kind:'spitter',cnt:3},{k:'rage',n:'Ярость',h:'Удары оземь чаще — держите дистанцию'}],
  hydra: [{k:'hazard',n:'Кислота',h:'Кислотные лужи — обходите их',hz:'pool',col:'150,210,90'},{k:'minions',n:'Головы',h:'Щит держится, пока живы плевуны',kind:'spitter',cnt:3},{k:'rage',n:'Ярость',h:'Гидра бьёт чаще — бейте и отходите'}],
  croc:  [{k:'rage',n:'Рывки',h:'Ящер бросается вперёд — уходите рывком в сторону'},{k:'hazard',n:'Топь',h:'Болотная вода засасывает — не стойте в ней',hz:'pool',col:'60,110,110'},{k:'minions',n:'Выводок',h:'Щит держится, пока живы бегуны',kind:'runner',cnt:5}],
  dragon:[{k:'minions',n:'Выводок',h:'Щит держится, пока живы бегуны',kind:'runner',cnt:4},{k:'hazard',n:'Огненный дождь',h:'Красные круги — сюда упадёт огонь',hz:'burst',col:'255,120,40'},{k:'rage',n:'Ярость',h:'Огонь чаще — держитесь сбоку'}],
  golem: [{k:'minions',n:'Обломки',h:'Щит держится, пока живы тараны',kind:'ram',cnt:3},{k:'hazard',n:'Камнепад',h:'Красные круги — сюда рухнут камни',hz:'burst',col:'200,160,120'},{k:'rage',n:'Ярость',h:'Голем бьёт чаще — не стойте рядом'}],
  lich:  [{k:'minions',n:'Мёртвая свита',h:'Щит держится, пока живы плевуны',kind:'spitter',cnt:4},{k:'hazard',n:'Могилы',h:'Красные круги — из-под земли ударят руки',hz:'burst',col:'120,230,150'},{k:'rage',n:'Ярость',h:'Царь Мор бьёт всеми приёмами'}],
  yeti:  [{k:'hazard',n:'Лёд',h:'Синие круги — ледяные шипы, они замедляют',hz:'burst',col:'126,200,255',slow:true},{k:'minions',n:'Снежная свита',h:'Щит держится, пока живы бегуны',kind:'runner',cnt:5},{k:'rage',n:'Ярость',h:'Великан бьёт чаще — держите дистанцию'}],
};
const ROOM_SZ={entry:[360,300],rect:[480,360],round:[440,440],cross:[480,480],gallery:[560,340],L:[480,420],oct:[660,560]};
function roomPieces(r){const {x,y,w,h}=r;
  if(r.shape==='round')return [{c:1,x:x+w/2,y:y+h/2,r:w/2}];
  if(r.shape==='oct')return [{o:1,x:x+w/2,y:y+h/2,hw:w/2,hh:h/2,k:w*0.29}];
  if(r.shape==='cross')return [{x:x+w/3,y,w:w/3,h},{x,y:y+h/3,w,h:h/3}];
  if(r.shape==='L')return [{x,y,w:w*0.45,h},{x:x+w*0.45,y:y+h*0.35,w:w*0.55,h:h*0.65}];
  return [{x,y,w,h}]}
function inPiece(p,x,y,rad){if(p.c)return dist(x,y,p.x,p.y)<=p.r-rad;if(p.o){const u=Math.abs(x-p.x),v=Math.abs(y-p.y);return u<=p.hw-rad&&v<=p.hh-rad&&u+v<=p.hw+p.hh-p.k-rad*1.42}
  return x>=p.x+rad&&x<=p.x+p.w-rad&&y>=p.y+rad&&y<=p.y+p.h-rad}
function nearIn(p,x,y,rad){
  if(p.c){const d=dist(x,y,p.x,p.y)||1,m=Math.max(1,p.r-rad);return d<=m?{x,y}:{x:p.x+(x-p.x)/d*m,y:p.y+(y-p.y)/d*m}}
  if(p.o){let u=x-p.x,v=y-p.y;const su=Math.sign(u)||1,sv=Math.sign(v)||1;u=Math.min(Math.abs(u),p.hw-rad)*su;v=Math.min(Math.abs(v),p.hh-rad)*sv;const lim=p.hw+p.hh-p.k-rad*1.42,s=Math.abs(u)+Math.abs(v)-lim;if(s>0){u-=su*s/2;v-=sv*s/2}return {x:p.x+u,y:p.y+v}}
  return {x:Math.max(p.x+rad,Math.min(p.x+p.w-rad,x)),y:Math.max(p.y+rad,Math.min(p.y+p.h-rad,y))}}
function enterCrypt(c){
  S.keys--;
  const d=cryptDiff(),tier=cryptTier(),n=4+(d>=15?1:0)+(d>=30?1:0);
  const beaten=Object.keys(S.bosses).filter(k=>S.bosses[k]&&CFG.bosses[k]).map(Number),theme=beaten.length?randOf(beaten):1;
  const mid=['rect','round','cross','gallery','L'].sort(()=>Math.random()-0.5);
  const rooms=[],cors=[];let x=DUN.X;
  for(let i=0;i<n;i++){const shape=i===0?'entry':i===n-1?'oct':mid[(i-1)%mid.length],[w,h]=ROOM_SZ[shape];
    const r={i,shape:shape==='entry'?'rect':shape,x,y:DUN.Y-h/2,w,h,spawned:false,cleared:false,last:i===n-1,cols:[]};
    if(shape==='gallery')for(let k=0;k<4;k++)for(const yy of [0.3,0.7])r.cols.push({x:x+90+k*(w-180)/3,y:r.y+h*yy,r:16});
    if(shape==='round')r.cols.push({x:x+w/2,y:DUN.Y-90,r:26});
    r.pieces=roomPieces(r);rooms.push(r);x+=w;
    if(i<n-1){cors.push({i,x,y:DUN.Y-75,w:170,h:150});x+=170}}
  const traps=[];for(const r of rooms){if(r.i===0||r.last)continue;const k=1+Math.floor(tier/2);for(let j=0;j<k;j++){for(let g=0;g<20;g++){const tx=r.x+80+Math.random()*(r.w-160),ty=r.y+70+Math.random()*(r.h-140);if(r.pieces.some(p=>inPiece(p,tx,ty,30))&&r.cols.every(q=>dist(q.x,q.y,tx,ty)>q.r+30)){traps.push({x:tx,y:ty,t:Math.random()*2.4,hit:false,room:r.i});break}}}}
  DG={crypt:c,zone:c.zone,tier,diff:d,theme,skin:CFG.bosses[theme].skin,rooms,cors,traps,chest:null,exit:null,ex:c.x,ey:c.y+46,entry:{x:rooms[0].x+60,y:DUN.Y},hz:[],hzT:2,banner:null,boss:null,seed:Math.floor(Math.random()*1e6)};
  P.x=rooms[0].x+110;P.y=DUN.Y;S.p.x=P.x;S.p.y=P.y;
  sfx.roar(0.25);toast(`Склеп: ${n} залов, в конце — ${CFG.bosses[theme].name}. Сложность ${d}. Снаружи время стоит.`,'');
}
function leaveCrypt(msg){
  if(!DG)return;
  for(let i=zombies.length-1;i>=0;i--)if(zombies[i].dun!=null)zombies.splice(i,1);
  P.x=DG.ex;P.y=DG.ey;S.p.x=P.x;S.p.y=P.y;DG=null;spits=[];
  if(msg)toast(msg,'good');save();
}
function dunPieces(){const R=[];for(const r of DG.rooms){if(r.i===0||DG.rooms[r.i-1].cleared)R.push(...r.pieces)}for(const c of DG.cors)if(DG.rooms[c.i].cleared)R.push({x:c.x-60,y:c.y,w:c.w+120,h:c.h});return R}
const dunRects=dunPieces;
function clampIn(o,rad,ps){if(ps.some(p=>inPiece(p,o.x,o.y,rad)))return;let best=null,bd=1e9;for(const p of ps){const q=nearIn(p,o.x,o.y,rad),d=(q.x-o.x)**2+(q.y-o.y)**2;if(d<bd){bd=d;best=q}}if(best){o.x=best.x;o.y=best.y}}
function pushCols(o,rad,r){for(const c of r.cols){const d=dist(o.x,o.y,c.x,c.y),m=c.r+rad;if(d<m&&d>0){o.x=c.x+(o.x-c.x)/d*m;o.y=c.y+(o.y-c.y)/d*m}}}
function roomAt(x,y){return DG.rooms.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)}
function cryptBoss(room){
  const tier=DG.tier,c=CFG.zombies[tier],b=CFG.bosses[DG.theme],cx=room.x+room.w/2,cy=DUN.Y;
  const z=makeZombie(tier,cx+room.w*0.18,cy,false,null);
  z.guard=true;z.cboss=true;z.max=z.hp=c.hp*10*cryptMul()*(1+0.05*(S.cryptRuns||0))*ngMul();z.r=c.r*2;z.dmg=Math.ceil(c.dmg*1.5*cryptMul()*ngMul());z.speed=c.speed*0.8;
  z.ab=b.ability;z.skin=b.skin;z.abT=2.5;z.name=b.name;z.charge=0;z.slam=0;z.dun=room.i;z.phase=0;z.hx=cx;z.hy=cy;
  return z}
function setPhase(z,ph){const P2=CRYPT_PH[DG.skin]||CRYPT_PH.slime,d=P2[ph-1];z.phase=ph;z.rage=d.k==='rage';z.ph_=d;
  DG.banner={t:3.2,text:`Фаза ${ph} из 3: ${d.n}`};sfx.roar(0.45);shake(4,0.3);
  if(d.k==='minions')spawnMinions(z,d);
  if(d.split){for(let k=0;k<2;k++){const m=makeZombie(DG.tier,z.x+(k?60:-60),z.y+40,false,null);m.skin='slimelet';m.r=z.r*0.6;m.max=m.hp=z.max*0.08;m.dmg=z.dmg*0.6;m.speed*=1.2;m.dun=z.dun;zombies.push(m)}}
  if(z.rage){z.speed*=1.4}}
function spawnMinions(z,d){const room=DG.rooms[z.dun];for(let k=0;k<d.cnt;k++){const a=k/d.cnt*6.283,mx=z.x+Math.cos(a)*90,my=z.y+Math.sin(a)*90;
  const m=makeZombie(Math.max(1,DG.tier-1),mx,my,false,null,d.kind==='slimelet'?undefined:d.kind);if(d.kind==='slimelet'){m.skin='slimelet';m.r*=0.8}m.minion=true;m.dun=z.dun;clampIn(m,m.r,room.pieces);zombies.push(m)}
  z.minT=0}
function updateDungeon(dt){
  if(!DG)return;
  clampIn(P,14,dunPieces());
  const room=roomAt(P.x,P.y);if(room)pushCols(P,14,room);
  if(DG.banner){DG.banner.t-=dt;if(DG.banner.t<=0)DG.banner=null}
  if(room&&!room.spawned&&P.x>room.x+(room.i===0?room.w*0.3:50)){
    room.spawned=true;const tier=DG.tier;
    if(room.last){const z=cryptBoss(room);zombies.push(z);DG.boss=z;setPhase(z,1);toast(`${z.name} пробудился!`,'bad')}
    else{const n=Math.min(10,3+tier);for(let k=0;k<n;k++){const kinds=tier>=3?[undefined,'runner','ram','spitter']:[undefined,'runner'];
      let zx=0,zy=0;for(let g=0;g<20;g++){zx=room.x+room.w*0.4+Math.random()*room.w*0.55;zy=room.y+50+Math.random()*(room.h-100);if(room.pieces.some(p=>inPiece(p,zx,zy,20)))break}
      const z=makeZombie(tier,zx,zy,false,null,randOf(kinds));z.max=z.hp=z.hp*cryptMul();z.dun=room.i;zombies.push(z)}}
  }
  for(const r of DG.rooms){
    if(!r.spawned||r.cleared)continue;
    if(!zombies.some(z=>z.dun===r.i)){
      r.cleared=true;
      if(r.last){DG.chest={x:r.x+r.w/2,y:DUN.Y,open:false};DG.hz=[];toast(`${CFG.bosses[DG.theme].name} повержен(а). Откройте сундук.`,'good')}
      else {toast('Зал очищен, проход открыт','good');sfx.dawn()}
    }
  }
  for(const z of zombies){if(z.dun==null)continue;const r=DG.rooms[z.dun];if(r){clampIn(z,z.r,r.pieces);pushCols(z,z.r,r)}}
  // босс: фазы, щит, опасные места
  const B=DG.boss;
  if(B&&zombies.includes(B)){
    const f=B.hp/B.max;if(B.phase<2&&f<=2/3)setPhase(B,2);else if(B.phase<3&&f<=1/3)setPhase(B,3);
    const d=B.ph_;const mins=zombies.some(m=>m.minion&&m.dun===B.dun);B.shield=d.k==='minions'&&mins;
    if(d.k==='minions'&&!mins){B.minT=(B.minT||0)+dt;if(B.minT>12)spawnMinions(B,d)}
    if(B.rage)B.abT-=dt*0.7;
    if(d.k==='hazard'){DG.hzT-=dt;if(DG.hzT<=0){DG.hzT=1.7;const rr=DG.rooms[B.dun];
      for(let k=0;k<2;k++){const hx=k?rr.x+80+Math.random()*(rr.w-160):P.x+(Math.random()-0.5)*60,hy=k?rr.y+80+Math.random()*(rr.h-160):P.y+(Math.random()-0.5)*60;DG.hz.push({x:hx,y:hy,r:d.hz==='pool'?46:40,warn:1.1,life:d.hz==='pool'?5:0.35,kind:d.hz,col:d.col,slow:d.slow,tick:0})}}}
  }
  for(const h of DG.hz){if(h.warn>0){h.warn-=dt;if(h.warn<=0){shake(2,0.1);if(dist(h.x,h.y,P.x,P.y)<h.r+10){damagePlayer(Math.max(2,maxHp(S.up.hp)*(h.kind==='pool'?0.06:0.14)));if(h.slow)P.slowT=1.5}}continue}
    h.life-=dt;if(h.kind==='pool'&&dist(h.x,h.y,P.x,P.y)<h.r){h.tick-=dt;P.slowT=Math.max(P.slowT||0,0.2);if(h.tick<=0){h.tick=0.5;damagePlayer(Math.max(1,maxHp(S.up.hp)*0.04))}}}
  DG.hz=DG.hz.filter(h=>h.warn>0||h.life>0);
  for(const t of DG.traps){
    const r=DG.rooms[t.room];if(!r.spawned)continue;
    t.t=(t.t+dt)%2.4;const armed=t.t>1.8;
    if(!armed)t.hit=false;
    else if(!t.hit&&dist(t.x,t.y,P.x,P.y)<24){t.hit=true;damagePlayer(Math.max(3,maxHp(S.up.hp)*0.12));sfx.slam()}
  }
}
function makeGuardian(zid,x,y){
  const zn=zoneById(zid)||{ztier:6},c=CFG.zombies[zn.ztier],b=CFG.bosses[zid];
  const z=makeZombie(zn.ztier,x,y,false,null);
  z.guard=true;z.max=z.hp=c.hp*3*ngMul();z.r=c.r*1.6;z.dmg=Math.ceil(c.dmg*1.4*ngMul());z.speed=c.speed*0.8;
  z.ab=b.ability==='dragon'?'charge':b.ability;z.skin=b.skin;z.abT=2;z.name='Хранитель склепа';z.charge=0;z.slam=0;
  return z;
}
// --- комплекты: по одному на класс, голова/грудь/ноги
const SETS={
  warrior:{name:'Доспех Варвара',   col:'#d9784a',pieces:{head:['Рогатый шлем Варвара','m'],armor:['Нагрудник Варвара','m'],legs:['Поножи Варвара','p']},b2:{dmg:15},b3:{hp:30,armor:10,vamp:1},d2:'+15% урона',d3:'+30 здоровья, +10% защиты, +1 здоровья за убийство'},
  mage:   {name:'Облачение Чародея',col:'#8a7aff',pieces:{head:['Венец Чародея','m'],armor:['Мантия Чародея','f'],legs:['Шаровары Чародея','p']},b2:{crit:12},b3:{burn:35,dmg:10},d2:'+12% шанс крита',d3:'+35% шанс поджога, +10% урона'},
  archer: {name:'Снаряжение Следопыта',col:'#5fc98a',pieces:{head:['Капюшон Следопыта','m'],armor:['Куртка Следопыта','f'],legs:['Штаны Следопыта','p']},b2:{spd:15},b3:{move:12,dbl:10,crit:6},d2:'+15% скорости удара',d3:'+12% скорости бега, +10% двойной добычи, +6% крита'},
};
const setCount=id=>Object.values(S.eq||{}).filter(it=>it&&it.set===id).length;
function setBonus(k){let v=0;for(const id in SETS){const n=setCount(id),s=SETS[id];if(n>=2)v+=s.b2[k]||0;if(n>=3)v+=s.b3[k]||0}return v}
function makeSetItem(setId,slot,tier){const it={id:S.itemSeq++,slot,rar:4,tier:Math.max(1,Math.min(7,tier)),mods:rollMods(slot,Math.max(1,Math.min(7,tier)),2),uq:null,set:setId};it.name=SETS[setId].pieces[slot][0];return it}
const ownedSet=id=>S.inv.concat(Object.values(S.eq)).filter(it=>it&&it.set===id).map(it=>it.slot);
function openDunChest(){
  const c=DG.chest;if(!c||c.open)return;c.open=true;
  const t=DG.tier,w=Math.round((60+50*t)*cryptMul()),st=Math.round((20+18*t)*cryptMul()),iron=2+t,sh=2+t;
  S.wood+=w;S.stone+=st;S.iron+=iron;S.shards+=sh;S.stats.chests++;
  drops.push({x:c.x+50,y:c.y-30,kind:'potion',t:300});drops.push({x:c.x-50,y:c.y-30,kind:'potatk',t:300});if(Math.random()<0.5)drops.push({x:c.x,y:c.y-50,kind:'potion',t:300});
  S.cryptRuns=(S.cryptRuns||0)+1;S.setPity=(S.setPity||0)+1;
  // комплект: 5% или гарантия через 15 походов, только недостающие вещи
  const setId=S.cls&&SETS[S.cls]?S.cls:randOf(Object.keys(SETS)),miss=['head','armor','legs'].filter(sl=>!ownedSet(setId).includes(sl));
  if(miss.length&&(Math.random()<0.05||S.setPity>=15)){S.setPity=0;const it=makeSetItem(setId,randOf(miss),t+1);drops.push({x:c.x,y:c.y+50,kind:'item',it,t:600});toast(`Вещь комплекта: ${it.name}!`,'good');sfx.levelup();burst(c.x,c.y,40,[SETS[setId].col,'#ffffff'],240,0.9,3.5)}
  sfx.chest();gainXp(25*t);
  addFloat(c.x,c.y-40,`+${w} древесины, +${st} камня, +${iron} железа, +${sh} осколков`,'#f4c766');
  DG.exit={x:c.x+160,y:c.y};
  toast(`Склеп пройден ${S.cryptRuns}-й раз. Портал к выходу — справа от сундука.`,'good');save();
}
