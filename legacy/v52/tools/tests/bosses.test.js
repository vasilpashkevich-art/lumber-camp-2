require('./harness.js');boot();frames(2);
const g=G_;
const names=[];for(let i=0;i<14;i++){const it=g.makeItem(1+i%7,i%3);names.push(it.name)}console.log('names:',names.join(', '));
// dragon phases & immunity
g.S.p.hp=9999;
const dr=g.zombies().find(z=>z.skin==='dragon');g.P.x=dr.x+100;g.P.y=dr.y;
let flySeen=false,groundSeen=false;
for(let i=0;i<700;i++){g.S.p.hp=9999;els.perks.hidden=true;frames(1);if(dr.fly)flySeen=true;else groundSeen=true}
console.log('dragon fly seen',flySeen,'ground seen',groundSeen,'hp',Math.round(dr.hp));
dr.fly=true;let h0=dr.hp;g.hitZombie(dr,10,g.P.x,g.P.y,'melee');console.log('fly+melee dmg',h0-dr.hp);
h0=dr.hp;g.hitZombie(dr,10,g.P.x,g.P.y,'ranged');console.log('fly+ranged dmg',h0-dr.hp);
dr.fly=false;h0=dr.hp;g.hitZombie(dr,10,g.P.x,g.P.y,'ranged');console.log('ground+ranged dmg',h0-dr.hp);
h0=dr.hp;g.hitZombie(dr,10,g.P.x,g.P.y,'melee');console.log('ground+melee dmg',h0-dr.hp);
// each boss abilities run without errors
for(const z of g.zombies().filter(z=>z.boss)){g.P.x=z.x+120;g.P.y=z.y;for(let i=0;i<120;i++){g.S.p.hp=9999;els.perks.hidden=true;frames(1)}}
console.log('all bosses ticked ok; spits',0);
// kill all bosses -> keys/items
const k0=g.S.keys;for(const z of g.zombies().filter(z=>z.boss).slice())g.killZombie(z);console.log('keys from bosses',g.S.keys-k0,'item drops',g.drops().filter(d=>d.kind==='item').length);
