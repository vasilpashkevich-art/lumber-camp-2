// Варвар живучее (здоровье, защита, дальность, Вихрь); после гибели 4 с неуязвимости; вторая гибель за ночь — без сознания до рассвета
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S;els.perks.hidden=true;S.perkPend=0;
S.cls='mage';const hm=g.maxHp(S.up.hp);S.cls='warrior';const hw=g.maxHp(S.up.hp);ok(Math.abs(hw/hm-1.4)<0.05,`здоровье Варвара ×1,4: ${hw} против ${hm}`);
ok(g.heroArmor()===15,'защита Варвара со старта 15%');S.cls='archer';ok(g.heroArmor()===0,'у Лучника без вещей 0%');S.cls='warrior';
// урон: защита и Вихрь
S.p.hp=1000;g.P.rez=0;g.P.ko=false;g.damagePlayer(100);const d1=1000-S.p.hp;ok(Math.abs(d1-85)<0.01,'Варвар получает 85 из 100: '+d1);
S.p.hp=1000;g.RX.whirl=1;g.damagePlayer(100);const d2=1000-S.p.hp;ok(Math.abs(d2-42.5)<0.01,'в Вихре вдвое меньше: '+d2);g.RX.whirl=0;
// дальность
g.zombies().length=0;g.P.x=g.CX+700;g.P.y=g.CX;const z=g.makeZombie(1,g.P.x+z0(),g.P.y,false,null);function z0(){return 0}z.x=g.P.x+16+50;z.speed=0;z.dmg=0;g.zombies().push(z);S.weapon='axe';
let t=g.findTarget();ok(t&&t.o===z,'Варвар достаёт врага на расстоянии 50 от края');S.cls='archer';t=g.findTarget();ok(!(t&&t.o===z),'Лучник с топором так далеко не достаёт');S.cls='warrior';g.zombies().length=0;
// смерть ночью: первая — 4 с неуязвимости, вторая — без сознания до рассвета
S.clock=g.CFG.dayLen+5;g.startNight();g.P.x=g.CX+300;g.P.y=g.CX;S.p.hp=-1;frames(1);ok(g.P.rez>3&&!g.P.ko&&Math.hypot(g.P.x-g.CX,g.P.y-g.CX-40)<5,'первая гибель: ожил в ратуше, неуязвим');
const h0=S.p.hp;g.damagePlayer(50);ok(S.p.hp===h0,'урон не проходит, пока светится');
g.P.rez=0;S.p.hp=-1;frames(1);ok(g.P.ko===true,'вторая гибель за ночь — без сознания');
const zz=g.makeZombie(2,g.P.x+40,g.P.y,false,1);zz.hx=zz.x;zz.hy=zz.y;g.zombies().push(zz);frames(20);ok(!zz.chasing,'мертвецы не гонятся за героем без сознания');
const px=g.P.x;g.keys.add('KeyD');frames(10);g.keys.delete('KeyD');ok(g.P.x===px,'без сознания герой не ходит');
g.endNight();ok(!g.P.ko&&S.p.hp===g.maxHp(S.up.hp)&&g.P.rez>3,'на рассвете очнулся с полным здоровьем');
// ратуша пала, пока герой без сознания — лагерь пал
S.clock=g.CFG.dayLen*2+g.CFG.nightLen+5;g.startNight();S.night.deaths=1;g.P.rez=0;S.p.hp=-1;frames(1);ok(g.P.ko,'снова без сознания');S.hq=0;frames(1);ok(S.over,'ратуша разрушена — лагерь пал');
console.log(bad?'FAILED '+bad:'warrior rez ok');
