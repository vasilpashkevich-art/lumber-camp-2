// Мир: загрузка старого сохранения, время создания мира, снимки земли и карт
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 for(const [ng,seed] of [[0,4242],[1,777],[2,31337]]){
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(([ng,seed])=>{if(!localStorage.getItem('xs')){localStorage.setItem('xs',1);localStorage.setItem('lumber-camp2-save',JSON.stringify({v:11,seed,clock:20,lastSeen:Date.now()-5000,day:4,p:{x:2600,y:1900,hp:30},farms:{'1-0':{lvl:2,store:0,hp:300,road:true,broken:false,pal:1,tower:1,mode:'wood',storeS:0}},meta:{ng,relics:{},wins:ng,relicPend:0,comp31:1,relicFix32:1}}))}localStorage.setItem('lumber-camp2-q','1')},[ng,seed]);
 const t0=Date.now();await p.goto('file://'+path.resolve(__dirname,'../../../index.html'));await p.waitForTimeout(1500);
 console.log('world',ng+1,'load+1.5s ms',Date.now()-t0);
 await p.screenshot({path:path.join(OUT,`w${ng+1}_camp.png`)});
 await p.keyboard.press('KeyK');await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,`w${ng+1}_map.png`)});
 await c.close()}
 await b.close()})();
