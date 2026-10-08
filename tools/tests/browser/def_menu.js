// Вкладка «Оборона»: старое сохранение без обороны и почти полностью отстроенный лагерь
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 for(const [nm,extra] of [['old',{base:4,fence:{lvl:4,hp:300}}],['full',{base:6,fence:{lvl:10,hp:2000},def:{moat:3,traps:2,tu:[0,0,3].concat(Array(17).fill(12)),ball:[4,2],bowl:[3,2,1,0],guard:3,shop:2}}]]){
 const c=await b.newContext({viewport:{width:1280,height:900}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(x=>{if(!localStorage.getItem('xs')){localStorage.setItem('xs',1);localStorage.setItem('lumber-camp2-save',JSON.stringify(Object.assign({v:12,worldV:12,cls:'warrior',seed:4242,clock:20,lastSeen:Date.now()-5000,wood:5000,stone:2000,meta:{ng:0,relics:{},wins:0,relicPend:0,comp31:1,relicFix32:1}},x)))}localStorage.setItem('lumber-camp2-q','1')},extra);
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html'));await p.waitForTimeout(1000);
 await p.keyboard.press('KeyB');await p.waitForTimeout(300);await p.click('[data-tab="def"]');await p.waitForTimeout(300);
 const h=await p.evaluate(()=>document.getElementById('menu').innerText.slice(0,3000));console.log('---',nm,'\n'+h);
 await p.screenshot({path:path.join(OUT,`def_menu_${nm}.png`),fullPage:true});await c.close()}
 await b.close()})();
