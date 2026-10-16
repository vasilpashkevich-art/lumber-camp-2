const { chromium } = require('playwright'); const path=require('path');
const URL = 'file://' + path.resolve('/home/claude/lumber-camp-2/index.html') + '#dev';
(async()=>{const b=await chromium.launch();for (const [k,soft] of [['A',0]]) {const p=await b.newPage({viewport:{width:1100,height:640}});const ev=(f,a)=>p.evaluate(f,a);
await p.goto(URL);await p.waitForTimeout(400);await ev(([k,soft])=>{window.__softRock=!!soft;window.__rockKind=k;},[k,soft]);
await p.click('#selNew',{noWaitAfter:true});await p.waitForSelector('#newName');await p.waitForTimeout(300);await p.click('.clsCard[data-c=warrior]');await p.waitForTimeout(300);
await ev(()=>{document.querySelector('#newName').value='Камнелом';document.querySelector('[data-x=ok]').click();});await p.waitForSelector('.modal',{state:'detached'});await p.waitForTimeout(200);
await p.click('.slot:nth-child(1)');await p.click('#selEnter');await p.waitForTimeout(900);
const rocks = await ev(()=>{const G=window.__G.G;G.mobs.forEach(m=>{m.state='dead';m.respawnAt=1e9});return G.W.rocks.map(o=>[o.x,o.y,o.w,o.s])});
const pick=[];for(let t=0;t<4;t++){const L=rocks.filter(o=>o[3]%4===t);pick.push(...L.slice(0,2));}
  for (let i=0;i<pick.length;i++){ const o=pick[i];     await ev(([x,y,w])=>{const G=window.__G.G;G.P.x=x+w*0.75;G.P.y=y+30;},o); await p.waitForTimeout(1300); await p.screenshot({path:`/tmp/claude-0/-home-claude/9c670fbc-a41c-5700-9d0d-74ad3ece3a5b/scratchpad/rock-${k}${i}.png`,clip:{x:250,y:120,width:600,height:420}}); }
await p.close();}
await b.close();})();
