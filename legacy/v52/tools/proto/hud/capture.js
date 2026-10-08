// фон для эскиза HUD: игра без панелей + настоящие значки реликвий + портреты героев
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),OUT=__dirname;
(async()=>{const b=await chromium.launch();const data={};
 for(const cl of ['mage','warrior','archer']){
  const c=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:2});const p=await c.newPage();
  await p.addInitScript(cl=>{localStorage.setItem('lumber-camp-save',JSON.stringify({v:12,worldV:12,cls:cl,seed:4242,clock:60,lastSeen:Date.now(),day:14,lvl:23,base:5,bow:9,keys:3,potions:3,potAtk:2,wood:2450,stone:830,iron:64,shards:120,bag:12,bagStone:5,
    up:{axe:12,pick:6,bag:5,boots:4,hp:10},fence:{lvl:4,hp:60},towers:[3,2,2,1,0,0],meta:{ng:2,tutDone:1,relics:{hammer:2,frost:2,totem:1,mirror:1,storm:2,twin:2,boots:1,phoenix:1,wolf:2,sack:1,gather:3,steel:2,heart:2,flask:1,seek:2,keyr:1,vet:1,fort:1,hoard:2},wins:2,relicPend:0,comp31:1,relicFix32:1}}))},cl);
  await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1400);
  await p.evaluate(()=>{const G=__G;G.S.p.hp=Math.round(G.S.p.hp*0.72);document.getElementById('dawn').hidden=true;G.zombies().length=0;for(const sl of ['head','armor','legs'])G.S.eq[sl]=G.makeSetItem(G.S.cls,sl,4)});
  await p.waitForTimeout(500);
  if(cl==='mage'){data.relic=await p.evaluate(()=>document.getElementById('relicBar').outerHTML);data.css=await p.evaluate(()=>[...document.styleSheets].map(s=>{try{return [...s.cssRules].map(r=>r.cssText).join('\n')}catch(e){return ''}}).join('\n'));
    await p.addStyleTag({content:'#stats,#relicBar,#quests,#toasts,#help,#clock,.btns,#prompt{visibility:hidden!important}'});await p.waitForTimeout(200);
    await p.screenshot({path:path.join(OUT,'bg.png')})}
  // портрет: крупный план героя
  await p.addStyleTag({content:'.hud,#relicBar,#help,.btns,#mini{visibility:hidden!important}'});
  await p.screenshot({path:path.join(OUT,`face_${cl}.png`),clip:{x:618,y:362,width:44,height:44}});
  await c.close()}
 fs.writeFileSync(path.join(OUT,'data.json'),JSON.stringify(data));await b.close()})();
