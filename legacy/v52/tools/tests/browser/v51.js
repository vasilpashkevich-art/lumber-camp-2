// v51: музыка вне лагеря, шум поселения в лагере, звуки умений, вкладка «Звук и музыка» в ⚙
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});let errs=0;
 for(const cl of ['warrior','mage','archer']){
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>{errs++;console.log('ERR',cl,e.message)});
 await p.addInitScript(cl=>localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:cl,seed:4242,clock:20,day:3,base:5,hq:1e4,bow:4,meta:{ng:0,tutDone:1,relics:{hammer:1},wins:0,relicPend:0,comp31:1,relicFix32:1}})),cl);
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);await p.mouse.click(640,300);await p.keyboard.press('KeyW');await p.waitForTimeout(600);
 const st=()=>p.evaluate(()=>[__G.AUD.ready,__G.AUD.music.cur,__G.AUD.camp.lvl]);
 const hide=()=>p.evaluate(()=>{for(const id of ['dawn','perks'])document.getElementById(id).hidden=true;__G.S.p.hp=1e6;__G.zombies().length=0});
 await hide();console.log(cl,'в лагере [готов, музыка, шум]:',JSON.stringify(await st()));
 await p.evaluate(()=>{__G.P.x=__G.CX+700;__G.P.y=__G.CY});await hide();await p.waitForTimeout(500);console.log(cl,'в лесу:',JSON.stringify(await st()));
 await p.evaluate(()=>{__G.S.clock=1e9});await p.waitForTimeout(100);
 // умения
 for(const k of ['KeyC','KeyR','Space','Digit1']){await p.keyboard.press(k);await p.waitForTimeout(300)}
 if(cl==='warrior'){await p.click('#cfgBtn');await p.waitForTimeout(400);await p.screenshot({path:path.join(OUT,'v51_sound.png')});
   for(const code of ['m:night','c:6','e:anvil','f:whirl','f:mjolnir','m:stop']){await p.click(`[data-snd="${code}"]`);await p.waitForTimeout(150)}
   await p.$eval('[data-vol="m"]',el=>{el.value='0.2';el.dispatchEvent(new Event('input',{bubbles:true}))});console.log('громкость музыки сохранена:',await p.evaluate(()=>localStorage.getItem('lumber-camp2-vol')));
   await p.keyboard.press('Escape')}
 const fps=await p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(Math.round(n/2))};requestAnimationFrame(f)}));console.log(cl,'кадров с музыкой:',fps);
 await c.close()}
 await b.close();console.log(errs?'FAILED '+errs:'v51 ok')})();
