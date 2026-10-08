require('./harness.js');boot();frames(2);
const g=G_;let errs=0;
// long sim: 6 days with player wandering
for(let i=0;i<6*195*30/5;i++){try{g.S.p.hp=Math.max(g.S.p.hp,5);els.perks.hidden=true;g.S.perkPend=0;if(i%300===0){g.P.x=1500+Math.random()*1400;g.P.y=1500+Math.random()*1400}frames(5);flushTimers()}catch(e){errs++;if(errs<3)console.log('ERR',e.stack.split('\n').slice(0,3).join(' | '))}}
console.log('days',g.S.day,'errors',errs,'zombies',g.zombies().length,'merchant',g.S.merchant,'v',g.S.v);
// render sweep
try{for(let i=0;i<5;i++)g.render(performance.now())}catch(e){console.log('RENDER ERR',e.message)}
for(const t of ['hero','items','gear','camp','def','vil','farm','shop','save'])g.rowsFor(t);
console.log('ok');
