// v49: верхняя полоса и портрет на разных экранах (1280, 1920, телефон), окна Персонаж и Лагерь
const {chromium,devices}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();let errs=0;
 const save=cl=>({v:12,worldV:12,cls:cl,seed:4242,clock:20,day:9,lvl:15,base:4,bow:5,wood:2400,stone:800,iron:40,shards:60,keys:2,potions:2,up:{axe:8,pick:4,bag:4,boots:3,hp:6},meta:{ng:2,tutDone:1,relics:{hammer:2,frost:1,totem:1,mirror:1,storm:1,twin:2,boots:1,phoenix:1,wolf:2,sack:1,gather:2,steel:1,heart:1,seek:1,keyr:1},wins:2,relicPend:0,comp31:1,relicFix32:1}});
 for(const [name,opt] of [['1920',{viewport:{width:1920,height:1080}}],['phone',{...devices['iPhone 13']}],['1280',{viewport:{width:1280,height:800}}]]){
  const c=await b.newContext(opt);const p=await c.newPage();p.on('pageerror',e=>{errs++;console.log('ERR',name,e.message)});
  await p.addInitScript(s=>localStorage.setItem('lumber-camp2-save',JSON.stringify(s)),save(name==='phone'?'archer':'warrior'));
  await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1300);
  await p.screenshot({path:path.join(OUT,`v49_${name}.png`)});
  if(name==='1280'){
   await p.click('#pfBtn');await p.waitForTimeout(300);const t1=await p.$$eval('#tabs [data-tab]',a=>a.map(x=>x.textContent));console.log('портрет → ',await p.textContent('#menuTitle'),t1.join(', '));
   await p.screenshot({path:path.join(OUT,'v49_hero_menu.png')});await p.keyboard.press('KeyI');await p.waitForTimeout(200);console.log('I ещё раз закрывает:',await p.evaluate(()=>document.getElementById('menu').hidden));
   await p.keyboard.press('KeyB');await p.waitForTimeout(300);const t2=await p.$$eval('#tabs [data-tab]',a=>a.map(x=>x.textContent));console.log('B → ',await p.textContent('#menuTitle'),t2.join(', '));
   await p.screenshot({path:path.join(OUT,'v49_camp_menu.png')});
   await p.keyboard.press('KeyI');await p.waitForTimeout(300);console.log('из Лагеря клавиша I → ',await p.textContent('#menuTitle'));
   await p.click('#closeBtn');await p.click('#heroBtn');await p.waitForTimeout(200);console.log('кнопка Персонаж → ',await p.textContent('#menuTitle'));
   await p.click('#closeBtn');await p.click('#cfgBtn');await p.waitForTimeout(200);console.log('⚙ → ',await p.textContent('#menuTitle'));
   const s0=await p.evaluate(()=>document.getElementById('sndBtn').textContent);await p.click('#list [data-act="sound"]');await p.waitForTimeout(100);console.log('звук:',s0,'→',await p.evaluate(()=>document.getElementById('sndBtn').textContent))}
  await c.close()}
 await b.close();console.log(errs?'FAILED '+errs:'v49 ok')})();
