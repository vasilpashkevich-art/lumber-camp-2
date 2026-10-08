require('./harness.js');boot();frames(2);const g=G_,S=()=>g.S;
S().up.axe=10;S().bow=6;
const R=S().meta.relics;Object.assign(R,{hammer:1,frost:1,totem:1,mirror:1,storm:1,twin:1,boots:1,phoenix:1,wolf:1,sack:1});
console.log('owned',g.ownedRelics().length);
g.zombies().length=0;g.P.x=2200;g.P.y=1600;g.P.face=0;
const mk=(dx,dy,hp=200)=>{const z={tier:3,x:2200+dx,y:1600+dy,hp,max:hp,r:14,dmg:1,speed:60,hx:2200+dx,hy:1600+dy,atk:0,hit:0,zone:3,ph:0,spitT:9,fenceMul:1};g.zombies().push(z);return z};
// hammer
const a=mk(150,0),b=mk(300,5);g.useRelic('hammer');frames(40);console.log('hammer hits: a',200-a.hp|0,'b',200-b.hp|0,'cd',g.RX.cd.hammer.toFixed(1),'hammers left',g.RX.hammers.length);
// frost
const c=mk(100,100);g.useRelic('frost');console.log('frost frozen',c.frozen,'a',a.frozen);const cx=c.x;frames(20);console.log('frozen moved?',Math.abs(c.x-cx)>0.01);
// totem
g.useRelic('totem');const h0=c.hp;frames(60);console.log('totems',g.RX.totems.length,'totem dmg on nearby',(h0-c.hp)>0);
// storm
g.RX.stormT=0;const hs=[a,b,c].map(z=>z.hp);frames(3);console.log('storm hit count',[a,b,c].filter((z,i)=>z.hp<hs[i]).length,'bolts',g.RX.bolts.length);
// wolf
frames(60);console.log('wolf',!!g.RX.wolf);
// mirror
g.RX.cd={};g.useRelic('mirror');console.log('mirror to camp',Math.round(g.P.x),Math.round(g.P.y));g.useRelic('mirror');
// boots: speed and two dashes
console.log('speed',g.speedOf(1));
// phoenix
S().p.hp=0;const saved=g.phoenixSave();console.log('phoenix saved',saved,'hp',S().p.hp,'again',g.phoenixSave());
// sack
g.P.x=2200;g.P.y=1500;S().bag=999;S().bagStone=0;g.RX.sackT=0;const w0=S().wood;frames(3);console.log('sack sent',S().wood-w0>0,'bag',S().bag);
// offer prefers new relics
S().meta.relics={gather:1};S().meta.relicPend=1;g.showRelics();console.log('offer',g.relicOffer);
// hero tab rows render
const hr=g.rowsFor('hero');console.log('hero rows raw',hr.filter(r=>r.raw).length);
// migrate keeps new relics
const st=JSON.parse(JSON.stringify(S()));st.meta.relics={hammer:2,wolf:1,bogus:3};g.S=g.S;
