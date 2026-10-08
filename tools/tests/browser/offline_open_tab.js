const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1200,height:800}});const p=await c.newPage();
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.clock.install();
 await p.addInitScript(()=>{if(!localStorage.getItem('lumber-camp2-save'))localStorage.setItem('lumber-camp2-save',JSON.stringify({v:11,seed:4242,clock:20,lastSeen:0,jobs:{wood:3,stone:1,guard:0},houses:4,base:4}));localStorage.setItem('lumber-camp2-q','1')});
 await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.clock.runFor(2000);
 const st=async()=>p.evaluate(()=>({dawn:!document.getElementById('dawn').hidden,title:document.getElementById('dawnTitle').textContent,rows:[...document.querySelectorAll('#dawnList li')].map(l=>l.textContent).join(' | ')}));
 console.log('after load:',JSON.stringify(await st()));
 // tab stays open, 9 hours pass (timers frozen like a sleeping laptop)
 await p.clock.pauseAt(Date.now()+9*3600e3+5000).catch(e=>console.log('pauseAt',e.message));
 await p.clock.resume();await p.clock.runFor(1500).catch(()=>{});await p.waitForTimeout(500);
 console.log('after 9h:',JSON.stringify(await st()));
 await b.close()})();
