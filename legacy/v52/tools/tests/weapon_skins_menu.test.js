require('./harness.js');boot();frames(2);const G=G_;
for(const t of ['gear']){const R=G.rowsFor(t);console.log(R.filter(r=>r.title==='Топор'||r.title==='Лук').map(r=>r.title+': '+r.desc).join('\n'))}
G.S.wood=1e9;G.S.stone=1e9;G.S.iron=1e9;for(let i=0;i<19;i++)G.doAct('up:axe');for(let i=0;i<12;i++)G.doAct('bow');console.log('axe',G.S.up.axe,'bow',G.S.bow);
console.log(G.rowsFor('gear').filter(r=>r.title==='Топор'||r.title==='Лук').map(r=>r.lvl+' '+r.desc.slice(-60)).join('\n'));
