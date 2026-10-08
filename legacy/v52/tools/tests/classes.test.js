// Классы: второе оружие, способности на C, умения по классам, сохранение класса
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const setup=cl=>{g.S.cls=cl;g.S.bow=6;g.S.weapon='bow';g.S.up.axe=8;g.zombies().length=0;g.P.x=g.CX;g.P.y=g.CX-400;g.P.face=0;g.P.abCd=0;g.S.p.hp=9999;g.RX.fb.length=0};
const mk=(dx,dy,hp=400)=>{const z=g.makeZombie(3,g.P.x+dx,g.P.y+dy,false,3);z.hp=z.max=hp;z.speed=0;z.r=14;z.dmg=0;g.zombies().push(z);return z};
// воин: молот бьёт по площади вблизи
setup('warrior');let a=mk(30,0),b=mk(60,30),far=mk(300,0);g.secAttack({k:'z',o:a,ok:true});ok(a.hp<400&&b.hp<400&&far.hp===400,'молот: цель и сосед, дальний цел');
const t=g.findTarget();ok(!t||t.o!==far,'молот не достаёт далёкую цель');
// вихрь
setup('warrior');a=mk(50,0);b=mk(-40,40);g.useAbility();frames(40);ok(a.hp<400&&b.hp<400&&g.P.abCd>0,'вихрь бьёт всех вокруг, перезарядка '+g.P.abCd.toFixed(1));
// маг: огненный шар (трассер) и залп
setup('mage');a=mk(200,0);g.secAttack({k:'z',o:a,ok:true});ok(a.hp<400&&g.tracers.some(tr=>tr.fire),'посох: огненный шар');
setup('mage');a=mk(220,0);b=mk(220,80);const c2=mk(220,-80);g.useAbility();ok(g.RX.fb.length===3,'залп: 3 шара');frames(30);ok([a,b,c2].filter(z=>z.hp<400).length>=2&&[a,b,c2].some(z=>z.burn>0),'шары попадают и поджигают');
// лучник: град стрел
setup('archer');a=mk(200,0);b=mk(220,60);const c3=mk(240,-60);g.useAbility();ok(g.RX.volley>0,'град стрел включён');g.secAttack({k:'z',o:a,ok:true});ok(b.hp<400&&c3.hp<400,'3 стрелы за выстрел');
// умения по классам
g.S.cls='mage';const roll=new Set();for(let i=0;i<200;i++)for(const k of g.rollPerks())roll.add(k);ok(roll.has('mshield')||roll.has('flame'),'маг получает свои умения');ok(!roll.has('smash')&&!roll.has('eagle'),'чужие умения не выпадают');
ok(g.perkName('str')==='Сила чар','имя умения по классу');
g.S.perks.mshield=4;g.S.p.hp=100;g.P.inv=0;const hp0=g.S.p.hp;g.damagePlayer(10);ok(Math.abs((hp0-g.S.p.hp)-10*0.76*(1-Math.min(0.6,g.gear('armor')/100)))<0.6,'мана-щит снижает урон');
// сохранение класса
const st=g.migrate({v:12,cls:'warrior',seed:4242,meta:{ng:0,relics:{},wins:0,relicPend:0}});ok(st.cls==='warrior','класс переносится в сохранении');
const st2=g.migrate({v:11,seed:4242,meta:{ng:0,relics:{},wins:0,relicPend:0}});ok(st2.cls===null,'старое сохранение — выбор класса');
console.log(bad?'FAILED '+bad:'classes ok');
