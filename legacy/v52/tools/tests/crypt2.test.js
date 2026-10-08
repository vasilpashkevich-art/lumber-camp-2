// Склеп v2: один склеп, формы залов, время снаружи стоит, фазы босса, награды, комплекты
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
ok(g.crypts().length===1,'один склеп на мир');
g.S.p.hp=9999;g.S.up.hp=30;g.S.keys=50;g.S.bosses={1:true};const c=g.crypts()[0];
const clock0=g.S.clock,ext=g.zombies().find(z=>z.dun==null&&!z.boss);const ex0=ext&&[ext.x,ext.y];
g.P.x=c.x;g.P.y=c.y;g.enterCrypt(c);g.openCryptGate();frames(1);
const DG=g.DG;console.log('формы залов:',DG.rooms.map(r=>r.shape).join(' → '),'тема',DG.theme,'сложность',DG.diff);
ok(new Set(DG.rooms.map(r=>r.shape)).size>=3,'залы разной формы');
// пройти залы: идти к центру каждого зала, слуг и мертвецов убивать, босса бить понемногу
let phases=new Set(),shieldSeen=false,hzSeen=false,rageSeen=false;
const step=()=>{g.S.p.hp=9999;g.S.perkPend=0;els.perks.hidden=true;const B=DG.boss;
  if(B&&g.zombies().includes(B)){phases.add(B.phase);if(B.shield)shieldSeen=true;if(DG.hz.length)hzSeen=true;if(B.rage)rageSeen=true}
  for(const z of g.zombies().filter(z=>z.dun!=null).slice()){if(z===B){g.hitZombie(z,z.max*0.004,g.P.x,g.P.y,'melee')}else if(!z.shield)g.killZombie(z)}};
const walkTo=(tx,ty,maxF=2500)=>{for(let i=0;i<maxF&&!DG.chest;i++){step();const dx=tx-g.P.x,dy=ty-g.P.y;key('KeyD',dx>8);key('KeyA',dx<-8);key('KeyS',dy>8);key('KeyW',dy<-8);frames(1);if(Math.abs(dx)<10&&Math.abs(dy)<10&&!(DG.boss&&g.zombies().includes(DG.boss)))break}for(const k of ['KeyD','KeyA','KeyS','KeyW'])key(k,false)};
for(const r of DG.rooms)walkTo(r.x+r.w/2,g.DG?r.y+r.h/2:0);
for(let i=0;i<3000&&!DG.chest;i++){step();frames(1)}
ok(DG.chest,'дошёл до сундука');ok(phases.size===3,'три фазы босса: '+[...phases]);ok(shieldSeen,'щит пока живы слуги');ok(hzSeen||rageSeen,'опасные места или ярость');
ok(g.S.clock===clock0,'время снаружи стояло');ok(!ext||(ext.x===ex0[0]&&ext.y===ex0[1]),'мертвецы снаружи не двигались');
// стены: герой не выходит за форму зала
const last=DG.rooms.at(-1);g.P.x=last.x+5;g.P.y=last.y+5;frames(2);const inside=last.pieces.some(p=>{const u=Math.abs(g.P.x-p.x),v=Math.abs(g.P.y-p.y);return p.o?u<=p.hw&&v<=p.hh&&u+v<=p.hw+p.hh-p.k+2:true});ok(inside,'угол восьмиугольника срезан стеной');
// награды
const w0=g.S.wood,runs0=g.S.cryptRuns||0;g.openDunChest();ok(g.S.wood>w0&&g.S.cryptRuns===runs0+1,'древесина и счётчик походов');ok(g.drops().filter(d=>d.kind==='potion'||d.kind==='potatk').length>=2,'зелья в награду');
// гарантия комплекта и без повторов
g.S.cls='warrior';g.S.inv=[];g.S.setPity=14;const before=g.drops().filter(d=>d.kind==='item').length;
g.DG.chest.open=false;g.openDunChest();const setDrops=g.drops().filter(d=>d.kind==='item'&&d.it.set==='warrior');ok(setDrops.length>=1,'гарантия через 15 походов');
g.S.inv=[g.makeSetItem('warrior','head',3),g.makeSetItem('warrior','armor',3)];let slots=new Set();for(let i=0;i<40;i++){g.S.setPity=15;g.DG.chest.open=false;const n0=g.drops().length;g.openDunChest();for(const d of g.drops().slice(n0))if(d.kind==='item'&&d.it.set)slots.add(d.it.slot)}
ok(slots.size===1&&slots.has('legs'),'выпадают только недостающие вещи');
// бонус комплекта
g.S.eq.head=g.S.inv[0];g.S.eq.armor=g.S.inv[1];ok(g.setCount('warrior')===2&&g.gear('dmg')>=15,'бонус 2 вещей +15% урона');
// сложность растёт
const d1=g.cryptDiff();g.S.cryptRuns+=5;ok(g.cryptDiff()===d1+10,'сложность растёт с походами');
console.log(bad?'FAILED '+bad:'crypt2 ok');
