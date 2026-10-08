const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
 const st=async p=>p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('lumber-camp2-save'));return {dawn:!document.getElementById('dawn').hidden,title:document.getElementById('dawnTitle').textContent,wood:s.wood,comp:s.meta.comp31,rows:[...document.querySelectorAll('#dawnList li')].map(l=>l.textContent).join(' | ')}});
 {const c=await b.newContext();const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.addInitScript(()=>{if(!localStorage.getItem('xseed')){localStorage.setItem('xseed',1);localStorage.setItem('lumber-camp2-save',JSON.stringify({v:11,seed:4242,clock:20,lastSeen:Date.now()-20000,wood:100,jobs:{wood:3,stone:1,guard:0},houses:4,base:4,meta:{ng:0,relics:{},wins:0,relicPend:0}}))}localStorage.setItem('lumber-camp2-q','1');try{const s=JSON.parse(localStorage.getItem('lumber-camp2-save'));window.__init=[s.wood,s.meta.comp31,localStorage.getItem('xseed')]}catch(e){window.__init=String(e)}});
  await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(800);console.log('your save, 1st load:',JSON.stringify(await st(p)));
  await p.evaluate(()=>window.__old=1);await p.waitForTimeout(1000);await p.reload({waitUntil:'load'});await p.waitForTimeout(2000);console.log('reload:',JSON.stringify(await st(p)),'init saw',JSON.stringify(await p.evaluate(()=>window.__init)));await c.close()}
 {const c=await b.newContext();const p=await c.newPage();await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(5500);console.log('fresh game:',JSON.stringify(await st(p)));await c.close()}
 await b.close()})();
