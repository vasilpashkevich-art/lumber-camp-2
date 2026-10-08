require('./harness.js');boot();frames(2);
const g=G_;
const bossOff=()=>g.zombies().filter(z=>z.boss).map(z=>{const l=g.lairs().find(l=>l.zone===z.boss);return Math.round(Math.hypot(z.x-l.x,z.y-l.y))});
const l1=g.lairs().find(l=>l.zone===1);console.log('lair1 dist from camp',Math.round(Math.hypot(l1.x-2200,l1.y-2200)));
// stand in camp 60s
g.P.x=2200;g.P.y=2240;for(let i=0;i<1800;i++){g.S.p.hp=Math.max(g.S.p.hp,1);els.perks.hidden=true;g.S.clock=10;frames(1)}
console.log('after 60s in camp: boss offsets',bossOff().join(','),'hp',Math.round(g.S.p.hp),'zombies within 300 of camp',g.zombies().filter(z=>!z.wave&&Math.hypot(z.x-2200,z.y-2200)<300).length);
// engage dragon then leave
const dr=g.zombies().find(z=>z.skin==='dragon'),L=g.lairs().find(l=>l.zone===5);
g.P.x=L.x+60;g.P.y=L.y;g.S.p.hp=9999;for(let i=0;i<300;i++){g.S.p.hp=9999;els.perks.hidden=true;frames(1)}
dr.hp=dr.max*0.5;let maxOff=Math.max(...bossOff());console.log('dragon engaged, max boss offset',maxOff,'fly',dr.fly);
g.P.x=L.x+600;g.P.y=L.y;for(let i=0;i<300;i++){g.S.p.hp=9999;els.perks.hidden=true;frames(1)}
console.log('player left: dragon offset',Math.round(Math.hypot(dr.x-L.x,dr.y-L.y)),'dragon hp%',Math.round(100*dr.hp/dr.max));
// zone zombie leash
const z=g.zombies().find(z=>!z.boss&&!z.wave&&z.zone===2);g.P.x=z.x+60;g.P.y=z.y;for(let i=0;i<20;i++){g.S.p.hp=9999;frames(1)}
z.hp=z.max*0.3;const hx=z.hx,hy=z.hy;
// run away far
for(let i=0;i<300;i++){g.S.p.hp=9999;els.perks.hidden=true;g.P.x+=8;frames(1)}
console.log('zombie chased max?',Math.round(Math.hypot(z.x-hx,z.y-hy)),'ret',z.ret);
for(let i=0;i<400;i++){g.S.p.hp=9999;els.perks.hidden=true;frames(1)}
console.log('zombie back home dist',Math.round(Math.hypot(z.x-hx,z.y-hy)),'hp%',Math.round(100*z.hp/z.max));
