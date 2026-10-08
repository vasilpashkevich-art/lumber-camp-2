require('./harness.js');boot();frames(2);
const g=G_;
g.S.keys=1;g.S.up.axe=20;const c=g.crypts()[0];g.P.x=c.x;g.P.y=c.y;g.enterCrypt(c);g.openCryptGate();frames(1);
const walkTo=(tx,ty,maxF=600)=>{for(let i=0;i<maxF;i++){g.S.p.hp=9999;g.S.perkPend=0;els.perks.hidden=true;
  for(const z of g.zombies().filter(z=>z.dun!=null).slice())g.killZombie(z);
  const dx=tx-g.P.x,dy=ty-g.P.y;key('KeyD',dx>8);key('KeyA',dx<-8);key('KeyS',dy>8);key('KeyW',dy<-8);
  if(!g.DG)break;
  frames(1);if(Math.abs(dx)<10&&Math.abs(dy)<10)break}
  for(const k of ['KeyD','KeyA','KeyS','KeyW'])key(k,false)};
const D=g.DG;
for(let i=0;i<D.rooms.length;i++){const r=D.rooms[i];walkTo(r.x+r.w/2,r.y+r.h/2);console.log('room',i,'reached?',Math.round(g.P.x)>=r.x,'P',Math.round(g.P.x),'cleared',r.cleared)}
console.log('chest',!!D.chest);
for(const d of g.drops())d.t=0;
walkTo(D.chest.x,D.chest.y+30);
const st=g.specialTarget();console.log('at chest target',st&&st.lbl);key('KeyE',true);frames(2);key('KeyE',false);
console.log('opened',D.chest.open,'exit',!!D.exit);
walkTo(D.exit.x,D.exit.y);const st2=g.specialTarget();console.log('exit target',st2&&st2.lbl);key('KeyE',true);frames(2);key('KeyE',false);
console.log('left dungeon',!g.DG);
store['lumber-camp2-save']=JSON.stringify({v:9,seed:4242,keys:0,crypts:{c2:4},p:{x:2200,y:2240,hp:10}});boot();frames(2);
console.log('refund keys',G_.S.keys,'crypts',JSON.stringify(G_.S.crypts),'v',G_.S.v);
