// v47: старец Ермолай в лагере, окно разговора, строка обучения, стрелка к цели, ночь, старое сохранение
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 const run=async(name,save,fn)=>{const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',name,e.message));
  await p.addInitScript(s=>{localStorage.setItem('lumber-camp2-save',JSON.stringify(Object.assign({v:12,worldV:12,seed:4242,lastSeen:Date.now()},s)))},save);
  await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);await fn(p);await c.close()};
 // 1. новая игра: старец с «!», строка обучения
 await run('new',{cls:'warrior',clock:20},async p=>{
  await p.evaluate(()=>{__G.P.x=__G.CX+10;__G.P.y=__G.CY+95});await p.waitForTimeout(400);
  await p.screenshot({path:path.join(OUT,'tut_camp.png')});
  await p.evaluate(()=>{__G.P.x=__G.CX+45;__G.P.y=__G.CY+60});await p.waitForTimeout(300);await p.keyboard.press('KeyE');await p.waitForTimeout(400);
  await p.screenshot({path:path.join(OUT,'tut_dialog.png')});
  await p.click('#tutBtns .main');await p.waitForTimeout(300);
  await p.evaluate(()=>{__G.P.x=__G.CX-500;__G.P.y=__G.CX-200;__G.S.p.hp=1e6});await p.waitForTimeout(500);
  await p.screenshot({path:path.join(OUT,'tut_tree.png')});
  // хижина вдалеке — стрелка у края
  await p.evaluate(()=>{const S=__G.S;S.stats.chopped=5;S.up.axe=2;S.stats.mined=3;S.base=2;S.fence.lvl=1;S.fence.hp=50;S.day=2;S.tut.step=6;S.tut.taken=true;__G.P.x=__G.CX;__G.P.y=__G.CY+60});await p.waitForTimeout(900);
  await p.screenshot({path:path.join(OUT,'tut_arrow.png')});
  await p.evaluate(()=>{__G.S.tut.step=11;__G.S.tut.taken=true});await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,'tut_edge.png')});
 });
 // 2. ночь: фонарь, «?»
 await run('night',{cls:'mage',clock:470,stats:{chopped:9}},async p=>{
  await p.evaluate(()=>{__G.P.x=__G.CX-20;__G.P.y=__G.CY+90;__G.S.p.hp=1e6});await p.waitForTimeout(700);
  await p.screenshot({path:path.join(OUT,'tut_night.png'),clip:{x:440,y:250,width:400,height:300}});
 });
 // 3. старое сохранение с прогрессом: сдать много шагов разом
 await run('old',{cls:'archer',clock:40,day:9,base:4,bow:5,up:{axe:8,pick:4,bag:3,boots:2,hp:6},fence:{lvl:3,hp:100},towers:[2,1,0,0,0,0],poi:{},stats:{chopped:300,mined:80,nights:8,moundsDone:2},bosses:{1:true},cryptRuns:1,quests:[]},async p=>{
  const st=await p.evaluate(()=>{const G=__G;const q=G.pois()[0];G.S.poi[q.id]=true;G.S.farms[q.id]={lvl:1,store:0,hp:50,road:false,broken:false,pal:0,tower:0};G.P.x=G.CX+45;G.P.y=G.CX+60;return [G.S.tut.step,G.S.quests.length,G.S.meta.tutDone]});console.log('old save',st);
  await p.waitForTimeout(300);await p.keyboard.press('KeyE');await p.waitForTimeout(400);
  await p.screenshot({path:path.join(OUT,'tut_old.png')});
  await p.click('#tutBtns .main');await p.waitForTimeout(400);
  console.log('after',await p.evaluate(()=>[__G.S.tut.step,__G.S.wood,__G.S.stone]));
  await p.screenshot({path:path.join(OUT,'tut_old2.png')});
 });
 await b.close()})();
