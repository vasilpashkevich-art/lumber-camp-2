require('./harness.js');boot();frames(2);const g=G_,S=()=>g.S;
S().bow=6;S().weapon='bow';g.zombies().length=0;g.P.x=2200;g.P.y=1600;
const mk=(dx,dy,hp=500)=>{const z={tier:3,x:2200+dx,y:1600+dy,hp,max:hp,r:14,dmg:1,speed:0,hx:2200+dx,hy:1600+dy,atk:0,hit:0,zone:3,ph:0,spitT:9,fenceMul:1};g.zombies().push(z);return z};
const a=mk(100,0),b=mk(0,120);
g.doAction({k:'z',o:a,ok:true});console.log('no twin: a',500-a.hp|0,'b',500-b.hp|0);
S().meta.relics.twin=1;a.hp=b.hp=500;g.doAction({k:'z',o:a,ok:true});console.log('twin: a',500-a.hp|0,'b',500-b.hp|0);
g.zombies().length=0;
// dashes
const dashOnce=()=>{g.keys.add('ShiftLeft');frames(1);g.keys.delete('ShiftLeft');const x0=g.P.x;frames(8);return Math.round(g.P.x-x0)};
const test=()=>{g.P.x=2200;g.P.y=1600;g.P.face=0;g.P.dch=null;frames(2);const r=[];for(let i=0;i<3;i++){const x0=g.P.x;g.keys.add('ShiftLeft');frames(1);g.keys.delete('ShiftLeft');frames(10);r.push(Math.round(Math.hypot(g.P.x-x0,g.P.y-1600)))}return r};
S().meta.relics.boots=0;console.log('dash distances, no boots',test());
S().meta.relics.boots=1;console.log('dash distances, boots',test());
