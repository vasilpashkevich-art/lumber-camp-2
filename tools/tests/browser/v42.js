// v42: новые облики мертвецов и боссов прямо в игре
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('xs')){localStorage.setItem('xs',1);localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:'mage',seed:4242,clock:20,lastSeen:Date.now()-5000,up:{axe:9,pick:1,bag:1,boots:2,hp:30},meta:{ng:0,relics:{},wins:0,relicPend:0,comp31:1,relicFix32:1}}))}localStorage.setItem('lumber-camp2-q','1')});
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
 const setup=async(fn,arg)=>{await p.evaluate(fn,arg);await p.waitForTimeout(700)};
 // рядовые: 4 вида × 7 ярусов
 await setup(()=>{const G=__G;G.S.p.hp=1e6;const ox=G.P.x+900,oy=G.P.y;G.P.x=ox;G.P.y=oy+240;G.zombies().length=0;
   const kinds=[null,'runner','ram','spitter'];kinds.forEach((k,i)=>{for(let t=1;t<=7;t++){const z=G.makeZombie(t,ox-480+t*120,oy-170+i*110,false,null,k||undefined);z.speed=0;z.dmg=0;z.spitT=999;z.canChase=false;if(t%3===0){z.hp=z.max*0.6}G.zombies().push(z)}})});
 await p.screenshot({path:path.join(OUT,'v42_mobs.png')});
 // края
 await setup(()=>{const G=__G;const ox=G.P.x,oy=G.P.y-60;G.zombies().length=0;['snow','marsh','shroom','waste','high','mist'].forEach((bm,i)=>{for(const [k,dy] of [[null,0],['runner',90]]){const z=G.makeZombie(4,ox-350+i*140,oy-60+dy,false,null,k||undefined);z.biome=bm;z.speed=0;z.dmg=0;z.canChase=false;G.zombies().push(z)}})});
 await p.screenshot({path:path.join(OUT,'v42_biomes.png'),clip:{x:180,y:150,width:920,height:400}});
 // боссы
 const bosses=[[1,'slime'],[2,'treant'],[3,'hydra'],[4,'croc'],[5,'dragon'],[6,'golem'],[7,'lich'],[9,'yeti']];
 for(let g=0;g<2;g++){await setup(([L])=>{const G=__G;const ox=G.P.x,oy=G.P.y-90;G.zombies().length=0;L.forEach(([id,sk],i)=>{const zn=G.S&&[0,1,2,3,4,5,6,7,0,6][id];const z=G.makeZombie(zn||6,ox-420+i*280,oy,false,null);z.guard=true;z.skin=sk;z.r=[0,12,13,15,17,19,20,22,0,20][id]*2;z.name=['','Королева слизи','Древень','Двуглавая гидра','Болотный ящер','Крылатый змей','Пепельный голем','Царь Мор','','Ледяной великан'][id];z.speed=0;z.dmg=0;z.charge=0;z.slam=0;z.abT=999;z.hx=z.x;z.hy=z.y;z.leash=0;G.zombies().push(z)})},[bosses.slice(g*4,g*4+4)]);
   await p.evaluate(()=>{for(const z of __G.zombies()){z.update0=1}});await p.screenshot({path:path.join(OUT,`v42_bosses${g+1}.png`)})}
 // Владыка, мимик, слизнячок
 await setup(()=>{const G=__G;const ox=G.P.x,oy=G.P.y-90;G.zombies().length=0;let z=G.makeZombie(7,ox-250,oy,false,null);z.guard=true;z.final=true;z.r=46;z.skin='lord';z.name='Владыка Мора';z.speed=0;z.dmg=0;z.charge=0;z.slam=0;z.abT=999;z.hx=z.x;z.hy=z.y;G.zombies().push(z);
   z=G.makeZombie(3,ox+80,oy+40,false,null);z.mimic=true;z.skin='mimic';z.r=16;z.speed=0;z.dmg=0;z.canChase=false;G.zombies().push(z);z=G.makeZombie(2,ox+220,oy+40,false,null);z.skin='slimelet';z.r*=0.8;z.speed=0;z.dmg=0;z.canChase=false;G.zombies().push(z)});
 await p.screenshot({path:path.join(OUT,'v42_lord.png')});
 await b.close()})();
