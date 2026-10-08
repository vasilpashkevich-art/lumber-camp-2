// Облики мертвецов и боссов: все виды, ярусы, края и боссы рисуются без ошибок
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
let n=0,err=null;
try{for(const k of [undefined,'runner','ram','spitter'])for(let t=1;t<=7;t++)for(const b of [null,'snow','marsh','shroom','waste','high','mist']){const z=g.makeZombie(t,g.P.x+50,g.P.y,false,null,k);z.biome=b||undefined;z.hit=n%2?0.1:0;z.hp=z.max*0.5;g.drawZombie(z);n++}
  for(const sk of ['slime','treant','hydra','croc','dragon','golem','lich','yeti','lord','mimic','slimelet']){const z=g.makeZombie(5,g.P.x+50,g.P.y,false,null);z.skin=sk;if(sk==='mimic')z.mimic=true;else if(sk!=='slimelet'){z.guard=true;z.name='Босс'}z.fly=sk==='dragon';z.r=sk==='slimelet'?10:40;g.drawZombie(z);n++}}catch(e){err=e}
ok(!err,'все облики рисуются'+(err?': '+err.message:''));ok(n===4*7*7+11,'нарисовано '+n);
frames(30);ok(true,'игра идёт с новыми обликами');
console.log(bad?'FAILED '+bad:'mobs ok');
