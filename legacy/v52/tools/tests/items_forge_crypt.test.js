require('./harness.js');boot();frames(2);
const g=G_;const S=()=>g.S;
console.log('crypts',g.crypts().length,'iron rocks',g.rocks().filter(r=>r.iron).length,'bosses skins',g.zombies().filter(z=>z.boss).map(z=>z.skin).join(','));
const l4=g.lairs().find(l=>l.zone===4);console.log('lair4 in swamp?', !!l4);
// items
g.S.p.hp=9999;
for(let i=0;i<6;i++){const it=g.makeItem(4,i%4);g.S.inv.push(it)}
console.log('items',g.S.inv.map(i=>i.name+'/'+i.rar+'/'+i.mods.map(m=>m.join('=')).join(';')+(i.uq?'/'+i.uq:'')).join(' | '));
const w=g.S.inv.find(i=>i.slot==='weapon')||g.S.inv[0];g.doAct('equip:'+w.id);console.log('equipped',w.slot,'gear dmg',g.gear('dmg'),'hp',g.maxHp(1));
g.doAct('salvage:'+g.S.inv[0].id);console.log('shards',g.S.shards,'inv',g.S.inv.length);
// forge
g.S.base=3;g.S.wood=99999;g.S.stone=99999;g.S.iron=999;g.S.shards=999;g.P.x=2200;g.P.y=2240;frames(1);
g.doAct('forge');console.log('forge',g.S.forge);
const it=g.S.inv[0];const r0=it.rar;g.doAct('rarup:'+it.id);console.log('rarup',r0,'->',it.rar,it.name);
g.doAct('reroll:'+it.id);g.doAct('temper:melee');console.log('temper',JSON.stringify(g.S.forgeUp));
g.tab='items';g.rowsFor('items');g.rowsFor('camp');g.rowsFor('shop');
// crypt
g.S.keys=2;const c=g.crypts()[0];g.P.x=c.x;g.P.y=c.y+10;frames(1);
const st=g.specialTarget();console.log('crypt target',st&&st.lbl,st&&st.msg);
g.enterCrypt(c);g.openCryptGate();frames(2);console.log('in dungeon',!!g.DG,'rooms',g.DG.rooms.length,'P',Math.round(g.P.x),Math.round(g.P.y));
// fight through rooms with strong hero
g.S.up.axe=20;g.S.up.hp=12;
for(let step=0;step<600&&g.DG&&!g.DG.chest;step++){
  g.S.p.hp=9999;g.S.perkPend=0;els.perks.hidden=true;
  const alive=g.zombies().filter(z=>z.dun!=null);
  let tx,ty;
  if(alive.length){const z=alive[0];tx=z.x;ty=z.y;for(const zz of alive.slice())g.killZombie(zz);}
  else{const r=g.DG.rooms.find(r=>!r.spawned)||g.DG.rooms[g.DG.rooms.length-1];tx=r.x+r.w/2;ty=r.y+r.h/2}
  g.P.x+=(tx-g.P.x)*0.3;g.P.y+=(ty-g.P.y)*0.3;frames(5);
}
console.log('dbg',JSON.stringify(g.DG&&g.DG.rooms.map(r=>[r.spawned,r.cleared])),'dunZ',g.zombies().filter(z=>z.dun!=null).length,'P',Math.round(g.P.x),Math.round(g.P.y),'hp',g.S.p.hp,'over',g.S.over);
console.log('chest',!!(g.DG&&g.DG.chest),'rooms cleared',g.DG&&g.DG.rooms.map(r=>r.cleared?1:0).join(''));
const inv0=g.S.inv.length,ir0=g.S.iron;g.P.x=g.DG.chest.x;g.P.y=g.DG.chest.y+10;g.openDunChest();frames(3);
console.log('after chest iron +',g.S.iron-ir0,'item drops',g.drops().filter(d=>d.kind==='item').length,'exit',!!g.DG.exit);
g.P.x=g.DG.chest.x-30;g.P.y=g.DG.chest.y+40;frames(3);console.log('picked items',g.S.inv.length-inv0);
g.leaveCrypt('ok');console.log('left',!g.DG,'pos',Math.round(g.P.x),Math.round(g.P.y),'cd',JSON.stringify(g.S.crypts));
