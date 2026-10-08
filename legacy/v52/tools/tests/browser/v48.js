// v48: обход всех окон и кнопок за каждый класс. Снимки окон, поиск слов про чужое оружие, ошибки страницы.
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
const W={bow:/(^|[^а-яё])(лук|лука|луком|луку|луке)([^а-яё]|$)|тетив|колчан|(^|[^а-яё])стрел(а|ы|у|ой|ою|е|ами|ам)?([^а-яёк]|$)|наконечник/i,hammer:/молот/i,staff:/посох/i,fire:/огненн[а-яё]* шар/i};
const FORBID={warrior:['bow','staff','fire'],mage:['bow','hammer'],archer:['hammer','staff','fire']};
const OK=[/Молот Громовержца/g,/Молот сам летит[^.\n]*/g,/Огненные стрелы/g,/Пни-стрелки/g,/[^.\n]*(башн|Башн|страж|Страж)[^.\n]*/g];
let bad=0,errs=0;
(async()=>{const b=await chromium.launch();
 for(const cl of ['warrior','mage','archer']){
  const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>{errs++;console.log('ERR',cl,e.message)});
  await p.addInitScript(cl=>{localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:cl,seed:4242,clock:20,lastSeen:Date.now(),day:6,lvl:12,base:5,bow:6,forge:true,wood:90000,stone:90000,iron:500,shards:500,keys:3,potions:2,potAtk:2,
    up:{axe:9,pick:5,bag:4,boots:3,hp:8},fence:{lvl:3,hp:60},towers:[2,1,1,0,0,0],meta:{ng:0,tutDone:1,relics:{hammer:2,frost:1,totem:1,mirror:1,storm:1,twin:2,boots:1,phoenix:1,wolf:2,sack:1,gather:2,steel:1},wins:1,relicPend:0,comp31:1,relicFix32:1},stats:{chopped:300,mined:80,kills:200,nights:5}}))},cl);
  await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1300);
  const texts=[];const grab=async(src)=>{texts.push([src,await p.evaluate(()=>document.body.innerText)])};
  await p.evaluate(()=>{const G=__G;G.S.p.hp=1e6;for(const sl of ['weapon','head','armor','legs','amulet','ring'])G.S.eq[sl]=G.makeItem(4,3,sl);G.S.inv.push(G.makeItem(3,2,'weapon'),G.makeItem(3,3,'ring'));document.getElementById('dawn').hidden=true;document.querySelectorAll('.comp,#comp').forEach(e=>e.remove())});
  await p.waitForTimeout(300);await grab('экран');await p.screenshot({path:path.join(OUT,`a_${cl}_hud.png`)});
  // меню: все вкладки, все кнопки
  const tabs=[];
  for(const open of ['KeyB','KeyI','cfg']){
  if(open==='cfg')await p.click('#cfgBtn');else await p.keyboard.press(open);await p.waitForTimeout(300);
  const tb=await p.$$eval('#tabs [data-tab]',a=>a.map(x=>x.dataset.tab));tabs.push(...tb);
  for(const t of tb){await p.click(`#tabs [data-tab="${t}"]`);await p.waitForTimeout(250);await grab('меню '+t);
    await p.screenshot({path:path.join(OUT,`a_${cl}_tab_${t}.png`)});
    if(t==='save')continue;
    const n=await p.$$eval('#list [data-act]',a=>a.length);
    for(let i=0;i<n;i++){const ok=await p.evaluate(i=>{const b=document.querySelectorAll('#list [data-act]')[i];if(!b||b.disabled)return false;b.click();return true},i);if(ok)await p.waitForTimeout(30)}
    await grab('меню '+t+' после кнопок')}
  await p.keyboard.press('Escape');await p.waitForTimeout(200)}
  // окно умений, реликвии
  await p.evaluate(()=>{__G.S.perkPend=1;__G.showPerks()});await p.waitForTimeout(250);await grab('умения');await p.screenshot({path:path.join(OUT,`a_${cl}_perks.png`)});
  await p.click('#perkList .perk');await p.waitForTimeout(200);
  // кнопки внизу и вверху
  for(const id of ['dashBtn','wpnBtn','potBtn','atkBtn']){await p.evaluate(id=>{const e=document.getElementById(id);if(e&&!e.hidden)e.click()},id);await p.waitForTimeout(120);await grab('кнопка '+id)}
  for(const k of ['KeyC','KeyV','Digit1','Digit2','Digit3','KeyR','KeyR']){await p.keyboard.press(k);await p.waitForTimeout(150);await grab('клавиша '+k)}
  await p.$$eval('#relicBar [data-relic-use]',a=>a.forEach(x=>x.click()));await p.waitForTimeout(200);await grab('панель реликвий');
  await p.click('#questHead');await p.waitForTimeout(100);await p.click('#questHead');
  await p.keyboard.press('KeyK');await p.waitForTimeout(400);await grab('карта');await p.keyboard.press('Escape');await p.waitForTimeout(200);
  // дракон: в воздухе
  const dr=await p.evaluate(()=>{const G=__G;const L=G.lairs().find(l=>l.zone===5);if(!L)return null;G.zombies().length=0;G.P.x=L.x;G.P.y=L.y+90;const d=G.makeBoss(5);d.x=L.x;d.y=L.y;d.engaged=true;d.speed=0;d.dmg=0;d.fly=false;d.phT=0.05;G.zombies().push(d);return 1});
  if(dr){await p.waitForTimeout(500);await grab('дракон');await p.screenshot({path:path.join(OUT,`a_${cl}_dragon.png`),clip:{x:340,y:150,width:600,height:440}});
    const fl=await p.evaluate(()=>__G.floats.map(f=>f.text).join('\n'));texts.push(['надписи над головой',fl])}
  // склеп: притвор и врата
  await p.evaluate(()=>{const G=__G;G.zombies().length=0;const c=G.crypts()[0];G.S.crypts={};G.enterCrypt(c);G.P.x=G.DG.gate.x-60;G.P.y=G.DG.gate.y});await p.waitForTimeout(500);
  await grab('притвор');await p.screenshot({path:path.join(OUT,`a_${cl}_foyer.png`)});
  // проверка слов
  for(const [src,t0] of texts){let t=t0;for(const r of OK)t=t.replace(r,'');for(const f of FORBID[cl])if(W[f].test(t)){const i=Math.max(0,t.search(W[f])-50);bad++;console.log(`FAIL [${cl}] ${src}: …${t.slice(i,i+110).replace(/\n/g,' | ')}…`)}}
  console.log(cl,'вкладок',tabs.length,'текстов',texts.length);
  await c.close()}
 await b.close();console.log(bad||errs?`FAILED слов ${bad}, ошибок страницы ${errs}`:'browser class texts ok')})();
