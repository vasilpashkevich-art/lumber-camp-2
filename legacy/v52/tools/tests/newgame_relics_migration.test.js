require('./harness.js');boot();frames(2);
const g=G_;
// clear everything
for(let z=1;z<=7;z++){g.S.killed[z]=999;g.S.bosses[z]=true}
for(const m of g.mounds()){m.dead=true;g.S.mounds[m.id]=true}
for(const z of g.zombies().filter(z=>z.boss).slice())g.zombies().splice(g.zombies().indexOf(z),1);
const pp=g.lairs().find(l=>l.zone===7);g.P.x=pp.x;g.P.y=pp.y+30;frames(2);
const st=g.specialTarget();console.log('portal target',st&&st.lbl);
g.summonFinal();const f=g.zombies().find(z=>z.final);console.log('final hp',Math.round(f.hp),'skin',f.skin);
g.S.p.hp=99999;for(let i=0;i<200;i++){g.S.p.hp=99999;els.perks.hidden=true;frames(1)}
f.hp=f.max*0.4;for(let i=0;i<120;i++){g.S.p.hp=99999;els.perks.hidden=true;frames(1)}console.log('phase2',f.phase2);
g.killZombie(f);flushTimers();console.log('killed',g.S.final.killed,'wins',g.S.meta.wins,'win modal shown',!els.win.hidden);
// resettle: emulate ngBtn
const seed0=g.S.seed;g.S.meta.ng++;g.S.meta.relicPend+=2;els.win.hidden=true;g.newGame(true);
console.log('ng',g.S.meta.ng,'new seed differs',g.S.seed!==seed0,'day',g.S.day,'relicPend',g.S.meta.relicPend);
const z1=g.zombies().find(z=>!z.boss&&z.tier===1);console.log('tier1 hp with ng',z1&&z1.hp);
g.S.meta.relics.fort=1;g.S.meta.relics.hoard=2;g.S.meta.relics.flask=1;g.newGame(true);
console.log('relic start: base',g.S.base,'fence',g.S.fence.lvl,'wood',g.S.wood,'potions',g.S.potions);
// save/migrate v8 -> v9
const old={v:8,wood:100,day:5,p:{x:2200,y:2240,hp:10},seed:4242};store['lumber-camp2-save']=JSON.stringify(old);boot();frames(2);
console.log('migrated v',G_.S.v,'inv',G_.S.inv.length,'meta',JSON.stringify(G_.S.meta),'seed',G_.S.seed);
