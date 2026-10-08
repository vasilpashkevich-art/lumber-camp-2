// Оборона: ров замедляет, ловушки ранят и ломаются, баллиста бьёт насквозь, чаши поджигают, мастерская чинит, стража, лёд скользкий, сохранение
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S,CX=g.CX,R=205;S.base=6;S.wood=1e6;S.stone=1e6;S.fence.lvl=2;S.fence.hp=50;g.P.x=CX;g.P.y=CX;
const mk=(x,y,hp=500)=>{const z=g.makeZombie(3,x,y,true,null);z.hp=z.max=hp;z.dmg=0;g.zombies().push(z);return z};
// покупки
for(const a of ['moat','traps','guardup','shop','ball:0','bowl:0'])ok(g.defAct(a.split(':')[0],a.split(':')[1])&&true,'куплено '+a);
ok(S.def.moat===1&&S.def.traps===1&&S.def.guard===2&&S.def.shop===1&&S.def.ball[0]===1&&S.def.bowl[0]===1,'уровни выросли');
// ров
const zm={fly:false};ok(Math.abs(g.zSlow(zm,R+20,0.01)-g.DEF.moat.slow[1])<1e-9,'во рву медленнее');ok(g.zSlow(zm,R+200,0.01)===1,'вне рва обычная скорость');
// ловушка
g.zombies().length=0;const tp=g.trapPos(0),zt=mk(tp.x,tp.y);const u0=S.def.tu[0];g.updateDefense(0.05);ok(zt.hp<500&&zt.slowT>0&&S.def.tu[0]===u0-1,'ловушка ранит, замедляет и изнашивается');
S.def.tu[0]=0;const zt2=mk(tp.x,tp.y);g.updateDefense(2);ok(zt2.hp===500,'сломанная ловушка не срабатывает');
g.defAct('trapfix');ok(S.def.tu[0]===g.DEF.traps.uses,'ловушки чинятся');
// баллиста: насквозь
g.zombies().length=0;const bp=g.ballPos(0);const a1=mk(bp.x+120,bp.y),a2=mk(bp.x+200,bp.y+5),a3=mk(bp.x+120,bp.y+150);g.updateDefense(3.1);ok(a1.hp<500&&a2.hp<500&&a3.hp===500,'баллиста пробивает линию, мимо — цел');
// чаша
g.zombies().length=0;const op=g.bowlPos(0),f1=mk(op.x,op.y-150),f2=mk(op.x+20,op.y-160);g.updateDefense(4.1);ok(f1.burn>0&&f2.burn>0,'чаша поджигает толпу');
// мастерская ночью
S.clock=150+1;g.zombies().length=0;const h0=S.fence.hp;g.updateDefense(1);ok(S.fence.hp>h0,'мастерская ночью чинит забор '+h0+'→'+S.fence.hp.toFixed(1));
S.clock=10;const h1=S.fence.hp;g.updateDefense(1);ok(S.fence.hp===h1,'днём не чинит');
// стража
ok(Math.abs(g.guardDmg()-(1.5+0.5*S.base)*1.6)<1e-9,'стража ур. 2 бьёт сильнее');
// сохранение
const st=g.migrate(JSON.parse(JSON.stringify(S)));ok(st.def.moat===1&&st.def.ball[0]===1&&st.def.guard===2,'оборона сохраняется');
const old=g.migrate({v:12,seed:4242,meta:{ng:0,relics:{},wins:0,relicPend:0}});ok(old.def.guard===1&&old.def.moat===0&&old.def.tu.length===20,'старое сохранение: оборона по умолчанию');
// лёд
const ice=g.patches().find(p=>p.kind==='ice');ok(!!ice,'есть замёрзшие озёра');
if(ice){ok(g.onIce(ice.x,ice.y)&&!g.onIce(ice.x+ice.r*2,ice.y),'проверка льда');
  g.P.x=ice.x-ice.r*0.4;g.P.y=ice.y;g.P.ivx=0;g.P.ivy=0;g.keys.add('KeyD');frames(15);g.keys.delete('KeyD');const x0=g.P.x;frames(8);ok(g.P.x-x0>8,'на льду скользишь после остановки: '+(g.P.x-x0).toFixed(0));
  const tr=g.trees().find(t=>t.alive);g.P.x=CX+300;g.P.y=CX;frames(2);g.keys.add('KeyD');frames(15);g.keys.delete('KeyD');const x1=g.P.x;frames(8);ok(Math.abs(g.P.x-x1)<3,'на земле останавливаешься сразу')}
console.log(bad?'FAILED '+bad:'defense ok');
