require('./harness.js');boot();frames(2);const g=G_;
let c0=g.S.clock;frames(300);console.log('clock +',(g.S.clock-c0).toFixed(2),'for 300 frames');
for(let i=0;i<40;i++){g.P.x=1500+Math.random()*1400;g.P.y=1500+Math.random()*1400;g.S.p.hp=99;frames(60)}
c0=g.S.clock;frames(300);console.log('clock + later',(g.S.clock-c0).toFixed(2),'kills',g.S.stats.kills,'ach',Object.keys(g.S.meta.ach),'codex',JSON.stringify(g.S.meta.codex));
