// Спутники по классам: волк — кровотечение до 3 ран, элементаль — огненные шары и поджог, змея — яд и замедление
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S;S.meta.relics.wolf=1;S.up.axe=8;
const setup=cl=>{S.cls=cl;g.zombies().length=0;g.RX.wolf=null;g.RX.pfb.length=0;g.P.x=g.CX;g.P.y=g.CX-420;g.S.p.hp=9999};
const mk=(dx,dy,hp=2000)=>{const z=g.makeZombie(3,g.P.x+dx,g.P.y+dy,false,3);z.hp=z.max=hp;z.speed=0;z.r=14;z.dmg=0;g.zombies().push(z);return z};
setup('warrior');let z=mk(60,0);frames(90);ok(g.RX.wolf.kind==='wolf','воин: волк');ok(z.bleedT>0&&z.bleedN>=2&&z.bleedN<=3,'раны кровоточат, ран: '+z.bleedN);
const h=z.hp;g.RX.wolf.cd=99;frames(20);ok(z.hp<h,'кровотечение отнимает здоровье без укусов');
setup('mage');z=mk(200,0);frames(90);ok(g.RX.wolf.kind==='elem','маг: элементаль');ok(z.hp<2000&&z.burn>0,'огненные шары попадают и поджигают');
setup('archer');z=mk(80,0);frames(60);ok(g.RX.wolf.kind==='snake','лучник: змея');ok(z.poisT>0&&z.slowT>0,'яд и замедление');
ok(g.pets.archer.name==='Дух змеи'&&g.pets.mage.name==='Огненный элементаль','названия по классу');
// щит босса не пробивается ядом
setup('archer');z=mk(80,0);z.shield=true;z.poisT=3;z.poisDps=50;const hs=z.hp;g.RX.wolf={kind:'snake',x:0,y:0,cd:99,face:0};frames(10);ok(z.hp===hs,'яд не действует сквозь щит');
console.log(bad?'FAILED '+bad:'pets ok');
