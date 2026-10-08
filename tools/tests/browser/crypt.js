// Склеп: залы, последний зал по теме босса, фазы, панель
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 for(const bossId of [1,2,5]){
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript((bid)=>{if(!localStorage.getItem('xs')){localStorage.setItem('xs',1);localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,seed:4242,clock:20,lastSeen:Date.now()-5000,keys:3,lvl:12,cryptRuns:3,up:{axe:10,pick:1,bag:1,boots:3,hp:8},bosses:{[bid]:true},p:{x:3100,y:3140,hp:200},cls:'archer',meta:{ng:0,relics:{},wins:0,relicPend:0,comp31:1,relicFix32:1}}))}localStorage.setItem('lumber-camp2-q','1')},bossId);
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
 if(bossId===1){await p.evaluate(()=>{const G=__G,c=G.crypts()[0];G.P.x=c.x;G.P.y=c.y+60});await p.waitForTimeout(300);await p.screenshot({path:path.join(OUT,'cr_entrance.png')})}
 await p.evaluate(()=>{const G=__G,c=G.crypts()[0];G.P.x=c.x;G.P.y=c.y;G.enterCrypt(c)});await p.waitForTimeout(300);
 if(bossId===1){await p.evaluate(()=>{const G=__G,r=G.DG.rooms[1];for(const q of G.DG.rooms)if(q.i<1){q.spawned=true;q.cleared=true}G.P.x=r.x+r.w/2;G.P.y=r.y+r.h/2;G.S.p.hp=9999});await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,'cr_room.png')})}
 await p.evaluate(()=>{const G=__G,L=G.DG.rooms.at(-1);for(const q of G.DG.rooms)if(!q.last){q.spawned=true;q.cleared=true}for(const z of G.zombies().filter(z=>z.dun!=null&&!z.cboss))G.killZombie(z);G.P.x=L.x+L.w*0.3;G.P.y=L.y+L.h/2;G.S.p.hp=9999});
 await p.waitForTimeout(900);await p.screenshot({path:path.join(OUT,`cr_boss${bossId}_p1.png`)});
 await p.evaluate(()=>{const G=__G,B=G.DG.boss;for(const z of G.zombies().filter(z=>z.minion))G.killZombie(z);B.shield=false;B.hp=B.max*0.6;G.S.p.hp=9999});await p.waitForTimeout(1900);await p.screenshot({path:path.join(OUT,`cr_boss${bossId}_p2.png`)});
 await c.close()}
 await b.close()})();
