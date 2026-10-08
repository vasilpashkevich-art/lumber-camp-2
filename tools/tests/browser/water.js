// Водоёмы: по одному снимку каждого вида (мир 3, все края) и большая карта
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('xs')){localStorage.setItem('xs',1);localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:'warrior',seed:31337,clock:20,lastSeen:Date.now()-5000,up:{axe:20,pick:1,bag:1,boots:2,hp:30},meta:{ng:2,relics:{},wins:2,relicPend:0,comp31:1,relicFix32:1}}))}localStorage.setItem('lumber-camp2-q','1')});
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
 const kinds=await p.evaluate(()=>{const o={};for(const q of __G.patches())if(q.wt&&!o[q.wt])o[q.wt]=1;return Object.keys(o)});console.log('types',kinds.join(','));
 for(const wt of kinds){await p.evaluate(wt=>{const q=__G.patches().find(q=>q.wt===wt);__G.P.x=q.x-q.r-30;__G.P.y=q.y+10;__G.S.hp=9999;for(const z of __G.zombies())z.x=-9999},wt);await p.waitForTimeout(350);
   await p.screenshot({path:path.join(OUT,`water_${wt}.png`),clip:{x:390,y:200,width:500,height:400}})}
 // скольжение: идём по льду вправо и отпускаем
 const sl=await p.evaluate(()=>new Promise(res=>{const q=__G.patches().find(q=>q.kind==='ice');__G.P.x=q.x-q.r*0.5;__G.P.y=q.y;res(1)}));
 await p.keyboard.down('KeyD');await p.waitForTimeout(900);const x0=await p.evaluate(()=>__G.P.x);await p.keyboard.up('KeyD');await p.waitForTimeout(700);const x1=await p.evaluate(()=>__G.P.x);
 console.log('ice slide after release px',Math.round(x1-x0));
 await p.keyboard.press('KeyK');await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,'water_map.png')});
 await b.close()})();
