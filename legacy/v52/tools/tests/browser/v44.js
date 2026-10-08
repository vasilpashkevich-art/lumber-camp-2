// v44: арены радиусом 250 в мирах 1 и 3, скорость при ударах по боссу
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 for(const [ng,seed] of [[0,4242],[2,31337]]){
  const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.addInitScript(([ng,seed])=>{localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:'mage',seed,clock:20,lastSeen:Date.now(),day:9,up:{axe:20,pick:1,bag:1,boots:2,hp:30},meta:{ng,relics:{},wins:ng,relicPend:0,comp31:1,relicFix32:1}}));localStorage.setItem('lumber-camp2-q','1')},[ng,seed]);
  await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
  const L=await p.evaluate(()=>__G.lairs().map(l=>l.zone));
  for(const zid of L){await p.evaluate(zid=>{const G=__G;G.S.p.hp=1e9;const l=G.lairs().find(l=>l.zone===zid);G.P.x=l.x;G.P.y=l.y+200;const z=G.zombies().find(z=>z.boss===zid);window.BZ=z},zid);await p.waitForTimeout(500);
    await p.evaluate(()=>{document.getElementById('perks').hidden=true});
    await p.screenshot({path:path.join(OUT,`arena_w${ng+1}_z${zid}.png`),clip:{x:240,y:0,width:800,height:800}})}
  // скорость при ударах по боссу
  const fps=await p.evaluate(()=>new Promise(r=>{const G=__G,z=G.zombies().find(z=>z.boss);if(!z)return r(-1);G.P.x=z.x-100;G.P.y=z.y;const iv=setInterval(()=>{z.hit=0.12;z.hp=z.max},50);let k=0;const t0=performance.now();const f=()=>{k++;if(performance.now()-t0<2500)requestAnimationFrame(f);else{clearInterval(iv);r(k/2.5)}};requestAnimationFrame(f)}));
  console.log('world',ng+1,'fps while hitting boss',fps.toFixed(0));await c.close()}
 await b.close()})();
