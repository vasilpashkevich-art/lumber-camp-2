const {chromium}=require('playwright'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});await p.goto('file://'+path.join(__dirname,'hud.html'));await p.waitForTimeout(500);
for(let i=0;i<3;i++){const e=await p.$('#f'+i);await e.screenshot({path:path.join(__dirname,`hud_${'ABV'[i]}.png`)})}await b.close()})();
