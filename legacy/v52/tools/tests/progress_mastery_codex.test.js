require('./harness.js');boot();frames(2);const g=G_;
const S=()=>g.S;
// --- offline + rest
S().lastSeen=Date.now()-2*3600*1000;S().jobs&&(S().jobs.wood=Math.max(1,S().jobs.wood||0));const w0=S().wood;
g.applyOffline();console.log('offline: wood +',S().wood-w0,'rested',Math.round(S().rested),'(max 600)');
S().perks={str:5,vit:5,vamp:2,hand:5,pack:5,luck:2,mason:5,boss:5,thrift:2};
console.log('branch pts',['Лесоруб','Воин','Строитель'].map(b=>g.brPts(b)));
console.log('mast cleave',g.mast('cleave'),'exec',g.mast('exec'),'fellchain',g.mast('fellchain'),'whirl',g.mast('whirl'),'repair',g.mast('repair'),'fire',g.mast('fire'),'watch',g.mast('watch'));
S().perks={str:5,vit:5,vamp:2,hand:5,pack:5,luck:3,legs:1,mason:5,boss:5,thrift:2};
console.log('after: whirl',g.mast('whirl'),'fire',g.mast('fire'),'harvest combo',g.combo('harvest'),'wrath',g.combo('wrath'));
// --- cleave: two zombies near player
g.zombies().length=0;g.P.x=2200;g.P.y=1700;
const mk=(dx,dy)=>{const z={tier:3,x:2200+dx,y:1700+dy,hp:50,max:50,r:14,dmg:1,speed:0,hx:2200+dx,hy:1700+dy,atk:0,hit:0,zone:3};g.zombies().push(z);return z};
const a=mk(30,0),b=mk(55,10);
g.hitEnemy({k:'z',o:a},10,'melee',false);console.log('cleave: target',a.hp,'neighbor',b.hp,'(expect 40 / 45)');
// exec: a at 40 → hit 33 → 7 left <15% (7.5) → executes
const hp0=S().p.hp;g.hitEnemy({k:'z',o:a},33,'melee',false);console.log('exec killed',!g.zombies().includes(a),'kills codex',JSON.stringify(S().meta.codex),'hp heal',S().p.hp-hp0);
// fellchain
const T=g.trees().filter(t=>t.alive&&t.tier===1);let pair=null;for(const t of T){const o=T.find(o=>o!==t&&Math.hypot(o.x-t.x,o.y-t.y)<70);if(o){pair=[t,o];break}}
if(pair){S().bag=0;const o=pair[1];const h=o.hp;g.chop(pair[0],999);console.log('fellchain neighbor hp',h,'->',o.hp,'alive',o.alive)}else console.log('no tree pair');
// tower fire
const c=mk(0,80);g.towerHit(c,5,2200,1600);console.log('tower burn',c.burn,'dps',c.burnDps);
// particles
console.log('particles',g.parts().length);
// achievements one per sec
S().stats.kills=600;S().stats.chopped=150;for(let i=0;i<4;i++){frames(31)}console.log('ach after ~4s',Object.keys(S().meta.ach));
// rows
const lr=g.logRows();console.log('log rows',lr.length,'raw',lr.filter(r=>r.raw).length);g.rowsFor('hero');g.tab='log';g.toggleMenu&&g.toggleMenu(true);g.renderMenu();console.log('render menu ok');
// boss kill slow
const bz=g.makeBoss(1);g.zombies().push(bz);g.killZombie(bz);console.log('slowT',g.slowT,'codex b1',S().meta.codex.b1);
// migration of old save keeps v
console.log('v',S().v,'best',JSON.stringify(S().meta.best));
