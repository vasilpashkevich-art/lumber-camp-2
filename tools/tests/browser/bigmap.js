const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
 for(const [vw,vh,nm] of [[1280,850,'d'],[420,820,'m']]){
 const c=await b.newContext({viewport:{width:vw,height:vh}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(()=>{localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:'archer',seed:4242,clock:20,lastSeen:0,day:9,base:4,fence:{lvl:3,hp:500},bosses:{1:true},mounds:{'1-0':true},farms:{'1-0':{lvl:2,store:0,hp:300,road:true,broken:false,pal:1,tower:1,mode:'wood',storeS:0}},keys:2,p:{x:2600,y:1900,hp:50}}));localStorage.setItem('lumber-camp2-q','1')});
 await p.goto('file://'+require('path').resolve(__dirname,'../../../index.html'));await p.waitForTimeout(800);
 await p.click('#mini');await p.waitForTimeout(400);await p.screenshot({path:require('path').resolve(process.env.SHOTS||'/tmp',`bm_${nm}1.png`)});
 if(nm==='d'){await p.mouse.move(700,420);for(let i=0;i<4;i++){await p.mouse.wheel(0,-200);await p.waitForTimeout(60)}
   await p.mouse.move(640,450);await p.mouse.down();await p.mouse.move(560,400,{steps:5});await p.mouse.up();await p.waitForTimeout(300);await p.screenshot({path:require('path').resolve(process.env.SHOTS||'/tmp','bm_d2.png')});
   const t0=await p.evaluate(()=>document.getElementById('clock')?.textContent);await p.waitForTimeout(1500);const t1=await p.evaluate(()=>document.getElementById('clock')?.textContent);console.log('paused?',t0===t1,t0);
   await p.keyboard.press('Escape');await p.waitForTimeout(200);console.log('closed',await p.evaluate(()=>document.getElementById('bigmap').hidden));
   await p.keyboard.press('KeyK');await p.waitForTimeout(200);console.log('K opens',!(await p.evaluate(()=>document.getElementById('bigmap').hidden)));}
 await c.close()}
 await b.close()})();
