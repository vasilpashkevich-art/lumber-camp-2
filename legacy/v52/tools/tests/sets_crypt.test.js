// Склеп раз в 3 дня, из сундука всегда вещь, комплект 10% с гарантией через 6 походов; способности комплектов; вещи комплекта переживают переселение
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S;S.cls='warrior';S.p.hp=1e6;
const c=g.crypts()[0];S.keys=5;S.day=4;g.P.x=c.x;g.P.y=c.y;
let t=g.specialTarget();ok(t&&t.ok,'склеп открыт');g.enterCrypt(c);g.openCryptGate();ok(S.crypts[c.id]===7,'после врат закрыт до 7-го дня');g.leaveCrypt();
S.day=5;g.P.x=c.x;g.P.y=c.y;t=g.specialTarget();ok(t&&!t.ok&&/7-й день/.test(t.msg),'на 5-й день закрыт: '+(t&&t.msg));S.day=7;t=g.specialTarget();ok(t&&t.ok,'на 7-й день снова открыт');
// сундук: всегда вещь; комплект — гарантия на 6-м походе без удачи
let items=0,sets=0;const R=Math.random;Math.random=()=>0.99;
for(let i=0;i<6;i++){S.keys=5;g.enterCrypt(c);g.openCryptGate();const D=g.DG;D.chest={x:g.P.x,y:g.P.y,open:false};const n0=g.drops().length;g.openDunChest();const nd=g.drops().slice(n0).filter(d=>d.kind==='item');items+=nd.filter(d=>!d.it.set).length;sets+=nd.filter(d=>d.it.set).length;g.leaveCrypt();S.keys=5;S.day+=3}
Math.random=R;ok(items===6,'каждый поход — вещь: '+items);ok(sets===1,'без удачи вещь комплекта на 6-м походе: '+sets);
// способности (окно выбора умения после походов закрываем, чтобы игра не стояла)
S.perkPend=0;els.perks.hidden=true;els.dawn.hidden=true;
const eqSet=id=>{for(const sl of ['head','armor','legs'])S.eq[sl]=g.makeSetItem(id,sl,3)};
eqSet('warrior');ok(g.fullSet()==='warrior','весь комплект Варвара надет');
g.zombies().length=0;g.P.x=g.CX+700;g.P.y=g.CX;const mk=(dx,dy)=>{const z=g.makeZombie(3,g.P.x+dx,g.P.y+dy,false,null);z.hp=z.max=1e4;z.speed=0;z.dmg=0;z.chasing=true;z.canChase=true;z.hx=z.x;z.hy=z.y;g.zombies().push(z);return z};
let A=[mk(-150,0),mk(0,150),mk(120,-100)];g.SX.cd=0;g.useSetAbility();for(let i=0;i<120;i++){A.forEach(z=>z.chasing=true);els.perks.hidden=true;frames(1)}ok(A.every(z=>z.hp<1e4),'Буря молотов бьёт всех гонящихся');ok(g.SX.cd>0,'перезарядка');
eqSet('archer');g.zombies().length=0;A=[mk(200,0),mk(230,20),mk(210,-25)];g.SX.cd=0;g.useSetAbility();for(let i=0;i<50;i++){A.forEach(z=>z.chasing=true);els.perks.hidden=true;frames(1)}ok(A.every(z=>z.hp<1e4),'Дождь стрел бьёт толпу');
eqSet('mage');g.zombies().length=0;A=[mk(200,0),mk(230,20),mk(210,-25)];g.SX.cd=0;for(let i=0;i<40;i++){A.forEach(z=>z.chasing=true);els.perks.hidden=true;frames(1)}ok(A.every(z=>z.hp<1e4&&z.burn>0),'Огненная глыба падает сама и поджигает');
// переселение: комплект остаётся, остальное сгорает
S.inv=[g.makeItem(3,1)];const ids=['head','armor','legs'].map(sl=>S.eq[sl].id);S.eq.weapon=g.makeItem(3,1,'weapon');
g.newGameF(true);ok(['head','armor','legs'].every((sl,i)=>g.S.eq[sl]&&g.S.eq[sl].id===ids[i]),'вещи комплекта надеты после переселения');ok(!g.S.eq.weapon&&g.S.inv.length===0,'остальные вещи сгорели');
ok(g.S.itemSeq>Math.max(...ids),'новые вещи не путаются со старыми');
console.log(bad?'FAILED '+bad:'sets ok');
