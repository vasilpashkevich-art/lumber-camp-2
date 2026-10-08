require('./harness.js');boot();frames(2);
const g=G_;
g.S.p.hp=9999;
// merchant: day 3 dawn
g.S.day=2;g.S.clock=150+40;g.S.night.active=true;frames(200);flushTimers();
console.log('day',g.S.day,'merchant',g.S.merchant);
g.P.x=2200;g.P.y=2240;g.S.wood=5000;g.S.stone=5000;g.S.iron=50;frames(3);
const k0=g.S.keys;g.doAct('buy:key');g.doAct('buy:item');g.doAct('buy:item');console.log('bought key',g.S.keys-k0,'items',g.S.inv.length,'once flag',g.S.merchBought);
console.log('shop rows',g.rowsFor('shop').length);
// caravan
g.spawnCaravan();console.log('refugees',g.refugees().length,'hunters',g.zombies().filter(z=>z.hunt).length);
for(const z of g.zombies().filter(z=>z.hunt).slice())g.killZombie(z);
const ex0=g.S.extraRes||0;for(let i=0;i<900;i++){g.S.p.hp=9999;els.perks.hidden=true;g.S.clock=10;frames(1)}
console.log('refugees left',g.refugees().length,'extraRes +',(g.S.extraRes||0)-ex0);
// mimic chance
let mim=0;for(let i=0;i<300;i++){g.drops().push({x:g.P.x,y:g.P.y,kind:'chest',tier:2,t:30});els.perks.hidden=true;frames(1);mim=g.zombies().filter(z=>z.mimic).length}
console.log('mimics spawned from 300 chests',mim);
// fog/side nights
let fog=0,side=0;for(let i=0;i<60;i++){g.S.day=8+i*1;if(g.S.day%7===0)continue;g.startNight();if(g.S.night.fog)fog++;}
console.log('fog nights of ~50',fog);
