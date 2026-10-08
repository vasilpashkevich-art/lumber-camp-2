// v43: постройки в новом облике — лагерь на разных уровнях днём и ночью, хутора, склеп, портал, торговец
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
const base=(lvl,extra)=>Object.assign({v:12,worldV:12,cls:'warrior',seed:4242,clock:20,lastSeen:Date.now()-5000,day:9,wood:3000,stone:900,iron:5,forge:lvl>=4,base:lvl,hq:9999,houses:lvl>=4?13:0,jobs:{wood:5,stone:3,guard:lvl>=4?5:0},
  fence:{lvl:lvl>=2?(lvl-1)*2:0,hp:9999},towers:lvl>=3?[Math.min(6,lvl),Math.min(6,lvl),lvl-2,lvl-2,lvl-3,lvl-3]:[0,0,0,0,0,0],def:{moat:lvl>=3?2:0,traps:lvl>=3?2:0,tu:Array(20).fill(12),ball:lvl>=4?[3,2]:[0,0],bowl:lvl>=5?[2,2,1,1]:[0,0,0,0],guard:Math.max(1,lvl-2),shop:lvl>=4?2:0},
  up:{axe:9,pick:1,bag:1,boots:2,hp:30},meta:{ng:0,relics:{},wins:0,relicPend:0,comp31:1,relicFix32:1}},extra||{});
(async()=>{const b=await chromium.launch();
 const shot=async(name,save,fn,clip)=>{const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',name,e.message));
   await p.addInitScript(s=>{localStorage.setItem('lumber-camp2-save',JSON.stringify(s));localStorage.setItem('lumber-camp2-q','1')},save);
   await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(900);
   await p.evaluate(()=>{for(const id of ['perks','dawn'])document.getElementById(id)&&(document.getElementById(id).hidden=true)});
   if(fn)await p.evaluate(fn);await p.waitForTimeout(600);await p.screenshot({path:path.join(OUT,name+'.png'),clip});await c.close()};
 const cam=()=>{const G=__G;G.zombies().length=0;G.P.x=G.P.x;G.P.y=G.P.y+150};
 for(const l of [1,3,4,5,6])await shot('v43_camp'+l,base(l),cam,{x:290,y:60,width:700,height:640});
 await shot('v43_camp6_night',base(6,{clock:160}),cam,{x:290,y:60,width:700,height:640});
 await shot('v43_ruins',base(6,{hq:0}),cam,{x:390,y:180,width:500,height:360});
 // мир: хутора, склеп, портал, могильник, торговец
 const W=base(6,{farms:{'1-0':{lvl:3,store:40,storeS:20,hp:300,road:true,broken:false,pal:2,tower:2,mode:'wood'},'1-1':{lvl:1,store:5,hp:0,road:false,broken:true,pal:0,tower:0,mode:'wood'},'2-0':{lvl:2,store:10,hp:300,road:false,broken:false,pal:3,tower:1,mode:'stone'}},merchant:9});
 const at=(q)=>`(()=>{const G=__G;G.zombies().length=0;const o=${q};G.P.x=o.x;G.P.y=o.y+110})()`;
 for(const [n,q] of [['farm3',"G.pois().find(q=>q.id==='1-0')"],['farmbroken',"G.pois().find(q=>q.id==='1-1')"],['farm2',"G.pois().find(q=>q.id==='2-0')"],['hut',"G.pois().find(q=>q.kind==='hut'&&!['1-0','1-1'].includes(q.id))"],['ruinspoi',"G.pois().find(q=>q.kind!=='hut'&&q.id!=='2-0')"],['crypt',"G.crypts()[0]"],['mound',"G.mounds()[0]"],['merchant',"({x:G.P.x+92,y:G.P.y-40+56})"]])
   await shot('v43_'+n,W,at(q),{x:390,y:150,width:500,height:420});
 await b.close()})();
