// Классы: экран выбора на старом сохранении, герой каждого класса, способность
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('xs')){localStorage.setItem('xs',1);localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,seed:4242,clock:20,lastSeen:Date.now()-5000,bow:7,weapon:'bow',up:{axe:9,pick:1,bag:1,boots:2,hp:5},meta:{ng:1,relics:{hammer:1,wolf:1},wins:1,relicPend:0,comp31:1,relicFix32:1}}))}localStorage.setItem('lumber-camp2-q','1')});
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
 console.log('picker shown',await p.evaluate(()=>!document.getElementById('clsPick').hidden));
 await p.screenshot({path:path.join(OUT,'cl_pick.png')});
 for(const k of ['warrior','mage','archer']){
   await p.evaluate(k=>{const G=__G;G.S.cls=k;document.getElementById('clsPick').hidden=true;G.P.x=G.S.p.x;const zs=G.zombies();for(let i=0;i<4;i++){const a=i*1.6;const z=zs.find(q=>!q.boss&&!q.wave&&!q.used);if(!z)break;z.used=1;z.x=G.P.x+80+Math.cos(a)*40;z.y=G.P.y+Math.sin(a)*60;z.hx=z.x;z.hy=z.y}},k);
   await p.waitForTimeout(200);await p.keyboard.press('KeyC');await p.waitForTimeout(k==='mage'?250:400);
   await p.screenshot({path:path.join(OUT,`cl_${k}.png`),clip:{x:340,y:150,width:600,height:500}});}
 await b.close()})();
