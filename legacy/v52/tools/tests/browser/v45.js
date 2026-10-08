// v45: Молот Громовержца облетает гонящихся мертвецов
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(()=>{localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:'warrior',seed:4242,clock:20,lastSeen:Date.now(),up:{axe:9,pick:1,bag:1,boots:2,hp:30},meta:{ng:0,relics:{hammer:2},wins:1,relicPend:0,comp31:1,relicFix32:1}}));localStorage.setItem('lumber-camp2-q','1')});
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
 await p.evaluate(()=>{const G=__G;G.S.p.hp=1e6;G.zombies().length=0;G.P.x+=700;G.P.face=0;for(const [dx,dy] of [[-160,0],[0,150],[0,-150],[130,120]]){const z=G.makeZombie(3,G.P.x+dx,G.P.y+dy,false,null);z.hp=z.max=1e4;z.speed=0;z.dmg=0;z.chasing=true;z.canChase=true;z.hx=z.x;z.hy=z.y;G.zombies().push(z)}G.useRelic('hammer')});
 for(const t of [200,500,800]){await p.waitForTimeout(t===200?200:300);await p.screenshot({path:path.join(OUT,`hammer_${t}.png`),clip:{x:390,y:200,width:500,height:400}})}
 await b.close()})();
