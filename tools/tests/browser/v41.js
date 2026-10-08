// v41: лагерь со всей обороной ночью, герой каждого класса со спутником, портреты выбора класса
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('xs')){localStorage.setItem('xs',1);localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,seed:4242,clock:20,lastSeen:Date.now()-5000,bow:7,weapon:'axe',base:6,fence:{lvl:10,hp:2000},towers:[3,3,2,2,1,1],houses:6,jobs:{wood:4,stone:2,guard:6},def:{moat:3,traps:3,tu:Array(20).fill(12),ball:[4,2],bowl:[3,2,1,1],guard:4,shop:2},up:{axe:9,pick:1,bag:1,boots:2,hp:5},meta:{ng:1,relics:{wolf:1},wins:1,relicPend:0,comp31:1,relicFix32:1}}))}localStorage.setItem('lumber-camp2-q','1')});
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
 await p.screenshot({path:path.join(OUT,'v41_pick.png')});
 // лагерь ночью
 await p.evaluate(()=>{const G=__G;G.S.cls='warrior';document.getElementById('clsPick').hidden=true;G.S.clock=152;const cx=G.P.x,cy=G.P.y-40;window.CXY=[cx,cy];G.P.y=cy+60;
   for(let i=0;i<26;i++){const a=-0.5+i*0.04,r=340+(i%5)*22,z=G.makeZombie(3,cx+Math.cos(a)*r,cy+Math.sin(a)*r,true,null);z.hp=z.max=300;G.zombies().push(z)}});
 const cam=await p.evaluate(()=>{const G=__G;return {x:G.P.x,y:G.P.y}});console.log('camp at',cam);
 await p.waitForTimeout(1800);await p.evaluate(()=>{for(const id of ['perks'])document.getElementById(id).hidden=true});await p.screenshot({path:path.join(OUT,'v41_camp.png')});
 console.log('traps used',await p.evaluate(()=>__G.S.def.tu.filter(u=>u<12).length));
 // герой каждого класса со спутником в поле
 for(const k of ['warrior','mage','archer']){
   await p.evaluate(k=>{const G=__G;G.S.cls=k;G.S.clock=20;G.zombies().length=0;G.P.x=CXY[0]+700;G.P.y=CXY[1];G.P.face=0;G.RX.wolf=null;G.S.p.hp=9999;
     for(let i=0;i<3;i++){const z=G.makeZombie(2,G.P.x+90+i*30,G.P.y-30+i*30,false,null);z.hp=z.max=999;z.speed=0;z.dmg=0;G.zombies().push(z)}},k);
   await p.evaluate(()=>{document.getElementById('perks').hidden=true});await p.keyboard.down('KeyD');await p.waitForTimeout(250);await p.keyboard.up('KeyD');await p.waitForTimeout(1600);
   await p.screenshot({path:path.join(OUT,`v41_hero_${k||'none'}.png`),clip:{x:440,y:250,width:420,height:300}});}
 // лицом влево
 await p.keyboard.down('KeyA');await p.waitForTimeout(300);await p.keyboard.up('KeyA');await p.waitForTimeout(200);await p.screenshot({path:path.join(OUT,'v41_hero_left.png'),clip:{x:440,y:250,width:420,height:300}});
 await b.close()})();
