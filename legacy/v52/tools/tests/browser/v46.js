// v46: герой в комплекте (3 класса), способности комплекта в деле, вещи комплекта в сумке
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 for(const cl of ['warrior','mage','archer']){
  const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.addInitScript(cl=>{localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:cl,seed:4242,clock:20,lastSeen:Date.now(),up:{axe:9,pick:1,bag:1,boots:2,hp:30},meta:{ng:0,relics:{hammer:1},wins:1,relicPend:0,comp31:1,relicFix32:1}}));localStorage.setItem('lumber-camp2-q','1')},cl);
  await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
  await p.evaluate(cl=>{const G=__G;G.S.p.hp=1e6;for(const sl of ['head','armor','legs'])G.S.eq[sl]=G.makeSetItem(cl,sl,4);G.S.inv.push(G.makeSetItem(cl,'head',5));G.zombies().length=0;G.P.x+=700;
    for(const [dx,dy] of [[180,-20],[210,15],[195,40],[230,-10],[-160,30]]){const z=G.makeZombie(3,G.P.x+dx,G.P.y+dy,false,null);z.hp=z.max=1e4;z.speed=0;z.dmg=0;z.chasing=true;z.canChase=true;z.hx=z.x;z.hy=z.y;G.zombies().push(z)}},cl);
  await p.waitForTimeout(300);
  if(cl!=='mage')await p.keyboard.press('KeyV');
  await p.waitForTimeout(cl==='mage'?250:350);
  await p.screenshot({path:path.join(OUT,`set_${cl}.png`),clip:{x:340,y:180,width:600,height:440}});
  await p.screenshot({path:path.join(OUT,`set_${cl}_bar.png`),clip:{x:440,y:60,width:400,height:80}});
  if(cl==='warrior'){await p.keyboard.press('KeyI');await p.waitForTimeout(300);await p.click('[data-tab="items"]');await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,'set_inv.png'),fullPage:true})}
  await c.close()}
 await b.close()})();
