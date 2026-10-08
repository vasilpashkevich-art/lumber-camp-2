const {chromium}=require('playwright'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1240,height:840}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});
for(const s of (process.argv[2]||'1,2,3,4').split(',')){await p.goto('file://'+path.join(__dirname,'look50.html')+'?s='+s);await p.waitForFunction(()=>document.title==='done',null,{timeout:20000}).catch(()=>console.log('timeout',s));await p.screenshot({path:path.join(__dirname,`look50_${s}.png`)})}
await b.close()})();
